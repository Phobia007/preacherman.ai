import { r as React, j as jsx } from './runtime/components-BdJai906.js';
import { u as useThree, d as useFrame, an as TextureLoader, a as loading } from './runtime/Background-CGKUhMwd.js';
import { a as scenes, u as preferences, b as loadingUI } from './runtime/(_locale).editions.winter2026-DhFtUF58.js';

// A fixed oil painting inside the native scene target preserves the original burn transitions.
export function Scene04Background({ sectionIndex }) {
  const { size } = useThree();
  const material = React.useRef();
  const state = React.useRef();
  React.useEffect(() => {
    const holder = document.createElement('div');
    holder.hidden = true;
    holder.dataset.scene04Media = '';
    holder.setAttribute('aria-hidden', 'true');
    holder.dataset.backgroundType = 'image';
    document.body.append(holder);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const clip = { holder, reduced, texture: null, ready: false, disposed: false };
    const finish = () => {
      if (clip.disposed) return;
      clip.ready = true;
      holder.dataset.ready = 'true';
      loading.getState().finishLoading(sectionIndex, 'scene04-background');
      if (scenes.getState().activeSection === sectionIndex && loading.getState().isSceneLoaded(sectionIndex)) loadingUI.getState().setIsLoaded(true);
    };
    loading.getState().startLoading(sectionIndex, 'scene04-background');
    clip.texture = new TextureLoader().load('/assets/oil-backgrounds/scene04-oil-still.png', finish);
    state.current = clip;
    return () => {
      clip.disposed = true;
      clip.texture.dispose(); holder.remove(); state.current = null;
    };
  }, [sectionIndex]);
  useFrame(() => {
    const clip = state.current, shader = material.current;
    if (!clip || !shader) return;
    const reduced = clip.reduced.matches || preferences.getState().preferReducedMotion;
    const section = document.getElementById('agentic');
    const progress = section ? Math.max(0, Math.min(1, -section.getBoundingClientRect().top / Math.max(size.height, section.offsetHeight - size.height))) : 0;
    const zoom = reduced ? 1 : 1.2 - .2 * (progress * progress * (3 - 2 * progress));
    shader.uniforms.uZoom.value = zoom;
    shader.uniforms.uAspect.value = size.width / size.height;
    shader.uniforms.tMap.value = clip.texture;
    clip.holder.dataset.zoom = zoom.toFixed(4);
    clip.holder.dataset.progress = progress.toFixed(4);
  });
  const uniforms = React.useMemo(() => ({ tMap: { value: null }, uZoom: { value: 1.2 }, uAspect: { value: size.width / size.height } }), []);
  return jsx.jsxs('mesh', { frustumCulled: false, renderOrder: -1000, children: [
    jsx.jsx('planeGeometry', { args: [2, 2] }),
    jsx.jsx('shaderMaterial', { ref: material, uniforms, depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.0);}',
      fragmentShader: 'uniform sampler2D tMap; uniform float uZoom; uniform float uAspect; varying vec2 vUv; void main(){float a=16.0/9.0;vec2 cover=vec2(min(uAspect/a,1.0),min(a/uAspect,1.0));vec2 uv=(vUv-.5)*cover/uZoom+.5;gl_FragColor=vec4(pow(texture2D(tMap,uv).rgb,vec3(2.2))*.58,1.0);}' })
  ] });
}
