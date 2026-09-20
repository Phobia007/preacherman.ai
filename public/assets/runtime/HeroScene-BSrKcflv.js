import { r as React, j as jsx } from './components-BdJai906.js';
import {
  u as useThree,
  d as useFrame,
  a as assetLoading,
  S as ShaderMaterial,
  P as PerspectiveCamera,
  an as TextureLoader,
  L as LinearFilter,
  b as SRGBColorSpace
} from './Background-CGKUhMwd.js';
import { a as sections, b as pageLoading, u as devicePreferences } from './(_locale).editions.winter2026-DhFtUF58.js';
import { u as useSceneTimeline, S as SceneTimeline, E as Effects } from './Effects-WhEp4HUr.js';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const fragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uLogoTexture;
uniform float uAspect;
uniform float uImageAspect;
uniform float uPositionX;
uniform float uTime;
uniform float uMotion;
varying vec2 vUv;

vec4 stampBrand(vec4 color, vec2 p) {
  vec2 logoUv = (p - vec2(0.30, 0.475)) / vec2(0.125, 0.276) + 0.5;
  if (logoUv.x < 0.0 || logoUv.x > 1.0 || logoUv.y < 0.0 || logoUv.y > 1.0) return color;
  vec4 mark = texture2D(uLogoTexture, vec2(logoUv.x, 1.0-logoUv.y));
  return vec4(mix(color.rgb, mark.rgb, mark.a), color.a);
}
vec4 sampleImage(vec2 p) {
  return texture2D(uTexture, vec2(p.x, 1.0-p.y));
}
vec2 ringEdges(float y) {
  y = clamp(y, 0.0, 1.0) * 941.0;
  if (y < 100.0000000) {
    float t = clamp((y - 0.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(751.0000000, 896.0000000)
      + (t3-2.0*t2+t)*vec2(-6.0000000, 6.0000000)
      + (-2.0*t3+3.0*t2)*vec2(745.0000000, 902.0000000)
      + (t3-t2)*vec2(-7.5000000, 7.2000000)) / 1672.0;
  }
  if (y < 200.0000000) {
    float t = clamp((y - 100.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(745.0000000, 902.0000000)
      + (t3-2.0*t2+t)*vec2(-7.5000000, 7.2000000)
      + (-2.0*t3+3.0*t2)*vec2(735.0000000, 911.0000000)
      + (t3-t2)*vec2(-11.3043478, 9.9000000)) / 1672.0;
  }
  if (y < 300.0000000) {
    float t = clamp((y - 200.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(735.0000000, 911.0000000)
      + (t3-2.0*t2+t)*vec2(-11.3043478, 9.9000000)
      + (-2.0*t3+3.0*t2)*vec2(722.0000000, 922.0000000)
      + (t3-t2)*vec2(-15.0967742, 13.3571429)) / 1672.0;
  }
  if (y < 400.0000000) {
    float t = clamp((y - 300.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(722.0000000, 922.0000000)
      + (t3-2.0*t2+t)*vec2(-15.0967742, 13.3571429)
      + (-2.0*t3+3.0*t2)*vec2(704.0000000, 939.0000000)
      + (t3-t2)*vec2(-21.2727273, 19.9024390)) / 1672.0;
  }
  if (y < 500.0000000) {
    float t = clamp((y - 400.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(704.0000000, 939.0000000)
      + (t3-2.0*t2+t)*vec2(-21.2727273, 19.9024390)
      + (-2.0*t3+3.0*t2)*vec2(678.0000000, 963.0000000)
      + (t3-t2)*vec2(-32.4057971, 28.4745763)) / 1672.0;
  }
  if (y < 600.0000000) {
    float t = clamp((y - 500.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(678.0000000, 963.0000000)
      + (t3-2.0*t2+t)*vec2(-32.4057971, 28.4745763)
      + (-2.0*t3+3.0*t2)*vec2(635.0000000, 998.0000000)
      + (t3-t2)*vec2(-52.3818182, 45.0000000)) / 1672.0;
  }
  if (y < 700.0000000) {
    float t = clamp((y - 600.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(635.0000000, 998.0000000)
      + (t3-2.0*t2+t)*vec2(-52.3818182, 45.0000000)
      + (-2.0*t3+3.0*t2)*vec2(568.0000000, 1061.0000000)
      + (t3-t2)*vec2(-89.3333333, 84.6562500)) / 1672.0;
  }
  if (y < 800.0000000) {
    float t = clamp((y - 700.0000000) / 100.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(568.0000000, 1061.0000000)
      + (t3-2.0*t2+t)*vec2(-89.3333333, 84.6562500)
      + (-2.0*t3+3.0*t2)*vec2(434.0000000, 1190.0000000)
      + (t3-t2)*vec2(-164.6065259, 173.8837405)) / 1672.0;
  }
  if (y < 875.0000000) {
    float t = clamp((y - 800.0000000) / 75.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(434.0000000, 1190.0000000)
      + (t3-2.0*t2+t)*vec2(-123.4548944, 130.4128054)
      + (-2.0*t3+3.0*t2)*vec2(274.0000000, 1390.0000000)
      + (t3-t2)*vec2(-219.3611794, 247.9809976)) / 1672.0;
  }
  if (y < 915.0000000) {
    float t = clamp((y - 875.0000000) / 40.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(274.0000000, 1390.0000000)
      + (t3-2.0*t2+t)*vec2(-116.9926290, 132.2565321)
      + (-2.0*t3+3.0*t2)*vec2(88.0000000, 1564.0000000)
      + (t3-t2)*vec2(-213.5822473, 186.7595248)) / 1672.0;
  }
  {
    float t = clamp((y - 915.0000000) / 26.0000000, 0.0, 1.0);
    float t2 = t*t, t3 = t2*t;
    return ((2.0*t3-3.0*t2+1.0)*vec2(88.0000000, 1564.0000000)
      + (t3-2.0*t2+t)*vec2(-138.8284607, 121.3936911)
      + (-2.0*t3+3.0*t2)*vec2(-75.0000000, 1695.0000000)
      + (t3-t2)*vec2(-163.0000000, 131.0000000)) / 1672.0;
  }
}
// Two staggered flows hide the reset of each texture sample at zero weight.
float flowWeight(float phase) {
  return 1.0 - abs(2.0*phase-1.0);
}
vec4 ringFlow(vec2 p, float crossRing, float phase) {
  float sourceY = max(0.0, p.y - phase*0.12*(0.10+0.90*p.y*p.y));
  vec2 rim = ringEdges(sourceY);
  return sampleImage(vec2(mix(rim.x, rim.y, crossRing), sourceY));
}
vec4 cloudFlow(vec2 p, float phase) {
  vec2 wind = vec2(0.018, -0.004 + 0.010*(p.x-0.20));
  return sampleImage(p - wind*phase);
}
void main() {
  vec2 ratio = vec2(min(uAspect/uImageAspect, 1.0), min(uImageAspect/uAspect, 1.0));
  vec2 uv = vUv*ratio + (1.0-ratio)*vec2(uPositionX, 0.5);
  vec2 p = vec2(uv.x, 1.0-uv.y);
  vec4 original = sampleImage(p);
  if (uMotion < 0.5) { gl_FragColor = stampBrand(original, p); return; }
  vec4 color = original;
  vec2 rim = ringEdges(p.y);
  float distanceToRim = min(p.x-rim.x, rim.y-p.x)*1672.0;
  float ringMask = smoothstep(9.0, 27.0, distanceToRim);
  if (ringMask > 0.0) {
    float phase = fract(uTime/12.0);
    float crossRing = clamp((p.x-rim.x)/(rim.y-rim.x), 0.0, 1.0);
    vec4 flowing = mix(ringFlow(p, crossRing, fract(phase+0.5)),
                       ringFlow(p, crossRing, phase), flowWeight(phase));
    color = mix(original, flowing, ringMask);
  }
  // Keep the atmosphere and silhouette still; move only the bright cloud region.
  vec2 sphere = (p-vec2(0.22, 0.46))/vec2(0.27, 0.46);
  float planetMask = (1.0-smoothstep(0.80, 0.96, length(sphere)))
    * (1.0-smoothstep(rim.x-0.025, rim.x-0.010, p.x));
  if (planetMask > 0.0) {
    float phase = fract(uTime/28.0);
    vec4 clouds = mix(cloudFlow(p, fract(phase+0.5)), cloudFlow(p, phase), flowWeight(phase));
    float bright = max(min(original.r, min(original.g, original.b)),
                       min(clouds.r, min(clouds.g, clouds.b)));
    float cloudMask = smoothstep(0.08, 0.42, bright);
    color = mix(color, clouds, planetMask*cloudMask*0.90);
  }
  gl_FragColor = stampBrand(color, p);
}`;

// Texture flow stays inside the existing compositor; its burn, timeline and camera are unchanged.
function HeroScene({ sectionIndex, data }) {
  const { size, scene } = useThree();
  const mesh = React.useRef(null);
  const camera = React.useRef(null);
  const sheet = useSceneTimeline({
    name: 'HeroScene',
    stateUrl: data.backgroundAnimation?.url,
    sectionIndex
  });
  const material = React.useMemo(() => new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: null },
      uLogoTexture: { value: null },
      uAspect: { value: 1 },
      uImageAspect: { value: data.fallbackImage.width / data.fallbackImage.height },
      uPositionX: { value: 0.5 },
      uTime: { value: 0 },
      uMotion: { value: 0 }
    },
    depthTest: false,
    depthWrite: false
  }), []);

  useFrame((_, delta) => {
    const reduced = devicePreferences.getState().preferReducedMotion;
    material.uniforms.uMotion.value = reduced ? 0 : 1;
    if (reduced || document.hidden || !material.uniforms.uTexture.value) return;
    if (!sections.getState().sectionMap.get(sectionIndex)?.isActive) return;
    material.uniforms.uTime.value = (material.uniforms.uTime.value + Math.min(delta, 0.05)) % 84;
  });

  React.useEffect(() => {
    const view = new PerspectiveCamera(50, size.width / size.height, 0.1, 100);
    view.position.set(0, 0, 1 / Math.tan(25 * Math.PI / 180));
    view.lookAt(0, 0, 0);
    camera.current = view;
    scene.add(view);
    return () => { scene.remove(view); camera.current = null; };
  }, [scene]);

  React.useEffect(() => {
    const aspect = size.width / size.height;
    if (camera.current) {
      camera.current.aspect = aspect;
      camera.current.updateProjectionMatrix();
    }
    mesh.current?.scale.set(2 * aspect, 2, 1);
    material.uniforms.uAspect.value = aspect;
    material.uniforms.uPositionX.value = size.width < 768 ? 0.9 : 0.5;
  }, [size.width, size.height, material]);

  React.useEffect(() => {
    let disposed = false;
    assetLoading.getState().startLoading(sectionIndex, 'brand-mark');
    const texture = new TextureLoader().load('assets/preacherman-mark-white.svg', loaded => {
      if (disposed) { loaded.dispose(); return; }
      loaded.minFilter = LinearFilter; loaded.magFilter = LinearFilter;
      loaded.colorSpace = SRGBColorSpace; loaded.generateMipmaps = false;
      material.uniforms.uLogoTexture.value = loaded;
      assetLoading.getState().finishLoading(sectionIndex, 'brand-mark');
      if (sections.getState().activeSection === sectionIndex && assetLoading.getState().isSceneLoaded(sectionIndex)) pageLoading.getState().setIsLoaded(true);
    });
    return () => { disposed = true; texture.dispose(); };
  }, [sectionIndex, material]);

  React.useEffect(() => {
    let disposed = false;
    assetLoading.getState().startLoading(sectionIndex, 'hero-image');
    const texture = new TextureLoader().load(data.fallbackImage.url, loaded => {
      if (disposed) { loaded.dispose(); return; }
      loaded.minFilter = LinearFilter;
      loaded.magFilter = LinearFilter;
      loaded.colorSpace = SRGBColorSpace;
      loaded.generateMipmaps = false;
      material.uniforms.uTexture.value = loaded;
      material.uniforms.uImageAspect.value = loaded.image.width / loaded.image.height;
      assetLoading.getState().finishLoading(sectionIndex, 'hero-image');
      if (sections.getState().activeSection === sectionIndex && assetLoading.getState().isSceneLoaded(sectionIndex)) {
        pageLoading.getState().setIsLoaded(true);
      }
    });
    return () => { disposed = true; texture.dispose(); };
  }, [data.fallbackImage.url, sectionIndex, material]);
  React.useEffect(() => () => material.dispose(), [material]);

  if (!sheet) return null;
  return jsx.jsxs(SceneTimeline, {
    sheet,
    children: [
      jsx.jsx(Effects, { theatreKey: 'effects' }),
      jsx.jsx('mesh', {
        ref: mesh,
        material,
        scale: [2 * size.width / size.height, 2, 1],
        frustumCulled: false,
        children: jsx.jsx('planeGeometry', { args: [1, 1] })
      })
    ]
  });
}
export { HeroScene };
