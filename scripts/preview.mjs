import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 8128);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.wasm':'application/wasm','.mp4':'video/mp4','.webm':'video/webm','.ktx2':'image/ktx2','.glb':'model/gltf-binary'};
if (!fs.existsSync(path.join(directory,'index.html'))) throw new Error('Run npm run build before npm run preview.');
const server = http.createServer((request,response)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname); } catch { response.writeHead(400).end(); return; }
  if(pathname==='/' || pathname==='/editions/winter2026') pathname='/index.html';
  const file=path.resolve(directory,'.'+pathname);
  if(!file.startsWith(path.resolve(directory)+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end('Not found');return; }
  const size=fs.statSync(file).size, headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  const range=/^bytes=(\d+)-(\d*)$/.exec(request.headers.range||'');
  let start=0,end=size-1,status=200;
  if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),size-1):size-1;if(start>end||start>=size){response.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
  headers['Content-Length']=Math.max(0,end-start+1);response.writeHead(status,headers);
  if(request.method==='HEAD' || size===0){response.end();return;}
  const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>response.destroy());response.on('close',()=>stream.destroy());stream.pipe(response);
});
server.listen(port,'127.0.0.1',()=>console.log(`Preacherman website: http://127.0.0.1:${port}`));
const stop=()=>{server.closeAllConnections();server.close();};process.once('SIGINT',stop);process.once('SIGTERM',stop);
