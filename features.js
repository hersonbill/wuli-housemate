// Local-only demo: no payment network requests or financial information collected.
const pictureCatalog = [
  ['plant','绿植','M16 43V23m0 10C2 33 3 20 16 23m0 5c14 0 15-15 0-11m-8 25h16l-3 12H11z'],
  ['paper','纸巾','M10 14h23a7 7 0 0 1 7 7v24H10zm0 0c-9 0-9 13 0 13h23m0-13v13m-12 7h10m-10 6h7'],
  ['soap','洗护','M18 16h16v8H18zm4 0V9h15m-10 0v7M14 24h24l3 26H11zM19 34h14v9H19z'],
  ['bag','垃圾袋','M14 17h25l5 34H9zm7 0v-6h11v6m-12 17h14m-7-7v14'],
  ['kitchen','厨房','M10 10v14m6-14v14m6-14v14M10 20h12v7l-6 5v20M36 10c-10 16-8 22 0 22v20m0-42v22'],
  ['bath','卫浴','M8 30h39v10H8zm4 10v8m30-8v8M14 30V12c0-10 15-9 15 0m-5 3h11m-7 7v2m7-2v2'],
  ['sofa','客厅','M12 31V19c0-6 30-6 30 0v12M8 27h8v12h22V27h9v20H8zm5 20v5m28-5v5'],
  ['broom','清洁','M32 6 21 31m-7-3 16 7-7 18L6 45zm6 6-7 14m13-10-6 12'],
  ['laundry','衣物','M18 12 7 21l7 10 5-4v23h22V27l5 4 7-10-13-9c-2 8-17 8-22 0z'],
  ['cup','杯具','M10 20h27v23c-8 9-20 9-27 0zm27 4h6c10 0 9 14-6 14M16 8v6m9-8v8m8-6v6'],
  ['food','食品','M11 24h34v23H11zm-2-7h38v7H9zm8-5h22m-17 22h12m-6-5v10'],
  ['water','饮水','M28 7C18 21 10 29 10 37a18 18 0 0 0 36 0C46 29 38 21 28 7zM18 36c0 7 4 10 9 10'],
  ['bolt','电器','M31 5 12 32h15l-3 21 22-31H30z'],
  ['wifi','网络','M5 19c13-13 33-13 46 0M13 28c9-9 21-9 30 0M21 37c4-4 10-4 14 0m-7 10h.1'],
  ['home','房屋','M6 26 28 7l22 19M12 22v29h32V22M23 51V34h10v17'],
  ['tools','工具','M37 8c-14-6-24 10-15 20L7 43l7 7 15-17c12 5 22-6 17-16l-8 8-8-8z'],
  ['moon','作息','M38 7C9 4 2 41 27 49c11 4 22-2 26-12C30 44 20 20 38 7z'],
  ['guest','访客','M28 28a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9 50c0-23 38-23 38 0z'],
  ['pet','宠物','M16 40c0-7 7-17 12-17s12 10 12 17c0 11-9 5-12 5s-12 6-12-5zM9 21a4 6 0 1 0 8 0 4 6 0 1 0-8 0m12-7a4 6 0 1 0 8 0 4 6 0 1 0-8 0m12 0a4 6 0 1 0 8 0 4 6 0 1 0-8 0m9 10a4 6 0 1 0 8 0 4 6 0 1 0-8 0'],
  ['book','书籍','M28 15C19 9 9 10 5 13v33c8-4 17-3 23 2 6-5 15-6 23-2V13c-5-3-16-4-23 2v33M12 21l9 2m-9 6 9 2m14-8 9-2m-9 10 9-2'],
  ['money','费用','M7 16h42v30H7zm21 6v18m-6-17 6 7 6-7m-12 8h12m-12 5h12M11 10h34'],
  ['heart','约定','M28 47 9 28C-4 12 16 2 28 18 40 2 60 12 47 28z'],
  ['flower','鲜花','M28 30c-17 9-23-12-10-15-1-16 23-16 22 0 16 5 10 24-12 15zm0 0v23m0-10 12-7m-12 1-10-6'],
  ['box','收纳','M7 18 28 8l21 10v27L28 54 7 45zm0 0 21 10 21-10M28 28v26M17 13l21 10v11']
];
function picture(id,cls=''){
  const entry=pictureCatalog.find(x=>x[0]===id)||pictureCatalog.at(-1);
  return `<svg class="picture ${cls}" viewBox="0 0 56 60" fill="none" aria-hidden="true"><path d="${entry[2]}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function iconPicker(selected='box'){
  return `<fieldset class="icon-picker"><legend>选一枚生活图案 <small>24 款通用图案，由你来定义</small></legend><div class="icon-options">${pictureCatalog.map(([id,name])=>`<label class="icon-option"><input type="radio" name="iconId" value="${id}" ${id===selected?'checked':''}><span>${picture(id)}<small>${name}</small></span></label>`).join('')}</div></fieldset>`;
}
function inferPicture(x,kind){
  const t=x.name||x.area||x.title||'';
  for(const [re,id] of [[/纸/,'paper'],[/垃圾/,'bag'],[/洗衣|洗洁|液/,'soap'],[/厨房/,'kitchen'],[/卫生|浴/,'bath'],[/客厅/,'sofa'],[/植|阳台/,'plant'],[/宽带|网/,'wifi'],[/电/,'bolt'],[/水/,'water'],[/安静|作息/,'moon'],[/访客/,'guest']])if(re.test(t))return id;
  return {expenses:'money',chores:'broom',items:'box',rules:'heart'}[kind];
}
function dateValue(date=new Date()){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function relativeDate(days,hour=21){const d=new Date();d.setDate(d.getDate()+days);d.setHours(hour,0,0,0);return d.toISOString()}
function parseLegacyDue(text){
  const match=String(text||'').match(/^(今天|明天|昨天|周[一二三四五六日天])(?:\s+(\d{1,2}):(\d{2}))?$/);
  if(!match)return null;
  const day=match[1],d=new Date();let offset={今天:0,明天:1,昨天:-1}[day];
  if(offset===undefined)offset=(({'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'日':0,'天':0}[day[1]])-d.getDay()+7)%7;
  d.setDate(d.getDate()+offset);d.setHours(Number(match[2]||21),Number(match[3]||0),0,0);return d.toISOString();
}
function migrateData(data){
  if(data.schemaVersion===2)return data;
  const owners={e1:'u1',e2:'u3',e3:'u2',c1:'u1',c2:'u2',c3:'u3',c4:'u4',c5:'u1',i1:'u2',i2:'u1',i3:'u3',i4:'u4',r1:'u1',r2:'u2',r3:'u3'};
  for(const kind of ['expenses','chores','items','rules'])for(const x of data[kind]){
    x.createdBy=x.createdBy||owners[x.id]||null;x.iconId=x.iconId||inferPicture(x,kind);
    if(kind==='chores')x.dueAt=x.dueAt||parseLegacyDue(x.due);
    if(kind==='expenses'){x.dueAt=x.dueAt||({e1:relativeDate(0),e2:relativeDate(1),e3:relativeDate(7)})[x.id]||null;x.payments=x.payments||[]}
  }
  data.schemaVersion=2;data.motionEnabled=data.motionEnabled!==false;return data;
}
function deadlineText(iso){if(!iso||!Number.isFinite(Date.parse(iso)))return '尚未设置日期';return new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric',weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso))}
function choreStatus(x){return x.status==='done'?'done':x.dueAt&&Date.parse(x.dueAt)<Date.now()?'overdue':x.dueAt?'pending':x.status==='overdue'?'overdue':'pending'}
function byDeadline(a,b){return (Date.parse(a.dueAt)||Infinity)-(Date.parse(b.dueAt)||Infinity)}
function myUrgentBills(){return state.expenses.filter(x=>x.participants.includes(state.currentUser)&&!x.settled.includes(state.currentUser)&&x.dueAt&&Date.parse(x.dueAt)<=Date.now()+72*3600000).sort(byDeadline)}
function myTodayChores(){return state.chores.filter(x=>x.person===state.currentUser&&x.status!=='done'&&x.dueAt&&(dateValue(x.dueAt)===dateValue()||Date.parse(x.dueAt)<Date.now())).sort(byDeadline)}
function lowItems(){return state.items.filter(x=>x.qty<=x.threshold).sort((a,b)=>(a.qty/Math.max(a.threshold,1))-(b.qty/Math.max(b.threshold,1))||a.qty-b.qty)}
function dateFields(value=relativeDate(0),label='完成日期'){
  const d=new Date(value||relativeDate(0));
  return `<div class="date-fields field full"><label for="due-date">${label}</label><input id="due-date" name="dueDate" type="date" required value="${dateValue(d)}"><div class="time-selects"><label>小时<select name="dueHour" aria-label="小时">${Array.from({length:24},(_,i)=>`<option value="${i}" ${d.getHours()===i?'selected':''}>${String(i).padStart(2,'0')} 时</option>`).join('')}</select></label><span>:</span><label>分钟<select name="dueMinute" aria-label="分钟">${Array.from({length:60},(_,i)=>`<option value="${i}" ${d.getMinutes()===i?'selected':''}>${String(i).padStart(2,'0')} 分</option>`).join('')}</select></label></div><output class="date-preview" aria-live="polite">${deadlineText(d.toISOString())}</output></div>`;
}
function selectedDeadline(fd){
  const date=fd.get('dueDate'),hour=Number(fd.get('dueHour')),minute=Number(fd.get('dueMinute'));
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||hour<0||hour>23||minute<0||minute>59)return null;
  const d=new Date(`${date}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`);
  return Number.isFinite(d.getTime())&&dateValue(d)===date?d.toISOString():null;
}
function bindDateFields(){const form=document.querySelector('form.modal');if(!form?.querySelector('.date-fields'))return;form.addEventListener('change',()=>{const iso=selectedDeadline(new FormData(form));form.querySelector('.date-preview').textContent=iso?deadlineText(iso):'请选择有效日期与时间'});form.querySelector('[type=date]').addEventListener('click',e=>{try{e.target.showPicker()}catch{/* Native calendar remains usable on unsupported browsers. */}})}
function authorship(x,kind){return `<div class="authorship"><small>${x.createdBy?`${esc(person(x.createdBy).name)} 发布`:'旧记录 · 发布者未记录'}</small>${x.createdBy===state.currentUser?`<button class="delete-btn" data-action="delete-entry" data-kind="${kind}" data-id="${x.id}">删除</button>`:''}</div>`}
function deleteEntry(kind,id){
  if(!['expenses','chores','items','rules'].includes(kind))return;
  const x=state[kind].find(x=>x.id===id);if(!x||x.createdBy!==state.currentUser)return toast('仅发布者可以删除自己的记录');
  openModal('删除这条记录？',`<div class="delete-confirm"><b>${esc(x.title||x.area||x.name)}</b><p>删除后，相关分摊、确认或流水也会从本演示空间移除。此操作无法撤销。</p><span class="tag">发布者：${esc(person(x.createdBy).name)}</span></div>`,()=>{if(x.createdBy!==state.currentUser)return error('当前身份不是发布者');state[kind]=state[kind].filter(entry=>entry.id!==id);save();closeModal();render();toast('记录已删除，首页已同步更新')},'确认删除');
  document.querySelector('.modal [type=submit]').classList.add('danger-btn');
}
let paymentTimer=null,paymentSession=null;
function cancelPayment(){clearTimeout(paymentTimer);paymentTimer=null;paymentSession=null}
function startPayment(id){
  const x=state.expenses.find(x=>x.id===id),user=state.currentUser;
  if(!x||!x.participants.includes(user)||x.settled.includes(user))return;
  openModal('结算这笔共同开支',`<div class="payment-sheet"><span class="demo-banner">演示支付 · 不会扣款，也不收集账户信息</span><p>${esc(x.title)}</p><strong class="payment-amount">${money(x.shares[user])}</strong><small>${esc(person(user).name)} → 垫付人 ${esc(person(x.payer).name)}</small><fieldset class="payment-methods"><legend>选择演示支付方式</legend>${[['wechat','微信支付','微'],['alipay','支付宝','支'],['card','银行卡','卡']].map(([id,name,symbol],i)=>`<label class="payment-option"><input type="radio" name="method" value="${id}" ${i===0?'checked':''}><span class="payment-logo pay-${id}">${symbol}</span><b>${name}</b><small>模拟</small></label>`).join('')}</fieldset><p class="payment-hint">选择方式不会结清账单。点击下方按钮，完成模拟支付后才会更新结清状态。</p><div class="payment-status" role="status"></div></div>`,(fd,form)=>{
    if(paymentSession)return;
    const method=fd.get('method');if(!['wechat','alipay','card'].includes(method))return error('请选择支付方式');
    const token={id,user,method};paymentSession=token;
    form.querySelector('[type=submit]').disabled=true;form.querySelector('[type=submit]').textContent='正在模拟支付…';form.querySelectorAll('[name=method]').forEach(el=>el.disabled=true);
    form.querySelector('.payment-status').textContent='正在模拟处理，可以取消。不会发起真实交易。';
    paymentTimer=setTimeout(()=>{
      if(paymentSession!==token||!form.isConnected||state.currentUser!==user)return;
      const current=state.expenses.find(e=>e.id===id);if(!current||current.settled.includes(user)){cancelPayment();closeModal();return}
      current.settled.push(user);current.payments=current.payments||[];current.payments.push({id:uid('demo-pay-'),user,method,amount:current.shares[user],time:new Date().toISOString(),demo:true});save();render();
      form.querySelector('.payment-sheet').innerHTML=`<div class="payment-success"><span class="success-seal">${icon('check')}</span><h3>演示支付成功</h3><strong class="payment-amount">${money(current.shares[user])}</strong><p>已更新你在这笔账单中的结清状态</p><span class="demo-banner">仅模拟流程 · 实际扣款 ¥0.00</span><dl><dt>支付方式</dt><dd>${{wechat:'微信支付',alipay:'支付宝',card:'银行卡'}[method]}（演示）</dd><dt>完成时间</dt><dd>${deadlineText(new Date().toISOString())}</dd></dl></div>`;
      form.querySelector('.modal-actions').innerHTML='<button class="primary-btn" type="submit">完成</button>';form.onsubmit=e=>{e.preventDefault();closeModal()};form.querySelector('[type=submit]').focus({preventScroll:true});cancelPayment();
    },1100);
  },'确认模拟支付');
}
function rescheduleChore(id){const x=state.chores.find(x=>x.id===id);if(!x)return;openModal('调整完成时间',`<p class="form-note">${esc(x.area)} · 保存后会按日期重新排序</p>${dateFields(x.dueAt)}`,fd=>{const dueAt=selectedDeadline(fd);if(!dueAt)return error('请选择有效日期与时间');x.dueAt=dueAt;save();closeModal();render();toast('完成时间已更新，排班已重新排序')});bindDateFields()}
function ambientArt(){return `<div class="ambient-decoration" aria-hidden="true"><span class="drifting-leaf leaf-a">${icon('leaf')}</span><span class="drifting-leaf leaf-b">${icon('leaf')}</span><svg class="breeze" viewBox="0 0 200 80" fill="none"><path d="M4 47c40-39 70 27 118-6s62-10 68-7M25 63c32-22 58 16 83-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>`}
let ambientObserver=null,ambientVisible=false;
function syncAmbient(){
  const hero=document.querySelector('.hero');if(!hero)return;
  const enabled=state.motionEnabled!==false&&!reduceMotion();
  hero.classList.toggle('motion-enabled',enabled);hero.classList.toggle('ambient-running',enabled&&ambientVisible&&!document.hidden&&!document.body.classList.contains('modal-open'));
  const b=hero.querySelector('[data-action=toggle-motion]');if(b){b.setAttribute('aria-pressed',String(enabled));b.textContent=reduceMotion()?'系统已减少动态效果':enabled?'微风轻动 · 开':'微风轻动 · 关';b.disabled=reduceMotion()}
}
function observeAmbient(){ambientObserver?.disconnect();ambientVisible=false;const hero=document.querySelector('.hero');if(!hero)return;ambientObserver=new IntersectionObserver(entries=>{ambientVisible=entries[0].isIntersecting;syncAmbient()},{threshold:.1});ambientObserver.observe(hero);syncAmbient()}
document.addEventListener('visibilitychange',()=>{syncAmbient();if(!document.hidden&&typeof state!=='undefined'&&!document.querySelector('.modal'))render()});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncAmbient);
