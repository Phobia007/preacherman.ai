import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
function config({native=false,origin='https://web.example.test',api='',port}={}) {
 const source=readFileSync(new URL('../src/serviceConfig.ts',import.meta.url),'utf8').replaceAll('import.meta.env','__env');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={},stored=new Map();
 runInNewContext(code,{exports,require:()=>({isTauri:()=>native}),URL,__env:{VITE_PREACHERMAN_SERVICE_URL:api,VITE_PREACHERMAN_SERVICE_PORT:port},window:{location:{origin},localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,v)=>stored.set(key,v)}}});
 return exports;
}
test('Hosted web API and voice use this website with HTTPS and WSS',()=>{
 const c=config();assert.equal(c.localServiceUrl('/api/health'),'https://web.example.test/api/health');assert.equal(c.localServiceWebSocketUrl('/api/voice/asr'),'wss://web.example.test/api/voice/asr');
 c.saveServicePort(8787);assert.equal(c.localServiceUrl('/api/tasks'),'https://web.example.test/api/tasks');
});
test('Configured cloud API is used for HTTP and WebSocket calls',()=>{
 const c=config({api:'https://api.example.test'});assert.equal(c.localServiceUrl('/api/tasks'),'https://api.example.test/api/tasks');assert.equal(c.localServiceWebSocketUrl('/api/voice/tts'),'wss://api.example.test/api/voice/tts');
});
test('Local browser preview stays same-origin while native logic remains available',()=>{
 const web=config({origin:'http://localhost:5173'});assert.equal(web.localServiceUrl('/api/health'),'http://localhost:5173/api/health');
 const native=config({native:true});native.saveServicePort(8792);assert.equal(native.localServiceUrl('/api/health'),'http://127.0.0.1:8792/api/health');assert.equal(native.localServiceWebSocketUrl('/api/voice/tts'),'ws://127.0.0.1:8792/api/voice/tts');
});
