const verifyProviders=require('./account-providers.smoke.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const preview=true,out=process.env.PROFILE_REPORT_DIR||require('node:path').resolve(__dirname,'../../../output/playwright/profile-sync-20260917');
fs.mkdirSync(out,{recursive:true});
const report={modes:[],routes:[],profiles:[],providers:[],errors:[],animalRequests:[]};
const lines=['An intelligent home.','One place for your virtual characters, engines, and tools.','AI that keeps learning, goes with you, and gets things done.','Your second identity in the virtual world.'];
const shot=(p,n)=>p.screenshot({path:path.join(out,(preview?'preview-':'native-')+n+'.png')});
async function home(p){await p.locator('.demo-intro-splash').waitFor({state:'detached'});await p.locator('[data-avatar-load-state="ready"]').first().waitFor();}
async function nav(p,name,surface){const t=p.locator('.demo-app-shell__brand-trigger');if(await t.getAttribute('aria-expanded')!=='true')await t.press('Enter');await p.getByRole('navigation',{name:'Preacherman sections'}).getByRole('button',{name,exact:true}).click();if(await t.getAttribute('aria-expanded')==='true')await t.click();await p.locator('.demo-app-shell[data-active-surface="'+surface+'"]').waitFor();}
async function taskProfile(p,f,appearance,route){
 const toggle=f.locator('[data-od-id="profile-toggle"]');await toggle.click();
 await f.waitForFunction(()=>document.querySelector('[aria-expanded="true"]')&&document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$folio.hole.p>.99);
 await p.waitForTimeout(2000);
 const state=await f.evaluate(()=>{const folio=document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$folio;return{rain:!!folio.llamaRain,started:!!folio._rainStarted,hole:folio.hole.p,lines:[...document.querySelectorAll('[data-gallery-profile-line]')].map(e=>e.textContent),toggle:document.querySelector('[data-od-id="profile-toggle"]').textContent};});
 assert.equal(state.rain,false);assert.equal(state.started,false);assert.deepEqual(state.lines,lines);assert.equal(state.toggle,'Close');
 const copy=await f.locator('[data-gallery-profile-copy]').innerText();assert.doesNotMatch(copy,/[\u3400-\u9fff]/);
 await shot(p,appearance+'-task-'+route+'-profile');
 await toggle.click();await f.waitForFunction(()=>document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$folio.hole.p<.01);
 report.profiles.push({appearance,surface:'Task '+route,...state,closed:true});
}
async function marketProfile(p,appearance,route){
 await p.locator('.market-profile__toggle').click();await p.locator('.market-profile[data-phase="open"]').waitFor();await p.waitForTimeout(1200);
 const copy=await p.locator('.market-profile__content').innerText();assert.doesNotMatch(copy,/[\u3400-\u9fff]/);for(const line of lines)assert.ok(copy.includes(line));assert.equal(await p.locator('.market-profile__toggle').innerText(),'Close');
 assert.equal(await p.locator('.market-profile__content a, .market-profile__content ul').count(),0);assert.doesNotMatch(copy,/Instagram|LinkedIn|Email/i);
 await shot(p,appearance+'-market-'+route+'-profile');await p.keyboard.press('Escape');await p.locator('.market-profile[data-phase="closed"]').waitFor();report.profiles.push({appearance,surface:'Market '+route,english:true,noSocialLinks:true,closed:true});
}
(async()=>{let browser,context,page,original;
try{
 {browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE,args:['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist']});context=await browser.newContext({viewport:{width:1912,height:948}});page=await context.newPage();}
 page.setDefaultTimeout(40000);page.setDefaultNavigationTimeout(40000);
 page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('request',r=>{if(/llama\.glb|BNIAOxM5\.js/.test(r.url()))report.animalRequests.push(r.url());});
 await page.goto(process.env.PREACHERMAN_WEB_URL || 'http://localhost:5173');
 original=await page.evaluate(()=>localStorage.getItem('preacherman.preferences'));await home(page);report.coldHome=await page.locator('.demo-app-shell').getAttribute('data-active-surface')==='home';
 for(const appearance of ['dark','light']){
  if(await page.locator('html').getAttribute('data-appearance')!==appearance){await page.evaluate(a=>{const prefs=JSON.parse(localStorage.getItem('preacherman.preferences')||'{}');localStorage.setItem('preacherman.preferences',JSON.stringify({...prefs,appearance:a}));},appearance);await page.goto(new URL('/',page.url()).href);await home(page);}
  for(const[name,surface]of[['Home','home'],['Task','workspace'],['Gallery','market'],['Market','ledger'],['Account','account'],['Settings','settings']]){
   await nav(page,name,surface);
   if(name==='Task'){
    await page.locator('.gallery-surface[data-reveal-state="complete"]').waitFor();const frame=await(await page.locator('.gallery-surface__frame').elementHandle()).contentFrame();
    await frame.locator('[data-od-id="profile-toggle"]').waitFor();await page.waitForTimeout(3500);await taskProfile(page,frame,appearance,'surf');
    await frame.locator('[data-od-id="view-full"]').click();await frame.waitForURL('**/full');await page.waitForTimeout(1800);await taskProfile(page,frame,appearance,'timeline');
   }
   if(name==='Gallery')await page.waitForFunction(()=>{const s=document.querySelector('canvas[data-gallery-orbit]')?.dataset.galleryOrbit;if(!s)return false;const d=JSON.parse(s);return d.entry===1&&d.readyCovers>0;});
   if(name==='Market'){
    await page.locator('.market-surface[data-entrance="complete"][data-status="ready"]').waitFor();await marketProfile(page,appearance,'main');
    const f=await(await page.locator('.market-surface__frame').elementHandle()).contentFrame();await f.getByRole('link',{name:'Cortana, Details',exact:true}).click();await page.locator('.market-details[data-reveal="complete"][data-status="ready"]').waitFor();
    await marketProfile(page,appearance,'details');await page.getByRole('button',{name:'Back to Market',exact:true}).click();await page.locator('.market-details').waitFor({state:'detached'});
   }
   if(name==='Account'){
    report.providers.push(await verifyProviders(page,appearance,shot));
    await page.locator('.account[data-entrance="complete"]').waitFor();await page.locator('.account__signature').click();await page.locator('.account[data-phase="open"]').waitFor();
    const copy=await page.locator('.account__profile').innerText();assert.doesNotMatch(copy,/[\u3400-\u9fff]/);assert.ok(copy.includes('Your second identity.'));
    await shot(page,appearance+'-account-profile');await page.keyboard.press('Escape');await page.locator('.account[data-phase="closed"]').waitFor();report.profiles.push({appearance,surface:'Account',english:true,closed:true});
   }
   if(name==='Settings')await page.locator('[data-settings-state="ready"]').waitFor();
   assert.equal(await page.locator('.demo-window-controls__button').count(),0);
   assert.equal(await page.locator('html').getAttribute('data-appearance'),appearance);
   const bounds=await page.locator('.demo-app-shell').boundingBox();
   assert.ok(Math.abs(bounds.x)<1&&Math.abs(bounds.y)<1&&Math.abs(bounds.width-1912)<1&&Math.abs(bounds.height-948)<1,'Browser fills the viewport');
   await page.waitForTimeout(500);await shot(page,appearance+'-'+name.toLowerCase());report.routes.push({name,appearance});console.log('Verified '+appearance+' '+name);
  }
  report.modes.push({appearance,englishProfiles:true,noAnimalRain:true});
 }
 assert.deepEqual(report.animalRequests,[]);report.errors=[...new Set(report.errors)];
 const baseline=['Hydration completed but contains mismatches.'];
 const norm=e=>e.includes('Content Security Policy directive')?e.replace(/https:\/\/[^'"\s]+/g,u=>new URL(u).origin+'/[legacy-asset]'):e;
 report.newErrors=report.errors.filter(e=>!new Set(baseline.map(norm)).has(norm(e)));assert.deepEqual(report.newErrors,[]);report.passed=true;
}catch(e){report.failure=String(e.stack);process.exitCode=1;if(page)await shot(page,'failure').catch(()=>{});}
finally{if(page&&original!==undefined)await page.evaluate(raw=>{if(raw===null)localStorage.removeItem('preacherman.preferences');else localStorage.setItem('preacherman.preferences',raw);},original).catch(()=>{});if(context)await context.close().catch(()=>{});await browser?.close().catch(()=>{});fs.writeFileSync(path.join(out,(preview?'preview':'native')+'-report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({passed:report.passed,profiles:report.profiles.length,newErrors:report.newErrors,failure:report.failure}));
})();
