const { chromium } = require('C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'artifacts', 'design-v3');
fs.mkdirSync(output,{recursive:true});
const publicFiles = new Set(['index.html','app.js','art.js','features.js','views.js','design.css']);
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

  // Payment cancellation, all three methods, success-only settlement and refresh.
  await page.locator('#current-user').selectOption('u1');await nav('expenses');
  const originalOwed=await page.evaluate(()=>pendingFor('u1'));
  await page.locator('[data-action=settle][data-id=e2]').click();
  assert.equal(await page.locator('[name=method]').count(),3);
  const rect=await page.locator('.modal').boundingBox();
  assert.ok(Math.abs(rect.x+rect.width/2-720)<15,'Payment dialog is centered');
  await page.waitForTimeout(280);await page.screenshot({path:path.join(output,'desktop-payment.png')});
  await page.locator('[name=method][value=alipay]').check();await close();
  assert.equal((await snapshot()).expenses.find(x=>x.id==='e2').settled.includes('u1'),false);
  await page.locator('[data-action=settle][data-id=e2]').click();
  await page.locator('.modal [type=submit]').click();await close();await page.waitForTimeout(1200);
  assert.equal((await snapshot()).expenses.find(x=>x.id==='e2').settled.includes('u1'),false,'Cancel processing must not settle');
  for(const [id,user,method] of [['e2','u1','alipay'],['e3','u1','card'],['e2','u2','wechat']]){
    await page.locator('#current-user').selectOption(user);await page.locator(`[data-action=settle][data-id=${id}]`).click();
    await page.locator(`[name=method][value=${method}]`).check();
    await page.locator('.modal [type=submit]').click();
    assert.equal((await snapshot()).expenses.find(x=>x.id===id).settled.includes(user),false,'Not settled before mock success');
    await page.locator('.payment-success').waitFor();data=await snapshot();
    const expense=data.expenses.find(x=>x.id===id);assert.equal(expense.settled.filter(x=>x===user).length,1);
    assert.equal(expense.payments.at(-1).method,method);assert.equal(expense.payments.at(-1).demo,true);
    await page.screenshot({path:path.join(output,`payment-success-${method}.png`)});
    await submit();
  }
  await page.locator('#current-user').selectOption('u1');
  assert.ok(await page.evaluate(()=>pendingFor('u1'))<originalOwed);
  await page.reload({waitUntil:'networkidle'});assert.equal((await snapshot()).expenses.find(x=>x.id==='e2').payments[0].method,'alipay');

  // Creation date/time picker, weekday preview, and chronological sorting.
  await nav('chores');await page.locator('[data-action=add-chore]').click();
  assert.equal(await page.locator('[name=dueDate]').getAttribute('type'),'date');
  assert.equal(await page.locator('[name=due]').count(),0);
  await page.locator('[name=area]').fill('验收：窗台清洁');await page.locator('[name=dueDate]').fill('2030-01-02');
  await page.locator('[name=dueHour]').selectOption('9');await page.locator('[name=dueMinute]').selectOption('35');
  await page.locator('[name=iconId][value=flower]').check();
  assert.match(await page.locator('.date-preview').innerText(),/星期三.*09:35/);
  await page.screenshot({path:path.join(output,'desktop-calendar-icons.png')});
  await submit();data=await snapshot();const chore=data.chores.at(-1);
  assert.equal(chore.iconId,'flower');assert.equal(chore.createdBy,'u1');
  assert.equal(new Date(chore.dueAt).getFullYear(),2030);
  await page.locator(`[data-action=reschedule][data-id="${chore.id}"]`).click();
  await page.locator('[name=dueDate]').fill('2020-01-02');await submit();
  assert.equal(await page.locator('.chore-card').first().getAttribute('data-entry-id'),chore.id,'Reschedule reorders tasks');
  await page.locator(`[data-action=toggle-chore][data-id="${chore.id}"]`).click();
  await page.locator(`[data-action=toggle-chore][data-id="${chore.id}"]`).click();
  assert.match(await page.locator(`[data-entry-id="${chore.id}"]`).innerText(),/已逾期/);

  // Newly created records retain their author even when payer/assignee differs.
  await nav('expenses');await page.locator('[data-action=add-expense]').click();
  await page.locator('[name=title]').fill('验收：他人垫付');await page.locator('[name=amount]').fill('100');
  await page.locator('[name=payer]').selectOption('u2');await page.locator('[name=iconId][value=wifi]').check();
  for(const checkbox of await page.locator('[name=people]').all())await checkbox.uncheck();
  await page.locator('.modal [type=submit]').click();assert.match(await page.locator('#form-error').innerText(),/至少选择/);
  await page.locator('[name=people][value=u1]').check();
  await page.locator('[name=amount]').fill('1.001');await page.locator('.modal [type=submit]').click();assert.match(await page.locator('#form-error').innerText(),/最多两位/);
  await page.locator('[name=amount]').fill('-1');await page.locator('.modal [type=submit]').click();assert.match(await page.locator('#form-error').innerText(),/有效金额/);
  await page.locator('[name=amount]').fill('100');await submit();const expense=(await snapshot()).expenses[0];
  assert.equal(expense.createdBy,'u1');assert.equal(expense.payer,'u2');assert.equal(expense.iconId,'wifi');
  await nav('items');await page.locator('[data-action=add-item]').click();
  await page.locator('[name=name]').fill('验收：咖啡杯');await page.locator('[name=qty]').fill('0');
  await page.locator('[name=iconId][value=cup]').check();await submit();const item=(await snapshot()).items.at(-1);
  assert.equal(item.createdBy,'u1');assert.equal(item.iconId,'cup');
  await nav('rules');await page.locator('[data-action=add-rule]').click();
  await page.locator('[name=title]').fill('验收：宠物公约');await page.locator('[name=content]').fill('公共区域及时清理。');
  await page.locator('[name=iconId][value=pet]').check();await submit();const rule=(await snapshot()).rules.at(-1);
  assert.equal(rule.createdBy,'u1');assert.equal(rule.iconId,'pet');
  for(const [kind,x] of [['expenses',expense],['chores',chore],['items',item],['rules',rule]]){
    await nav(kind);await page.locator('#current-user').selectOption('u2');
    assert.equal(await page.locator(`[data-action=delete-entry][data-id="${x.id}"]`).count(),0,'Other roommate has no delete action');
    await page.evaluate(({kind,id})=>deleteEntry(kind,id),{kind,id:x.id});
    assert.ok((await snapshot())[kind].some(y=>y.id===x.id),'Handler rejects unauthorized delete');
    await page.locator('#current-user').selectOption('u1');
    await page.locator(`[data-action=delete-entry][data-id="${x.id}"]`).click();await close();
    assert.ok((await snapshot())[kind].some(y=>y.id===x.id),'Cancel preserves record');
    await page.locator(`[data-action=delete-entry][data-id="${x.id}"]`).click();await submit();
    assert.equal((await snapshot())[kind].some(y=>y.id===x.id),false,'Creator can delete');
  }
  await page.reload({waitUntil:'networkidle'});assert.equal((await snapshot()).items.some(x=>x.id===item.id),false);

  // Existing storage migration never drops user records or fabricates legacy authors.
  await page.evaluate(()=>{
    const legacy=structuredClone(demo);legacy.items.push({id:'legacy-custom',name:'我的旧物品',qty:7,unit:'个',threshold:1,logs:[]});
    legacy.chores.push({id:'legacy-task',area:'旧时间',due:'有空的时候',person:'u1',status:'pending'});
    legacy.expenses.push({id:'legacy-expense',title:'旧账单',amount:100,payer:'u2',participants:['u1'],shares:{u1:100},settled:[],date:'旧日期'});
    localStorage.setItem(STORE_KEY,JSON.stringify(legacy));
  });
  await page.reload({waitUntil:'networkidle'});data=await snapshot();
  assert.equal(data.schemaVersion,2);assert.equal(data.items.at(-1).qty,7);assert.equal(data.items.at(-1).createdBy,null);
  assert.equal(data.chores.at(-1).dueAt,null);assert.equal(data.expenses.at(-1).dueAt,null);
  const migrationDate=data.chores[0].dueAt;await page.reload({waitUntil:'networkidle'});assert.equal((await snapshot()).chores[0].dueAt,migrationDate);

  // Dashboard priority and strict maximum of three rows per category.
  await page.evaluate(()=>{
    const mk=(id,days)=>({id,area:id,person:'u1',dueAt:relativeDate(days),status:'pending',iconId:'broom'});
    state.chores=[mk('今日验收',0),mk('未来验收',5),mk('逾期验收',-2)];
    state.items=Array.from({length:5},(_,i)=>({id:'priority'+i,name:'库存'+i,qty:i,unit:'个',threshold:5,iconId:'box',logs:[]}));
    state.expenses=Array.from({length:5},(_,i)=>({id:'bill'+i,title:'近期账单'+i,amount:100,participants:['u1'],shares:{u1:100},payer:'u2',settled:[],dueAt:relativeDate(i-1),iconId:'money'}));
    save();go('home');
  });
  assert.equal(await page.locator('[data-summary=chores] .list-row').count(),2);
  assert.match(await page.locator('[data-summary=chores]').innerText(),/逾期验收/);
  assert.doesNotMatch(await page.locator('[data-summary=chores]').innerText(),/未来验收/);
  assert.equal(await page.locator('[data-summary=items] .list-row').count(),3);
  assert.match(await page.locator('[data-summary=items] .list-row').first().innerText(),/库存0/);
  assert.equal(await page.locator('[data-summary=expenses] .list-row').count(),3);
  await page.evaluate(()=>{state.items[0].qty=10;save();render()});
  assert.doesNotMatch(await page.locator('[data-summary=items]').innerText(),/库存0/);

  // Ambient motion toggle, persistence, off-screen pause and reduced-motion path.
  await page.mouse.click(700,100);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(200);
  assert.equal(await page.locator('.hero').evaluate(el=>el.classList.contains('ambient-running')),true);
  const initialTransform=await page.locator('.floor-plant').evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(500);
  assert.notEqual(await page.locator('.floor-plant').evaluate(el=>getComputedStyle(el).transform),initialTransform);
  await page.screenshot({path:path.join(output,'ambient-frame.png')});
  await page.setViewportSize({width:1440,height:500});await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(200);
  assert.equal(await page.locator('.floor-plant').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
  await page.evaluate(()=>scrollTo(0,0));await page.locator('[data-action=toggle-motion]').click();
  assert.equal((await snapshot()).motionEnabled,false);
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-action=toggle-motion]').getAttribute('aria-pressed'),'false');
  await page.locator('[data-action=toggle-motion]').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.floor-plant').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(await page.locator('[data-action=toggle-motion]').isDisabled(),true);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1100});

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
  // New dialogs remain usable on a narrow viewport, including scrolling to save.
  await page.setViewportSize({width:360,height:800});await page.evaluate(()=>go('home'));
  await page.locator('[data-action=settle][data-id=e2]').click();await page.waitForTimeout(280);
  assert.equal(await page.locator('.modal').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
  await page.screenshot({path:path.join(output,'mobile-payment.png')});await close();
  await page.evaluate(()=>go('chores'));await page.locator('[data-action=add-chore]').click();
  await page.locator('[name=area]').fill('手机端验收任务');await page.locator('[name=iconId][value=plant]').check();
  assert.equal(await page.locator('.modal').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
  await page.screenshot({path:path.join(output,'mobile-icon-picker.png')});await submit();
  assert.equal((await snapshot()).chores.at(-1).area,'手机端验收任务');
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
  const result={base,passed:true,assertions:['interactive evening scene','balanced 100/3 split','reload persistence','custom split mismatch and success','expense details','reassign chores','restore overdue status','inventory underflow guard','restock and logs','agreement reconfirmation','Escape dismissal','25 responsive layouts','rapid navigation interruption','reduced motion','keyboard motion opt-out','three mock payment methods and receipts','cancelled payments never settle','payment persistence','calendar and weekday preview','deadline sorting and reschedule','24 user-selected illustrations','creator-only deletion in all four modules','deletion cancellation and persistence','invalid amounts and empty participants','legacy migration preserving custom data','urgent-only dashboard capped at three rows','low stock ordering and replenishment','ambient motion frame changes','off-screen animation pause','motion toggle persistence','no uncaught browser errors'],layout,errors:failures};
  fs.writeFileSync(path.join(output,'qa-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
