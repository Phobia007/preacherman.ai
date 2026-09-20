import { an as TextureLoader } from './runtime/Background-CGKUhMwd.js';
let mark;
export function brandLaptopMaterial(material) {
  mark ||= new TextureLoader().load('/assets/preacherman-mark-white.svg');
  const compile = material.onBeforeCompile.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    compile(shader, renderer);
    shader.uniforms.preachermanMark = { value: mark };
    shader.fragmentShader = 'uniform sampler2D preachermanMark;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      #ifdef USE_MAP
      vec2 labelUv = (vMapUv - vec2(.089, .789)) / vec2(.055, .050);
      if (all(greaterThan(labelUv, vec2(0.0))) && all(lessThan(labelUv, vec2(1.0)))) {
        vec3 leftAluminum = texture2D(map, vec2(.088, vMapUv.y)).rgb;
        vec3 rightAluminum = texture2D(map, vec2(.145, vMapUv.y)).rgb;
        vec3 aluminum = mix(leftAluminum, rightAluminum, labelUv.x);
        float feather = smoothstep(0.0,.08,labelUv.x)*smoothstep(0.0,.08,1.0-labelUv.x)*smoothstep(0.0,.08,labelUv.y)*smoothstep(0.0,.08,1.0-labelUv.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, aluminum, feather);
        vec2 logoUv = vec2(labelUv.y, labelUv.x);
        vec4 logo = texture2D(preachermanMark, logoUv);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.88), logo.a * feather);
      }
      #endif`);
  };
  material.customProgramCacheKey = () => 'preacherman-laptop-mark-v1';
  return material;
}
