const {chromium}=require('C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts','scenes-v6');fs.mkdirSync(out,{recursive:true});
const files=new Set(['index.html','app.js','art.js','features.js','spaces.js','views.js','scenes.js','design.css','themes.css','scenes.css']);
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.has(name)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)))});
let browser;const errors=[],checks=[];
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.WULI_QA_URL||`http://127.0.0.1:${server.address().port}/`;
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const ctx=await browser.newContext({viewport:{width:1440,height:1050},locale:'zh-CN'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'networkidle'});
  const close=async()=>{await p.locator('.modal .close').click();await p.locator('.modal').waitFor({state:'detached'})};
  await p.locator('[data-action=open-settings]').click();await p.waitForTimeout(300);
  await p.evaluate(()=>{window.dialogBefore=document.querySelector('.modal');window.backdropBefore=document.querySelector('.modal-backdrop')});
  const initial=await p.locator('.modal').boundingBox();
  for(const tab of ['members','appearance','demo','space','appearance']){
    await p.locator(`[data-action=settings-tab][data-id=${tab}]`).click();
    assert.equal(await p.evaluate(()=>document.querySelector('.modal')===window.dialogBefore&&document.querySelector('.modal-backdrop')===window.backdropBefore),true);
    assert.deepEqual(await p.locator('.modal').boundingBox(),initial);
    assert.equal(await p.locator('.modal').evaluate(el=>getComputedStyle(el).opacity),'1');
    assert.equal(await p.locator('.modal').evaluate(el=>el.getAnimations().filter(a=>a.playState==='running').length),0);
  }
  await p.locator('[data-action=settings-tab][data-id=appearance]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('[data-action=settings-tab][data-id=demo]').getAttribute('aria-selected'),'true');await close();checks.push('Settings retain DOM identity, position, height, opacity; keyboard tab navigation');
  const dataBefore=await p.evaluate(()=>JSON.stringify(spaceCollections.map(k=>state[k])));
  const geometry=[];
  for(const theme of ['journal','editorial','night']){
    await p.locator('[data-action=open-settings]').click();await p.locator('[data-action=settings-tab][data-id=appearance]').click();await p.locator(`[data-action=set-theme][data-id=${theme}]`).click();await close();
    await p.evaluate(()=>go('home'));await p.waitForTimeout(350);
    assert.equal(await p.evaluate(()=>JSON.stringify(spaceCollections.map(k=>state[k]))),dataBefore);
    geometry.push(await p.evaluate(()=>['.sidebar','#nav','.topbar','.hero','.attention-panel'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})));
    await p.screenshot({path:path.join(out,`${theme}-home.png`),fullPage:true});
    for(const tab of ['chores','items','expenses','rules']){
      await p.evaluate(t=>go(t),tab);await p.waitForTimeout(400);await p.screenshot({path:path.join(out,`${theme}-${tab}.png`),fullPage:true});
      if(tab==='chores'){
        const mop=p.locator('.compact-scene .magic-mop');const frame=await mop.evaluate(el=>getComputedStyle(el).transform);await p.waitForTimeout(400);assert.notEqual(await mop.evaluate(el=>getComputedStyle(el).transform),frame);
        const pop=p.locator('.compact-scene .bubble-pop').first();
        const phases=await pop.evaluate(el=>{const a=el.getAnimations()[0];a.pause();a.currentTime=5800*.82;const burst=Number(getComputedStyle(el).opacity);a.currentTime=5800*.4;const hidden=Number(getComputedStyle(el).opacity);a.play();return {burst,hidden}});assert.ok(phases.burst>.7&&phases.hidden===0);
        await p.setViewportSize({width:1440,height:600});await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(200);
        assert.equal(await p.locator('.scene-strip .magic-mop').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
        await p.locator('.scene-chores.scene-strip').scrollIntoViewIfNeeded();await p.waitForTimeout(200);assert.equal(await p.locator('.scene-strip .magic-mop').evaluate(el=>getComputedStyle(el).animationPlayState),'running');
        await p.screenshot({path:path.join(out,`${theme}-mop-frame.png`)});await p.setViewportSize({width:1440,height:1050});
      }
    }
    await p.setViewportSize({width:390,height:844});await p.evaluate(()=>go('chores'));await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:path.join(out,`${theme}-mobile.png`),fullPage:true});await p.setViewportSize({width:1440,height:1050});
  }
  assert.deepEqual(geometry[0],geometry[1],'Same functional geometry in retro');assert.deepEqual(geometry[0],geometry[2],'Same functional geometry in night');checks.push('Identical desktop navigation, topbar, hero and agenda geometry in three themes','Theme does not mutate business data','Mop travels, bubbles visibly burst, off-screen scenes pause','Desktop/mobile visual captures');
  await p.evaluate(()=>go('chores'));await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(200);assert.equal(await p.locator('.compact-scene .magic-mop').evaluate(el=>getComputedStyle(el).animationName),'none');await p.emulateMedia({reducedMotion:'no-preference'});
  await p.locator('[data-action=open-settings]').click();await p.locator('[data-action=settings-tab][data-id=appearance]').click();await p.locator('[data-action=toggle-motion]').click();await close();assert.equal(await p.locator('.compact-scene .magic-mop').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');checks.push('Reduced-motion and global motion setting cover new scenes');
  // Simulate a v5 browser where the original bills and chores were already completed.
  const before=await p.evaluate(()=>{for(const x of state.expenses){x.settled=[...x.participants];x.payments=[{user:'u1',method:'wechat',amount:x.shares.u1,demo:true,time:new Date().toISOString()}]}for(const c of state.chores)c.status='done';world.presentationEdition=5;save();return JSON.parse(JSON.stringify({expenses:state.expenses,chores:state.chores}))});
  await p.reload({waitUntil:'networkidle'});const after=await p.evaluate(()=>JSON.parse(JSON.stringify({expenses:state.expenses,chores:state.chores})));assert.deepEqual(after.expenses.filter(x=>before.expenses.some(y=>y.id===x.id)),before.expenses);assert.deepEqual(after.chores.filter(x=>before.chores.some(y=>y.id===x.id)),before.chores);assert.equal(after.expenses.length,before.expenses.length+1);assert.equal(after.chores.length,before.chores.length+1);
  const kinds=await p.locator('.attention-item').evaluateAll(els=>els.map(e=>e.dataset.queueKind));for(const kind of ['expenses','chores','items'])assert.ok(kinds.includes(kind));
  await p.reload({waitUntil:'networkidle'});assert.equal(await p.evaluate(()=>state.expenses.length),after.expenses.length);assert.equal(await p.evaluate(()=>state.chores.length),after.chores.length);checks.push('One-time v5 samples preserve paid bills and completed chores byte-for-byte; mixed home agenda; reload idempotence');
  const text=await p.locator('body').innerText();for(const copy of ['让每一份付出被看见','日子慢慢过','共同照顾这个家','make room for each other'])assert.equal(text.includes(copy),false);
  assert.deepEqual(errors,[]);const result={base,passed:true,checks,errors};fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
