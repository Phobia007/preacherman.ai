import { r as React, j as jsx } from './runtime/components-BdJai906.js';
import { u as useThree, d as useFrame, an as TextureLoader, a as loading } from './runtime/Background-CGKUhMwd.js';
import { a as scenes, b as loadingUI, u as preferences } from './runtime/(_locale).editions.winter2026-DhFtUF58.js';

// Both layers live inside the native scene so the existing burn compositor
// includes the character, panel, and surrounding landscape in one transition.
export function ContinuityCharacter({ sectionIndex, staticMode = false }) {
  const { size } = useThree();
  const portrait = React.useRef(), panel = React.useRef(), clip = React.useRef();
  const uniforms = React.useMemo(() => ({
    tPortrait: { value: null }, tBlink: { value: null }, uBlink: { value: 0 }, uReady: { value: 0 },
    uDimensions: { value: [1, 1] }, uCenter: { value: [0, 0] }, uZoom: { value: 1 }
  }), []);
  const panelUniforms = React.useMemo(() => ({
    uDimensions: { value: [1, 1] }, uCenter: { value: [0, 0] }, uZoom: { value: 1 }
  }), []);
  React.useEffect(() => {
    let disposed = false;
    const token = 'continuity-zima', media = matchMedia('(prefers-reduced-motion: reduce)');
    const state = { media, textures: [], section: null, ready: false };
    clip.current = state;
    loading.getState().startLoading(sectionIndex, token);
    const finish = () => {
      loading.getState().finishLoading(sectionIndex, token);
      if (scenes.getState().activeSection === sectionIndex && loading.getState().isSceneLoaded(sectionIndex)) loadingUI.getState().setIsLoaded(true);
    };
    const load = name => new TextureLoader().loadAsync(`/assets/continuity/${name}`).then(texture => {
      if (disposed) { texture.dispose(); return null; }
      texture.anisotropy = 4;
      state.textures.push(texture);
      return texture;
    });
    Promise.all([load('zima-open.png'), load('zima-blink.png')]).then(([open, blink]) => {
      if (disposed) return;
      uniforms.tPortrait.value = open;
      uniforms.tBlink.value = blink;
      uniforms.uReady.value = 1;
      state.ready = true;
      finish();
      document.documentElement.dataset.continuityCharacterReady = 'true';
    }).catch(error => { if (!disposed) { finish(); console.error('Unable to load the Continuity portrait', error); } });
    return () => {
      disposed = true;
      for (const texture of state.textures) texture.dispose();
      clip.current = null;
      delete document.documentElement.dataset.continuityCharacterReady;
    };
  }, [sectionIndex, uniforms]);
  React.useEffect(() => {
    const mobile = size.width < 700, centerX = mobile ? 0 : .12;
    const panelHeight = size.height * .88;
    const panelWidth = mobile ? size.width * .92 : Math.min(size.width * .70, panelHeight * 1.14);
    panelUniforms.uDimensions.value = [panelWidth / size.width * 2, panelHeight / size.height * 2];
    panelUniforms.uCenter.value = [centerX, -.02];
    const portraitHeight = size.height * (mobile ? 1.13 : 1.30);
    uniforms.uDimensions.value = [portraitHeight * (2 / 3) / size.width * 2, portraitHeight / size.height * 2];
    uniforms.uCenter.value = [centerX, mobile ? -.31 : -.39];
  }, [size.width, size.height, uniforms, panelUniforms]);
  useFrame(({ clock }) => {
    const state = clip.current;
    if (!state?.ready) return;
    state.section ||= document.getElementById('shop-app');
    const reduced = state.media.matches || preferences.getState().preferReducedMotion;
    const section = state.section;
    let progress = section ? Math.max(0, Math.min(1, -section.getBoundingClientRect().top / Math.max(innerHeight, section.offsetHeight - innerHeight))) : 0;
    progress = progress * progress * (3 - 2 * progress);
    const zoom = reduced ? 1 : 1 + progress * .18;
    uniforms.uZoom.value = zoom;
    panelUniforms.uZoom.value = reduced ? 1 : 1 + progress * .12;
    const phase = (clock.elapsedTime + 1.7) % 5.7;
    const active = scenes.getState().activeSection >= sectionIndex - 1 && !document.hidden;
    const blink = reduced || staticMode || !active ? 0 : phase < .085 ? phase / .085 : phase < .135 ? 1 : phase < .26 ? 1 - (phase - .135) / .125 : 0;
    uniforms.uBlink.value = blink;
    if (portrait.current) Object.assign(portrait.current.userData, { zoom, blink });
    if (panel.current) panel.current.userData.zoom = panelUniforms.uZoom.value;
  });
  const vertex = `varying vec2 vUv;uniform vec2 uDimensions;uniform vec2 uCenter;uniform float uZoom;
    void main(){vUv=uv;vec2 p=position.xy*uDimensions+uCenter;vec2 anchor=vec2(uCenter.x,.70);p=(p-anchor)*uZoom+anchor;gl_Position=vec4(p,0.0,1.0);}`;
  const portraitFragment = `varying vec2 vUv;uniform sampler2D tPortrait;uniform sampler2D tBlink;uniform float uBlink;uniform float uReady;
    void main(){if(uReady<.5)discard;vec4 c=texture2D(tPortrait,vUv);if(c.a<.025)discard;
      float left=1.0-smoothstep(.65,1.0,length((vUv-vec2(.466,.912))/vec2(.021,.010)));
      float right=1.0-smoothstep(.65,1.0,length((vUv-vec2(.515,.912))/vec2(.021,.010)));
      c.rgb=mix(c.rgb,texture2D(tBlink,vUv).rgb,max(left,right)*uBlink);
      gl_FragColor=vec4(pow(c.rgb,vec3(2.2))*.90,c.a);}`;
  const panelFragment = `varying vec2 vUv;
    void main(){float grain=fract(sin(dot(vUv,vec2(127.1,311.7)))*43758.5453);vec3 blue=vec3(.0706,.4706,.7608)*(1.0+(grain-.5)*.022);gl_FragColor=vec4(pow(blue,vec3(2.2)),1.0);}`;
  return jsx.jsxs(jsx.Fragment, { children: [
    jsx.jsxs('mesh', { ref: panel, name: 'continuity-azure-panel', renderOrder: 10, frustumCulled: false, children: [
      jsx.jsx('planeGeometry', { args: [1, 1] }),
      jsx.jsx('shaderMaterial', { uniforms: panelUniforms, vertexShader: vertex, fragmentShader: panelFragment, transparent: true, depthTest: false, depthWrite: false })
    ] }),
    jsx.jsxs('mesh', { ref: portrait, name: 'continuity-zima-portrait', renderOrder: 11, frustumCulled: false, children: [
      jsx.jsx('planeGeometry', { args: [1, 1] }),
      jsx.jsx('shaderMaterial', { uniforms, vertexShader: vertex, fragmentShader: portraitFragment, transparent: true, depthTest: false, depthWrite: false })
    ] })
  ] });
}
