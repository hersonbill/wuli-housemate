const { chromium } = require('C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'artifacts', 'design-v2');
fs.mkdirSync(output,{recursive:true});
const publicFiles = new Set(['index.html','app.js','art.js','views.js','design.css']);
const server = http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';
  if(!publicFiles.has(name)){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,name)));
});
let browser;
const failures=[];
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=process.env.WULI_QA_URL||`http://127.0.0.1:${server.address().port}/`;
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1100},locale:'zh-CN'});
  const page=await context.newPage();
  page.on('pageerror',e=>failures.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  const snapshot=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('wuli_housemate_v1')));
  const nav=p=>page.locator(`#nav [data-page="${p}"]`).click();
  const close=async()=>{await page.locator('.modal .close').click();await page.locator('.modal').waitFor({state:'detached'})};
  const submit=async()=>{await page.locator('.modal button[type=submit]').click();await page.locator('.modal').waitFor({state:'detached'})};
  await page.screenshot({path:path.join(output,'desktop-home.png'),fullPage:true});
  await page.locator('[data-action=toggle-light]').click();
  assert.equal(await page.locator('.hero').evaluate(el=>el.classList.contains('is-evening')),true);
  await page.waitForTimeout(550);
  await page.screenshot({path:path.join(output,'desktop-evening.png'),fullPage:true});
  await page.locator('[data-action=toggle-light]').click();
  await page.waitForTimeout(550);
  for(const tab of ['expenses','chores','items','rules']){
    await nav(tab);await page.waitForTimeout(280);
    await page.screenshot({path:path.join(output,`desktop-${tab}.png`),fullPage:true});
  }
  if(process.argv.includes('--preview')){console.log(JSON.stringify({base,preview:true,errors:failures}));return}
  await nav('expenses');
  await page.locator('[data-action=add-expense]').click();
  await page.locator('[name=title]').fill('三人分摊验收');
  await page.locator('[name=amount]').fill('100');
  await page.locator('[name=people][value=u4]').uncheck();
  await submit();
  let data=await snapshot();assert.deepEqual(Object.values(data.expenses[0].shares),[3334,3333,3333]);
  await page.reload({waitUntil:'networkidle'});assert.equal((await snapshot()).expenses[0].title,'三人分摊验收');
  await nav('expenses');await page.locator('[data-action=add-expense]').click();
  await page.locator('[name=title]').fill('自定义分摊验收');await page.locator('[name=amount]').fill('100');
  assert.equal(await page.locator('#custom-shares').isVisible(),false);
  await page.locator('#split-mode').selectOption('custom');
  for(const [id,amount] of [['u1','10'],['u2','20'],['u3','30'],['u4','30']])await page.locator(`[name=share_${id}]`).fill(amount);
  await page.locator('.modal button[type=submit]').click();assert.match(await page.locator('#form-error').innerText(),/需要等于/);
  await page.locator('[name=share_u4]').fill('40');
  await page.screenshot({path:path.join(output,'desktop-modal.png')});
  await submit();data=await snapshot();assert.equal(Object.values(data.expenses[0].shares).reduce((a,b)=>a+b),10000);
  await page.locator('[data-action=expense-detail]').first().click();assert.match(await page.locator('.modal').innerText(),/¥40.00/);await close();
  await nav('chores');await page.locator('[data-action=reassign][data-id=c1]').click();await page.locator('[name=person]').selectOption('u2');await submit();assert.equal((await snapshot()).chores[0].person,'u2');
  await page.locator('[data-action=toggle-chore][data-id=c4]').click();assert.equal((await snapshot()).chores.find(x=>x.id==='c4').status,'done');
  await page.locator('[data-action=toggle-chore][data-id=c4]').click();assert.equal((await snapshot()).chores.find(x=>x.id==='c4').status,'overdue');
  await nav('items');await page.locator('[data-action=item-change][data-kind=consume][data-id=i1]').click();await page.locator('[name=qty]').fill('3');await page.locator('.modal button[type=submit]').click();assert.match(await page.locator('#form-error').innerText(),/库存不足/);await page.locator('[name=qty]').fill('1');await submit();assert.equal((await snapshot()).items[0].qty,1);
  await page.locator('[data-action=item-change][data-kind=restock][data-id=i1]').click();await page.locator('[name=qty]').fill('5');await submit();data=await snapshot();assert.equal(data.items[0].qty,6);assert.equal(data.items[0].claimedBy,null);assert.equal(data.items[0].logs[0].type,'restock');
  await page.locator('[data-action=logs][data-id=i1]').click();assert.match(await page.locator('.modal').innerText(),/补货 5卷/);await close();
  await nav('rules');await page.locator('[data-action=edit-rule][data-id=r1]').click();await page.locator('[name=content]').fill('晚上十一点后使用耳机。');await submit();assert.deepEqual((await snapshot()).rules[0].confirmed,[]);
  await page.locator('#current-user').selectOption('u2');await page.locator('[data-action=confirm-rule][data-id=r1]').click();assert.deepEqual((await snapshot()).rules[0].confirmed,['u2']);
  await page.locator('[data-action=add-rule]').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.modal').count(),0);
  await nav('home');await page.evaluate(()=>{localStorage.removeItem('wuli_housemate_v1')});await page.reload({waitUntil:'networkidle'});
  const viewports=[360,390,768,1024,1440];const layout=[];
  for(const width of viewports){
    await page.setViewportSize({width,height:900});
    for(const tab of ['home','expenses','chores','items','rules']){
      await page.evaluate(p=>go(p),tab);await page.waitForTimeout(260);
      const sizes=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth,document:document.documentElement.scrollWidth}));
      assert.ok(sizes.body<=sizes.viewport+1&&sizes.document<=sizes.viewport+1,`${width}/${tab} overflows: ${JSON.stringify(sizes)}`);
      layout.push({width,tab,...sizes});
      if(width===390)await page.screenshot({path:path.join(output,`mobile-${tab}.png`),fullPage:true});
    }
  }
  await page.setViewportSize({width:1440,height:1100});await nav('home');
  // Rapid navigation leaves a single active destination; animations are cancellable.
  await page.evaluate(()=>{go('expenses');go('items');go('rules');go('home')});
  assert.equal(await page.locator('#nav [aria-current=page]').getAttribute('data-page'),'home');
  await page.emulateMedia({reducedMotion:'reduce'});await nav('expenses');
  assert.equal(await page.locator('#content').evaluate(el=>el.getAnimations().length),0);
  await page.locator('[data-action=add-expense]').click();
  assert.equal(await page.locator('.modal').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');await close();
  await page.emulateMedia({reducedMotion:'no-preference'});await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.body.classList.contains('keyboard-input')),true);
  assert.deepEqual(failures,[]);
  const result={base,passed:true,assertions:['interactive evening scene','balanced 100/3 split','reload persistence','custom split mismatch and success','expense details','reassign chores','restore overdue status','inventory underflow guard','restock and logs','agreement reconfirmation','Escape dismissal','25 responsive layouts','rapid navigation interruption','reduced motion','keyboard motion opt-out','no uncaught browser errors'],layout,errors:failures};
  fs.writeFileSync(path.join(output,'qa-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
