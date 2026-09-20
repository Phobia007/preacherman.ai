import { r as React, j as jsx } from './runtime/components-BdJai906.js';
import { u as useThree, d as useFrame, an as TextureLoader, a as loading } from './runtime/Background-CGKUhMwd.js';
import { a as scenes, b as loadingUI, u as preferences } from './runtime/(_locale).editions.winter2026-DhFtUF58.js';

// Authored 2.5D layers follow the native camera and original five-person rig.
export function CharacterCast({kind,sectionIndex}) {
  const {scene}=useThree(),mesh=React.useRef(),state=React.useRef();
  const hero=kind==='sidekick';
  const uniforms=React.useMemo(()=>({tMap:{value:null},tBlink:{value:null},uBlink:{value:0},uReady:{value:0},uPeople:{value:[...Array(5)].map(()=>scene.matrix.clone().identity())}}),[scene]);
  React.useEffect(()=>{
    const token=`preacherman-${kind}-painting`,reduced=matchMedia('(prefers-reduced-motion: reduce)');let disposed=false;
    const clip={textures:[],reduced,drivers:[],ready:false};state.current=clip;
    loading.getState().startLoading(sectionIndex,token);
    const files=hero?['jubilee-open.png','jubilee-blink.png']:['operations-cast.png'];
    Promise.all(files.map(name=>new TextureLoader().loadAsync(`/assets/character-scenes/${name}`).then(texture=>{if(disposed){texture.dispose();return null}texture.anisotropy=4;clip.textures.push(texture);return texture}))).then(textures=>{
      if(disposed)return;uniforms.tMap.value=textures[0];uniforms.tBlink.value=textures[1]||textures[0];uniforms.uReady.value=1;clip.ready=true;
      loading.getState().finishLoading(sectionIndex,token);if(scenes.getState().activeSection===sectionIndex&&loading.getState().isSceneLoaded(sectionIndex))loadingUI.getState().setIsLoaded(true);
      document.documentElement.dataset[`${kind}CastReady`]='true';
    }).catch(error=>{if(!disposed)console.error('Unable to load the authored character painting',error)});
    return()=>{disposed=true;for(const texture of clip.textures)texture.dispose();state.current=null;delete document.documentElement.dataset[`${kind}CastReady`];};
  },[kind,sectionIndex,scene]);
  useFrame(({clock,camera,size})=>{
    const clip=state.current;if(!clip?.ready||!mesh.current)return;
    const reduced=clip.reduced.matches||preferences.getState().preferReducedMotion;
    const framing=Math.min(1,(size.width/size.height)/(hero?1.4:1.95));
    if(Math.abs(camera.zoom-framing)>.0001){camera.zoom=framing;camera.updateProjectionMatrix();}
    if(!clip.backdrop)scene.traverse(o=>{if(o.isMesh&&(hero?o.name.includes('Sidekick_bg_stars'):o.name.includes('Operations_bg_diffuse')))clip.backdrop=o;});
    if(clip.backdrop){const expansion=1/framing,previous=clip.backdrop.geometry.userData.framingExpansion||1;if(Math.abs(expansion-previous)>.0001){clip.backdrop.geometry.scale(expansion/previous,expansion/previous,1);clip.backdrop.geometry.userData.framingExpansion=expansion;}}
    if(hero){
      const phase=(clock.elapsedTime+2.6)%5.3;
      const blink=reduced?0:phase<.08?phase/.08:phase<.135?1:phase<.25?1-(phase-.135)/.115:0;
      uniforms.uBlink.value=blink;mesh.current.userData.blink=blink;
    }else{
      const original=scene.getObjectByName('Operations');if(original)original.visible=false;
      ['Bone002','Bone006','Bone010','Bone013','Bone017'].forEach((name,i)=>{
        const bone=scene.getObjectByName(name);if(!bone)return;
        bone.updateWorldMatrix(true,false);
        if(!clip.drivers[i])clip.drivers[i]=bone.matrixWorld.clone().invert();
        uniforms.uPeople.value[i].identity();if(!reduced)uniforms.uPeople.value[i].copy(bone.matrixWorld).multiply(clip.drivers[i]);
      });
    }
  });
  const vertex=`varying vec2 vUv;uniform mat4 uPeople[5];void main(){vUv=uv;vec4 p=modelMatrix*vec4(position,1.0);${hero?'':`float centers[5];centers[0]=.17;centers[1]=.31;centers[2]=.5;centers[3]=.69;centers[4]=.86;vec4 moved=vec4(0.0);float total=0.0;for(int i=0;i<5;i++){float w=exp(-pow((uv.x-centers[i])*15.0,2.0));moved+=(uPeople[i]*p)*w;total+=w;}p=mix(p,moved/max(total,.0001),smoothstep(.20,.66,uv.y));`}gl_Position=projectionMatrix*viewMatrix*p;}`;
  const fragment=`uniform sampler2D tMap;uniform sampler2D tBlink;uniform float uBlink;uniform float uReady;varying vec2 vUv;void main(){vec4 c=texture2D(tMap,vUv);${hero?`float eyeL=1.0-smoothstep(.72,1.0,length((vUv-vec2(.390,.727))/vec2(.030,.030)));float eyeR=1.0-smoothstep(.72,1.0,length((vUv-vec2(.447,.766))/vec2(.035,.030)));c.rgb=mix(c.rgb,texture2D(tBlink,vUv).rgb,max(eyeL,eyeR)*uBlink);`:''}if(c.a<.035||uReady<.5)discard;gl_FragColor=vec4(pow(c.rgb,vec3(2.2))*.78,c.a);}`;
  return jsx.jsxs('mesh',{ref:mesh,name:`preacherman-${kind}-painting`,position:hero?[.20,.06,-.25]:[0,-.10,-.38],frustumCulled:false,children:[
    jsx.jsx('planeGeometry',{args:hero?[3.3,2.2,32,24]:[5.25,2.952,100,60]}),
    jsx.jsx('shaderMaterial',{uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:true})
  ]});
}
