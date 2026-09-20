import { ShopAppScene } from "./ShopAppScene-BGpEYXgJ.js";
import { Scene03Background } from "../scene03-background.js";
import { Scene04Background } from "../scene04-background.js";
import { AuthoredFallbackTexture } from "../scene-fallbacks.js";
import{r as t,j as l}from"./components-BdJai906.js";import{u as F,a as f,S as U,P as y,L as E,b as P}from"./Background-CGKUhMwd.js";import{u as O,a as S,b as z}from"./(_locale).editions.winter2026-DhFtUF58.js";import{u as C,S as I,E as K,K as _}from"./Effects-WhEp4HUr.js";import"./rive-DN8nxF7J.js";import"./constants-NW-dxha3.js";import"./Button-DiM4TpFi.js";import"./useLogError-_a0fPD4U.js";import"./meta-CwiYJk4F.js";import"./index-CMQ6Y8fQ.js";import"./index-BYdhAta1.js";const G=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,W=`
uniform sampler2D uTexture;
uniform float uAspect;
uniform float uImageAspect;
uniform float uLoaded;

varying vec2 vUv;

void main() {
  if (uLoaded < 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Flip Y coordinate for KTX2 textures
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

  // Object-fit: cover
  float screenAspect = uAspect;
  float imageAspect = uImageAspect;

  vec2 ratio = vec2(
    min(screenAspect / imageAspect, 1.0),
    min(imageAspect / screenAspect, 1.0)
  );

  uv = vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  gl_FragColor = texture2D(uTexture, uv);
}
`,M=50,m=2;function OriginalFallback({sectionIndex:r,data:c}){var k;const{size:i,scene:d}=F(),v=t.useRef(null),g=t.useRef(null),p=t.useRef(null),b=O(e=>e.isMobile),h=t.useRef(f.getState().startLoading),L=t.useRef(f.getState().finishLoading),u=t.useRef(!1),A=t.useRef(!1);t.useEffect(()=>{h.current=f.getState().startLoading,L.current=f.getState().finishLoading});const R=C({name:`FallbackScene-${r}`,stateUrl:(k=c.backgroundAnimation)==null?void 0:k.url,sectionIndex:r});t.useEffect(()=>r===void 0?void 0:(S.getState().activeSection===r&&!u.current&&(u.current=!0,h.current(r,"fallback-image")),S.subscribe(o=>o.activeSection,o=>{o===r&&!u.current&&(u.current=!0,h.current(r,"fallback-image"))})),[r]);const a=t.useMemo(()=>new U({vertexShader:G,fragmentShader:W,uniforms:{uTexture:{value:null},uAspect:{value:1},uImageAspect:{value:1},uLoaded:{value:0}},depthTest:!1,depthWrite:!1}),[]);t.useEffect(()=>{const e=i.width/i.height,s=M*Math.PI/180,o=m/2/Math.tan(s/2),n=new y(M,e,.1,100);return n.position.set(0,0,o),n.lookAt(0,0,0),p.current=n,d.add(n),a.uniforms.uAspect.value=e,()=>{d.remove(n)}},[d]),t.useEffect(()=>{const e=i.width/i.height;if(p.current&&(p.current.aspect=e,p.current.updateProjectionMatrix()),v.current){const s=m*e;v.current.scale.set(s,m,1)}a.uniforms.uAspect.value=e},[i.width,i.height,a]);const T=(()=>{var e,s;return b&&((e=c.fallbackImageMobileOptimized)!=null&&e.url)?c.fallbackImageMobileOptimized.url:!b&&((s=c.fallbackImageOptimized)!=null&&s.url)?c.fallbackImageOptimized.url:null})(),j=e=>{e.minFilter=E,e.magFilter=E,e.colorSpace=P,g.current=e,a.uniforms.uTexture.value=e,a.uniforms.uImageAspect.value=e.image.width/e.image.height,a.uniforms.uLoaded.value=1,r!==void 0&&!A.current&&u.current&&(A.current=!0,L.current(r,"fallback-image"),S.getState().activeSection===r&&f.getState().isSceneLoaded(r)&&z.getState().setIsLoaded(!0))};if(t.useEffect(()=>()=>{g.current&&(g.current.dispose(),g.current=null),a.dispose()},[a]),!R)return null;const w=i.width/i.height,x=m*w;return l.jsxs(I,{sheet:R,children:[l.jsx(K,{theatreKey:"effects"}),T&&l.jsx(T.endsWith(".png")?AuthoredFallbackTexture:_,{url:T,onTextureLoaded:j}),l.jsx("mesh",{ref:v,material:a,position:[0,0,0],scale:[x,m,1],frustumCulled:!1,children:l.jsx("planeGeometry",{args:[1,1]})})]})}export{ee as FallbackImageScene};


function Scene04Fallback({sectionIndex:r,data:c}){const sheet=C({name:`FallbackScene-${r}`,stateUrl:c.backgroundAnimation?.url,sectionIndex:r});return sheet?l.jsxs(I,{sheet,children:[l.jsx("perspectiveCamera",{position:[0,0,4]}),l.jsx(K,{theatreKey:"effects"}),l.jsx(c.handle==="marketing"?Scene03Background:Scene04Background,{sectionIndex:r})]}):null}
function ee(props){if(props.data.handle==="shop-app")return l.jsx(ShopAppScene,{...props,staticMode:true});return ["agentic","marketing"].includes(props.data.handle)?l.jsx(Scene04Fallback,props):l.jsx(OriginalFallback,props)}
