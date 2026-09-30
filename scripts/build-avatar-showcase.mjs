import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../browser/apps/preacherman-demo-host/node_modules/esbuild/lib/main.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const desktop = path.join(root, 'browser/apps/preacherman-demo-host/public');
const output = path.join(root, 'public/assets/avatar-showcase');
const rail = path.join(desktop, 'active-theory-gallery/gallery');
const readMap = async file => JSON.parse((await readFile(path.join(rail, file), 'utf8')).match(/= (\{[\s\S]*\});/)[1]);
const covers = await readMap('rail-assets.js');
const media = await readMap('rail-media.js');
const projects = JSON.parse(await readFile(path.join(rail, 'external/storage.googleapis.com/activetheory-v6.appspot.com/cms/projects-dev.json'), 'utf8'));
const cards = projects.map(p => ({id:p.slug, title:p.name, client:p.clientName || '', thumbnail:covers[p.video.thumbnail] || p.video.thumbnail, logo:media[p.projectLogo?.url], color:'#'+(p.uiColor || 'ffffff')}));
for (const card of cards) for (const key of ['thumbnail', 'logo']) {
  const url = card[key]; if (!url) continue;
  if (!url.startsWith('/assets/')) throw new Error('Missing local Gallery asset: '+url);
  const target = path.join(root, 'public', url);
  await mkdir(path.dirname(target), {recursive:true});
  await cp(path.join(desktop,url), target);
}
await cp(path.join(desktop,'assets/avatars/cortana'),path.join(root,'public/assets/avatars/cortana'),{recursive:true});
await cp(path.join(desktop,'active-theory-gallery/assets/fonts/NBArchitektStd-Regular-export/NBArchitektStd-Regular.woff2'),path.join(output,'gallery.woff2'));
await writeFile(path.join(output,'gallery-data.json'), JSON.stringify(cards,null,2)+'\n');
// Website-only lifecycle adaptations; desktop application sources remain intact.
await build({plugins:[{
  name:'bounded-showcase-rendering',
  setup(builder) {
    builder.onLoad({filter:/InteractiveAvatarViewport\.tsx$/},async ({path:file})=>{
      const source=await readFile(file,'utf8');
      const loop='frameloop={rendering ? "always" : "never"}';
      if(!source.includes(loop)) throw new Error('Review the desktop viewport frame loop.');
      return {contents:source.replace(loop,'frameloop="never"'),loader:'tsx'};
    });
    builder.onLoad({filter:/GalleryOrbitCards\.tsx$/},async ({path:file})=>{
      let source=await readFile(file,'utf8');
      const condition='(galleryOrbitPose(index, center - .6, 1, cards.length).visible || galleryOrbitPose(index, center + .6, 1, cards.length).visible) ? ';
      if(!source.includes(condition)) throw new Error('Review the Gallery card mounting policy.');
      // Scroll travels from 1 to 7 over six seconds. Twelve slots include the
      // visible range plus a spare; retain those slots only, not all 31 cards.
      source=source.replace(condition,'index < 12 ? ')
        .replace('if (center !== nextCenter) setCenter(nextCenter);','')
        .replace('if (input.type === "focus") {','if (input.type === "showcase-reset") { scroll.current = target.current = GALLERY_LEAD_OFFSET; return; }\n      if (input.type === "focus") {')
        .replace('let visibleCards = 0, readyCovers = 0, playingVideos = 0;','if (gl.domElement.dataset.galleryReady !== "true" || gl.domElement.dataset.showcaseDebug === "true") {\n    let visibleCards = 0, readyCovers = 0, playingVideos = 0;')
        .replace('gl.domElement.dataset.galleryOrbit = JSON.stringify(diagnostics);','gl.domElement.dataset.galleryOrbit = JSON.stringify(diagnostics);\n    }');
      return {contents:source,loader:'tsx'};
    });
  },
}],entryPoints:[path.join(root,'scripts/avatar-showcase/gallery.tsx')],outfile:path.join(output,'gallery.js'),bundle:true,alias:Object.fromEntries(['react','react-dom','three','@react-three/fiber','@react-three/drei','three-stdlib'].map(name=>[name,path.join(root,'browser/apps/preacherman-demo-host/node_modules',name)])),format:'esm',target:'es2022',minify:true,jsx:'automatic',nodePaths:[path.join(root,'browser/apps/preacherman-demo-host/node_modules')],define:{'process.env.NODE_ENV':'"production"'}});
console.log('Bundled the existing GalleryOrbitCards and InteractiveAvatarViewport with local desktop assets.');
