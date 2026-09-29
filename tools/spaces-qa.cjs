const {chromium}=require('C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts','spaces-v5');fs.mkdirSync(out,{recursive:true});
const files=new Set(['index.html','app.js','features.js','spaces.js','views.js','art.js','design.css','themes.css']);
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.has(name)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)))});
let browser;const errors=[];
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.WULI_QA_URL||`http://127.0.0.1:${server.address().port}/`;
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1050},locale:'zh-CN'});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'networkidle'});
  const snap=()=>p.evaluate(()=>JSON.parse(localStorage.getItem(SPACE_STORE)));
  const action=(name)=>p.locator(`[data-action=${name}]`).first();
  const submit=async()=>{await p.locator('.modal [type=submit]').click();await p.locator('.modal').waitFor({state:'detached'})};
  const close=async()=>{await p.locator('.modal .close').click();await p.locator('.modal').waitFor({state:'detached'})};
  const settings=async(tab='space')=>{await action('open-settings').click();if(tab!=='space')await p.locator(`[data-action=settings-tab][data-id=${tab}]`).click()};
  const user=async id=>{await settings('demo');await p.locator('#current-user').selectOption(id);await p.locator('.modal').waitFor({state:'detached'})};
  const go=tab=>p.evaluate(t=>go(t),tab);
  const switchRoom=async id=>{await p.locator('.sidebar [data-action=choose-space]').click();await p.locator(`[data-action=switch-space][data-id="${id}"]`).click();await p.locator('.modal').waitFor({state:'detached'})};
  const addExisting=async id=>{await settings('members');await action('add-member').click();await p.locator('[name=existing]').selectOption(id);await submit()};
  let w=await snap();const original=w.spaces[0].id;assert.equal(w.version,3);assert.equal(w.spaces[0].ownerId,'u1');assert.deepEqual(w.spaces[0].memberIds,['u1','u2','u3','u4']);
  const initialShares=JSON.stringify(w.spaces[0].expenses[0].shares);
  await settings();await action('rename-space').click();await p.locator('[name=spaceName]').fill('向阳小屋 <&>');await submit();assert.equal(await p.locator('#space-label').innerText(),'向阳小屋 <&>');
  await settings('members');await action('add-member').click();await p.locator('[name=name]').fill('小夏');await submit();w=await snap();const xia=w.people.at(-1).id;assert.equal(w.spaces[0].memberIds.length,5);assert.equal(JSON.stringify(w.spaces[0].expenses[0].shares),initialShares);
  assert.equal(await p.evaluate(()=>currentConfirmations(state.rules[0]).length),4);await go('rules');assert.match(await p.locator('[data-entry-id=r1]').innerText(),/4 \/ 5/);
  await user(xia);await settings();assert.equal(await action('rename-space').count(),0);await close();
  await p.evaluate(()=>{renameSpace();addMemberForm();transferOwner();deleteEntry('expenses','e1')});assert.equal(await p.locator('.modal').count(),0);assert.equal((await snap()).spaces[0].expenses.length,3);
  await go('items');await action('add-item').click();await p.locator('[name=name]').fill('小夏发布');await submit();const xiaItem=(await snap()).spaces[0].items.at(-1).id;
  await user('u1');await go('items');await p.locator(`[data-action=delete-entry][data-id="${xiaItem}"]`).click();await submit();assert.equal((await snap()).spaces[0].items.some(x=>x.id===xiaItem),false,'Owner deletes another author record');
  // Create a second space with independent empty records.
  await p.locator('.sidebar [data-action=choose-space]').click();await action('create-space').click();await p.locator('[name=spaceName]').fill('第二个家');await submit();w=await snap();const second=w.activeSpaceId;assert.notEqual(second,original);assert.equal(w.spaces.find(s=>s.id===second).expenses.length,0);
  await addExisting('u2');await go('expenses');await action('add-expense').click();await p.locator('[name=title]').fill('第二空间专属账');await p.locator('[name=amount]').fill('100');await submit();
  w=await snap();const expense=w.spaces.find(s=>s.id===second).expenses[0];assert.deepEqual(expense.participants,['u1','u2']);assert.equal(w.spaces[0].expenses.some(e=>e.title==='第二空间专属账'),false);
  await go('chores');await action('add-chore').click();await p.locator('[name=area]').fill('交接厨房');await p.locator('[name=person]').selectOption('u2');await submit();const task=(await snap()).spaces.find(s=>s.id===second).chores[0];
  await go('items');await action('add-item').click();await p.locator('[name=name]').fill('待采购纸巾');await submit();const stock=(await snap()).spaces.find(s=>s.id===second).items[0];
  await user('u2');await go('items');await p.locator(`[data-action=claim][data-id="${stock.id}"]`).click();
  await settings();await action('leave-space').click();assert.match(await p.locator('.departure-warning').innerText(),/50.00/);await p.locator('.modal [type=submit]').click();assert.match(await p.locator('#form-error').innerText(),/先结清/);await close();
  // The payer cannot depart while receivables remain, even after handing off ownership.
  await user('u1');await settings('members');await action('transfer-owner').click();await p.locator('[name=owner]').selectOption('u2');await submit();await settings();await action('leave-space').click();assert.match(await p.locator('.departure-warning').innerText(),/待收齐.*50.00/);await close();
  await user('u2');await settings('members');await action('transfer-owner').click();await p.locator('[name=owner]').selectOption('u1');await submit();
  await go('expenses');await p.locator(`[data-action=settle][data-id="${expense.id}"]`).click();await p.locator('.modal [type=submit]').click();await p.locator('.payment-success').waitFor();await submit();
  await user('u1');await settings('members');await p.locator('[data-action=remove-member][data-id=u2]').click();await p.locator('[name=handover]').selectOption('u1');await submit();w=await snap();let room=w.spaces.find(s=>s.id===second);assert.deepEqual(room.memberIds,['u1']);assert.equal(room.chores[0].person,'u1');assert.equal(room.items[0].claimedBy,null);assert.ok(w.people.some(p=>p.id==='u2'));assert.ok(room.expenses[0].participants.includes('u2'));
  await addExisting('u2');await settings('members');await action('transfer-owner').click();await p.locator('[name=owner]').selectOption('u2');await submit();assert.equal((await snap()).spaces.find(s=>s.id===second).ownerId,'u2');
  await user('u2');await settings();await action('leave-space').click();assert.match(await p.locator('.modal').innerText(),/先转让房主/);await close();await settings('members');await action('transfer-owner').click();await p.locator('[name=owner]').selectOption('u1');await submit();
  await settings();await action('leave-space').click();await submit();assert.equal((await snap()).activeSpaceId,original);
  await user('u1');await switchRoom(second);await p.reload({waitUntil:'networkidle'});assert.equal((await snap()).activeSpaceId,second);assert.equal(await p.locator('#space-label').innerText(),'第二个家');
  // Invites contain no accounting data, expire on rotation and are local-only.
  await settings();await action('share-space').click();const oldInvite=await p.locator('#invite-link').inputValue();assert.ok(!oldInvite.includes('expenses'));
  p.once('dialog',d=>d.accept());await action('rotate-invite').click();const invite=await p.locator('#invite-link').inputValue();assert.notEqual(invite,oldInvite);await close();
  await user(xia);await p.evaluate(()=>joinSpaceForm());await p.locator('[name=invite]').fill(oldInvite);await p.locator('.modal [type=submit]').click();assert.match(await p.locator('#form-error').innerText(),/失效/);await close();
  await p.evaluate(()=>joinSpaceForm());await p.locator('[name=invite]').fill(invite);await submit();assert.equal((await snap()).activeSpaceId,second);assert.ok((await snap()).spaces.find(s=>s.id===second).memberIds.includes(xia));
  await p.evaluate(()=>joinSpaceForm());await p.locator('[name=invite]').fill(invite);await submit();assert.equal((await snap()).spaces.find(s=>s.id===second).memberIds.filter(id=>id===xia).length,1);
  const otherContext=await browser.newContext({viewport:{width:390,height:844}}),other=await otherContext.newPage();other.on('pageerror',e=>errors.push(e.message));await other.goto(invite,{waitUntil:'networkidle'});assert.match(await other.locator('.modal').innerText(),/空间邀请/);await other.locator('.modal [type=submit]').click();assert.match(await other.locator('#form-error').innerText(),/不能跨设备/);await otherContext.close();
  await settings();await action('leave-space').click();await submit();
  // A member removed from their only room sees the no-space lobby.
  await user('u1');await switchRoom(second);await settings('members');await action('add-member').click();await p.locator('[name=name]').fill('新室友');await submit();const newcomer=(await snap()).people.at(-1).id;
  await settings('members');await p.locator(`[data-action=remove-member][data-id="${newcomer}"]`).click();await submit();await user(newcomer);assert.equal((await snap()).activeSpaceId,null);assert.equal(await p.locator('.lobby-card').count(),1);assert.equal(await p.locator('#nav [data-page=expenses]').isDisabled(),true);
  await action('create-space').click();await p.locator('[name=spaceName]').fill('自己的新家');await submit();assert.equal(await p.evaluate(()=>isOwner()),true);
  // Last owner's departure archives rather than deleting the historical room.
  await settings();await action('leave-space').click();await submit();assert.equal((await snap()).activeSpaceId,null);assert.ok((await snap()).spaces.some(s=>s.name==='自己的新家'&&s.archived));
  await user('u1');await switchRoom(original);
  // Three genuinely different layouts; same operations and persisted data.
  const fingerprint=await p.evaluate(()=>JSON.stringify(spaceCollections.map(k=>state[k]))),layouts=[];
  for(const theme of ['journal','editorial','night']){
    await settings('appearance');await p.locator(`[data-action=set-theme][data-id=${theme}]`).click();await p.waitForTimeout(260);await p.screenshot({path:path.join(out,`${theme}-settings.png`)});await close();assert.equal(await p.locator('html').getAttribute('data-theme'),theme);
    for(const width of [360,390,768,1024,1440]){
      await p.setViewportSize({width,height:1000});
      for(const tab of ['home','expenses','chores','items','rules']){
        await go(tab);await p.waitForTimeout(80);const size=await p.evaluate(()=>({body:document.body.scrollWidth,html:document.documentElement.scrollWidth,width:innerWidth}));assert.ok(size.body<=width+1&&size.html<=width+1,`${theme}/${width}/${tab} overflow: ${JSON.stringify(size)}`);layouts.push({theme,width,tab});
        if([390,1440].includes(width)&&['home','expenses'].includes(tab))await p.screenshot({path:path.join(out,`${theme}-${width}-${tab}.png`),fullPage:true});
      }
    }
    assert.equal(await p.evaluate(()=>JSON.stringify(spaceCollections.map(k=>state[k]))),fingerprint,'Themes must never mutate business data');
    await go('expenses');await p.locator('[data-action=settle][data-id=e2]').click();await p.waitForTimeout(260);await p.screenshot({path:path.join(out,`${theme}-payment.png`)});await close();
    await go('items');await action('add-item').click();await p.locator('[name=name]').fill('主题交互 '+theme);await p.waitForTimeout(260);await p.screenshot({path:path.join(out,`${theme}-form.png`)});await submit();const id=(await snap()).spaces[0].items.at(-1).id;await p.locator(`[data-action=delete-entry][data-id="${id}"]`).click();await submit();
  }
  await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('html').getAttribute('data-theme'),'night');
  await settings('demo');const download=p.waitForEvent('download');await action('export-spaces').click();assert.match((await download).suggestedFilename(),/^wuli-spaces-.*\.json$/);await close();
  await settings('demo');const count=(await snap()).spaces.length;p.once('dialog',d=>d.dismiss());await action('reset-demo').click();assert.equal((await snap()).spaces.length,count);p.once('dialog',d=>d.accept());await action('reset-demo').click();await p.locator('.modal').waitFor({state:'detached'});assert.equal((await snap()).spaces.length,1);assert.ok(await p.evaluate(()=>localStorage.getItem('wuli_housemate_backup_before_reset')));
  assert.deepEqual(errors,[]);const result={base,passed:true,checks:['migration projection','space rename','add and switch member','owner versus member guard','owner deletes other authors','new space isolation','unchanged historical shares','new member agreement counts','unpaid debt exit guard','receivable exit guard','chore handover and release claims','owner transfer and leave guard','space switching and reload','invitation rotation','idempotent local join','cross-browser invitation boundary','member removal and no-space lobby','last-member archive','75 theme/viewport/module layouts','theme operation parity','theme data invariance','theme persistence','backup export','cancel reset and backup before reset'],layouts,errors};fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
