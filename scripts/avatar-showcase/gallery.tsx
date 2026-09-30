// Presentation adapter: reuse the desktop scene, with a bounded website lifecycle.
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useFrame, useThree } from '@react-three/fiber';
import { GalleryOrbitCards } from '../../browser/apps/preacherman-demo-host/src/surfaces/gallery/GalleryOrbitCards';
import { InteractiveAvatarViewport } from '../../browser/packages/preacherman-avatar-renderer/src/InteractiveAvatarViewport';

const cardData = fetch('/assets/avatar-showcase/gallery-data.json').then(r => r.json());
type Playback = { active: boolean; time: number; reset: boolean };
export async function mountGallery(host: HTMLElement, callbacks: { onReady: () => void; onError: () => void }) {
  const cards = await cardData;
  const debug = new URLSearchParams(location.search).has('showcaseDebug');
  const inputs = new Set<(event: any) => void>();
  const bridge: any = {
    subscribeRail(fn: any) { fn(cards); return () => {}; },
    subscribe(fn: any) { fn({ phase: 'closed' }); return () => {}; },
    subscribeInput(fn: any) { inputs.add(fn); return () => inputs.delete(fn); },
    setRailCursor() {}, openProject() {},
  };
  const sendInput = (event: any) => inputs.forEach(fn => fn(event));
  const playback = { active: false, time: 0 };
  let warming = true, suspended = false, disposed = false, lastFrame = 0, nextFrame = 0;
  let update = (_message: Playback) => {};
  let draw: ((seconds: number) => void) | null = null;
  let frameCount = 0, reportTime = 0;

  function FrameDriver() {
    const { advance, clock, gl } = useThree();
    useEffect(() => {
      gl.domElement.dataset.showcaseDebug = String(debug);
      draw = seconds => advance(clock.elapsedTime + seconds, true);
      return () => { draw = null; };
    }, [advance, clock, gl]);
    return null;
  }
  function ScrollPlayback() {
    useFrame((_, delta) => {
      if (!playback.active) return;
      const next = Math.min(6, playback.time + delta);
      sendInput({ type: 'wheel', delta: (next - playback.time) * 620 });
      playback.time = next;
    }, -1);
    return null;
  }
  function PrepareCards() {
    const prepared = useRef(new WeakSet<object>());
    const settled = useRef(0);
    useFrame(({ scene, gl }) => {
      if (settled.current >= 3) return;
      let textures = 0, uploaded = false;
      // Upload at most one texture per frame so initial preparation yields to input.
      scene.getObjectByName('gallery-orbit')?.traverse((object: any) => {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material?.transparent && !material.forceSinglePass) {
            material.forceSinglePass = true; material.needsUpdate = true;
          }
          const texture = material?.map || material?.uniforms?.tMap?.value;
          if (!texture?.image?.width) continue;
          textures++;
          if (!uploaded && !prepared.current.has(texture)) {
            gl.initTexture(texture); prepared.current.add(texture); uploaded = true;
          }
        }
      });
      settled.current = !uploaded && textures >= Math.min(cards.length, 12) * 2 ? settled.current + 1 : 0;
      if (settled.current >= 3) gl.domElement.dataset.galleryPrepared = 'true';
    });
    return null;
  }
  function Readiness() {
    const settled = useRef(false);
    useFrame(({ gl }) => {
      if (settled.current) return;
      const state = JSON.parse(gl.domElement.dataset.galleryOrbit || '{}');
      const avatar = host.querySelector('[data-avatar-load-state="ready"]');
      if (avatar && gl.domElement.dataset.galleryPrepared && state.entry === 1 && state.visibleCards === state.readyCovers && state.readyCovers > 0) {
        settled.current = true; warming = false;
        gl.domElement.dataset.galleryReady = 'true';
        host.dataset.residentCards = String(Math.min(cards.length, 12));
        host.dataset.renderState = 'paused';
        callbacks.onReady();
      }
    });
    return null;
  }
  function Gallery() {
    const [playing, setPlaying] = useState(true);
    useEffect(() => {
      update = ({ time, active, reset }) => {
        // Website-only reset skips invisible reverse scrolling and GPU warm-up.
        if (reset) sendInput({ type: 'showcase-reset' });
        playback.time = Number.isFinite(time) ? time : 0;
        playback.active = active; lastFrame = 0; nextFrame = 0;
        setPlaying(active || warming);
        host.dataset.renderState = active ? 'playing' : warming ? 'preparing' : 'paused';
      };
      return () => { update = () => {}; };
    }, []);
    return <>
      <InteractiveAvatarViewport assetBaseUrl="/assets/avatars/cortana/" modelId="cortana" environment="cinematic" cameraFraming="portrait" renderActive={playing} quality="low"
        sceneContent={<><FrameDriver /><ScrollPlayback /><PrepareCards /><GalleryOrbitCards bridge={bridge} active renderActive={playing} /><Readiness /></>}
        onError={callbacks.onError} />
      <div className="gallery-menu" aria-hidden="true">☰</div>
      <div className="gallery-caption"><span>GALLERY</span><p>Find your companion.</p></div>
    </>;
  }
  const root = createRoot(host);
  root.render(<Gallery />);
  return {
    update: (message: Playback) => update(message),
    suspend(value: boolean) { suspended = value; lastFrame = 0; nextFrame = 0; },
    frame(now: number) {
      if (disposed || suspended || (!warming && !playback.active) || !draw) return;
      // Prepare at 30 fps; visible playback may use each display frame (up to 60).
      // Inactive components never call advance, rather than being throttled forever.
      const interval = 1000 / (warming ? 30 : 60);
      if (nextFrame && now < nextFrame - .5) return;
      const delta = lastFrame ? Math.min(.1, (now - lastFrame) / 1000) : interval / 1000;
      lastFrame = now;
      nextFrame = nextFrame ? Math.max(nextFrame + interval, now) : now + interval;
      draw(delta);
      if (debug) {
        frameCount++;
        if (now - reportTime >= 1000) {
          host.dataset.renderFrames = String(frameCount); reportTime = now;
        }
      }
    },
    dispose() {
      disposed = true; draw = null; inputs.clear(); root.unmount();
      delete host.dataset.residentCards; host.dataset.renderState = 'released';
    },
  };
}
