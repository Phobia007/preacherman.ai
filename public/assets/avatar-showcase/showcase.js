import { observeComponentActivity } from '../component-activity.js';
// Content substitution on digestMain. The original .riv file owns all six
// card transforms; its middle scene is never advanced into or displayed.
export const AVATARS = [
  {id:'cortana',name:'Cortana',slot:'rive_digest_8',runs:[14,13,15,16],description:'An insightful, loyal AI ally.',limit:'Grow AOV and bring buyers back'},
  {id:'masterchief',name:'Master Chief',slot:'rive_digest_5',runs:[10,9,11,12],description:'Steady, silent. Always dependable.',limit:'From foot traffic to omnichannel growth'},
  {id:'pathfinder',name:'Pathfinder',slot:'sidekick_digest_1',runs:[4,5,6,7],description:'A friendly explorer, full of curiosity.',limit:'New year momentum: convert, bundle, and scale'},
  {id:'magik',name:'Magik',slot:'rive_digest_6',runs:[18,17,19,20],description:'Sharp, guarded, independent.',limit:'Own the spring cleaning rush'},
  {id:'jubilee',name:'Jubilee',slot:'rive_digest_7',runs:[22,21,23,24],description:'Bold, playful, full of life.',limit:'Fix stockouts, unlock smarter growth'},
  {id:'clove',name:'Clove',slot:'rive_digest_9',runs:[26,25,27,28],description:'Playful and curious. Independent at heart.',limit:'Restock, retain, and raise the value of every order'},
];
export const CARD_SECONDS = 4;
export const GALLERY_SECONDS = 6;
export function avatarTextMap(original) {
  const map = {...original};
  for (const avatar of AVATARS) {
    const [name,tag,description,cta] = avatar.runs;
    map[`digestMain/rivePulseTextRun${name}`] = avatar.name;
    map[`digestMain/rivePulseTextRun${tag}`] = '\u200b';
    map[`digestMain/rivePulseTextRun${description}`] = avatar.description;
    map[`digestMain/rivePulseTextRun${cta}`] = 'Meet '+avatar.name;
  }
  return map;
}
export function createAvatarAssetLoader(runtime) {
  const pending = [];
  let disposed = false;
  const controller = new AbortController();
  return {pending, dispose(){disposed=true;controller.abort();}, load(asset) {
    const name = asset.name.toLowerCase().replace(/\.(png|webp|jpg)$/,'');
    const avatar = AVATARS.find(a => name === a.slot+'-desktop' || name === a.slot+'-mobile');
    const url = asset.isFont ? '/assets/reference/Inter-a6e7ae2.txt' : avatar ? `/assets/avatar-showcase/${avatar.id}.jpg` : null;
    if (!url) return false;
    pending.push(fetch(url,{signal:controller.signal}).then(response => {
      if (!response.ok) throw new Error('Avatar asset unavailable: '+url);
      return response.arrayBuffer();
    }).then(bytes => (asset.isFont ? runtime.decodeFont : runtime.decodeImage)(new Uint8Array(bytes))).then(decoded => {
      if (!disposed) { if (asset.isFont) asset.setFont(decoded); else asset.setRenderImage(decoded); }
      decoded.unref();
    }).catch(error=>{if(error.name!=="AbortError")throw error;}));
    return true;
  }};
}
export function installAvatarShowcase(rive, artboard, element, assets, isMobile = false) {
  if (artboard !== 'digestMain' || !rive || !element) return;
  const machine = rive.animator?.stateMachines?.[0];
  if (!machine) return;
  const animation = rive.artboard.animationByName(isMobile ? 'mobile' : 'desktop');
  const spread = new rive.runtime.LinearAnimationInstance(animation, rive.artboard);
  if (!document.querySelector('link[data-avatar-showcase]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = '/assets/avatar-showcase/showcase.css';
    style.dataset.avatarShowcase = ''; document.head.append(style);
  }
  element.classList.add('avatar-showcase');
  const resize = new ResizeObserver(() => element.style.setProperty('--gallery-scale', element.clientWidth / 1016));
  resize.observe(element);
  element.setAttribute('aria-label', 'Meet Cortana, Master Chief, Pathfinder, Magik, Jubilee and Clove, then explore Gallery.');
  const frame = document.createElement('div');
  frame.className = 'avatar-showcase-gallery'; frame.setAttribute('aria-label', 'Preacherman Gallery');
  frame.setAttribute('aria-hidden', 'true');
  const status = document.createElement('span');
  status.className = 'avatar-showcase-status'; status.textContent = 'Loading avatars…'; status.setAttribute('role', 'status');
  element.append(frame, status);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const debug = new URLSearchParams(location.search).has('showcaseDebug');
  const advance = machine.advanceAndApply;
  let active = false, disposed = false, assetsReady = false, ready = false;
  let galleryReady = false, player = null, loading = false, generation = 0;
  let elapsed = 0, loops = 0, clock = 0, lastTick = 0, lastScene = '', lastActive = null;
  let sampleStart = 0, sampleCount = 0;
  element.dataset.avatarResources = 'idle';
  const running = () => active && !disposed && !reduced.matches;
  const send = (reset = false) => {
    const galleryActive = running() && ready && elapsed >= CARD_SECONDS;
    if (!player || (!reset && galleryActive === lastActive)) return;
    lastActive = galleryActive;
    player.update({ active: galleryActive, reset, time: Math.max(0, elapsed - CARD_SECONDS) });
  };
  const syncScene = () => {
    const scene = elapsed >= CARD_SECONDS ? 'gallery' : 'cards';
    if (scene !== lastScene) {
      lastScene = scene; element.dataset.avatarScene = scene;
      frame.setAttribute('aria-hidden', String(scene !== 'gallery'));
    }
    send();
    if (running() && ready && scene === 'cards') rive.play();
    else { rive.pause(); rive.stopRendering(); }
  };
  const stopClock = () => {
    cancelAnimationFrame(clock); clock = 0; lastTick = 0;
    element.dataset.avatarClock = 'stopped';
  };
  const maybeReady = () => {
    if (!assetsReady || (!reduced.matches && !galleryReady) || disposed) return;
    ready = true; status.hidden = true; element.dataset.avatarReady = 'true';
    if (reduced.matches) {
      spread.time = 1; spread.apply(1); rive.artboard.advance(0); rive.drawFrame();
    }
    syncScene();
  };
  const ensureGallery = async () => {
    if (player || loading || !running()) return;
    loading = true;
    const token = ++generation;
    element.dataset.avatarResources = 'loading';
    try {
      const { mountGallery } = await import('./gallery.js');
      if (disposed || token !== generation || !active) { loading = false; return; }
      const next = await mountGallery(frame, {
        onReady() { if (!disposed && token === generation) { galleryReady = true; maybeReady(); } },
        onError() { if (!disposed && token === generation) { status.hidden = false; status.textContent = 'Gallery could not load. Refresh to retry.'; } },
      });
      if (disposed || token !== generation) { next.dispose(); return; }
      player = next; loading = false; lastActive = null;
      element.dataset.avatarResources = 'resident'; send();
    } catch {
      if (!disposed && token === generation) { loading = false; status.textContent = 'Gallery could not load. Refresh to retry.'; }
    }
  };
  const tick = now => {
    clock = 0;
    if (!running()) return;
    const delta = lastTick ? (now - lastTick) / 1000 : 0;
    lastTick = now;
    if (ready) {
      const previousScene = elapsed >= CARD_SECONDS;
      elapsed += delta;
      if (elapsed >= CARD_SECONDS + GALLERY_SECONDS) {
        elapsed %= CARD_SECONDS + GALLERY_SECONDS; loops++;
        element.dataset.avatarLoop = String(loops); send(true);
      }
      if (previousScene !== (elapsed >= CARD_SECONDS)) syncScene();
      if (debug) {
        element.dataset.avatarTime = elapsed.toFixed(3);
        sampleCount++;
        if (now - sampleStart > 1000) {
          element.dataset.avatarFps = String(Math.round(sampleCount * 1000 / (now - sampleStart)));
          sampleStart = now; sampleCount = 0;
        }
      }
    }
    // Only this clock owns rendering: Gallery has no independent animation loop.
    player?.frame(now);
    clock = requestAnimationFrame(tick);
  };
  const startClock = () => {
    if (!clock && running()) {
      lastTick = 0; sampleStart = performance.now(); sampleCount = 0;
      element.dataset.avatarClock = 'running'; clock = requestAnimationFrame(tick);
    }
  };
  machine.advanceAndApply = function() {
    const result = advance.call(this, 0);
    spread.time = reduced.matches ? 1 : Math.min(elapsed / CARD_SECONDS, 1);
    spread.apply(1); return result;
  };
  const onPlay = () => {
    if (!running() || !ready || elapsed >= CARD_SECONDS) { rive.pause(); rive.stopRendering(); }
  };
  rive.on('play', onPlay);
  const release = () => {
    generation++; loading = false;
    player?.dispose(); player = null; galleryReady = false; ready = false;
    elapsed = 0; lastActive = null; delete element.dataset.avatarReady;
    element.dataset.avatarResources = 'released'; syncScene();
  };
  const unobserve = observeComponentActivity(element, {
    onActive(value) {
      active = value; element.dataset.avatarActive = String(value);
      player?.suspend(!value);
      if (value) { ensureGallery(); startClock(); }
      else stopClock();
      syncScene();
    },
    onRelease: release,
  });
  const onMotion = () => {
    if (reduced.matches) { stopClock(); release(); maybeReady(); }
    else { ready = false; ensureGallery(); startClock(); }
    syncScene();
  };
  reduced.addEventListener('change', onMotion);
  Promise.all(assets.pending).then(() => { assetsReady = true; maybeReady(); }).catch(() => {
    if (!disposed) status.textContent = 'Avatar images could not load. Refresh to retry.';
  });
  syncScene();
  return () => {
    disposed = true; generation++; stopClock(); unobserve(); resize.disconnect();
    reduced.removeEventListener('change', onMotion); rive.off('play', onPlay);
    player?.dispose(); machine.advanceAndApply = advance; spread.delete();
    frame.remove(); status.remove(); element.classList.remove('avatar-showcase');
  };
}
