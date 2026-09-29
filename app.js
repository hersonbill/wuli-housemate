const STORE_KEY = 'wuli_housemate_v1';
const navItems = [
  ['home','home','生活总览'],['expenses','expenses','共同账本'],['chores','chores','清洁值日'],['items','items','公共物品'],['rules','rules','室友公约']
];
const demo = {
  version:1,currentUser:'u1',
  people:[
    {id:'u1',name:'小林',color:'#3f7a5e'},{id:'u2',name:'阿泽',color:'#c9822c'},
    {id:'u3',name:'圆圆',color:'#6683a3'},{id:'u4',name:'大宇',color:'#a66c70'}
  ],
  expenses:[
    {id:'e1',title:'九月电费',amount:18642,payer:'u1',participants:['u1','u2','u3','u4'],shares:{u1:4661,u2:4661,u3:4660,u4:4660},date:'09-26',settled:['u1','u3']},
    {id:'e2',title:'宽带续费',amount:36000,payer:'u3',participants:['u1','u2','u3','u4'],shares:{u1:9000,u2:9000,u3:9000,u4:9000},date:'09-22',settled:['u3']},
    {id:'e3',title:'客厅绿植',amount:6800,payer:'u2',participants:['u1','u2','u3'],shares:{u1:2267,u2:2267,u3:2266},date:'09-18',settled:['u2','u3']}
  ],
  chores:[
    {id:'c1',area:'厨房',icon:'🍳',person:'u1',due:'今天 21:00',status:'pending'},
    {id:'c2',area:'卫生间',icon:'🫧',person:'u2',due:'周三',status:'pending'},
    {id:'c3',area:'客厅',icon:'🪴',person:'u3',due:'周五',status:'pending'},
    {id:'c4',area:'垃圾分类',icon:'♻️',person:'u4',due:'昨天',status:'overdue'},
    {id:'c5',area:'玄关整理',icon:'🧺',person:'u1',due:'周日',status:'done'}
  ],
  items:[
    {id:'i1',name:'卷纸',icon:'🧻',qty:2,unit:'卷',threshold:2,claimedBy:'u2',logs:[{type:'consume',qty:1,user:'u4',time:'今天 08:42'}]},
    {id:'i2',name:'洗洁精',icon:'🫧',qty:18,unit:'%',threshold:20,claimedBy:null,logs:[{type:'consume',qty:8,user:'u1',time:'昨天 20:16'}]},
    {id:'i3',name:'垃圾袋',icon:'🗑️',qty:12,unit:'个',threshold:5,claimedBy:null,logs:[{type:'restock',qty:10,user:'u3',time:'周一 18:20'}]},
    {id:'i4',name:'洗衣液',icon:'🧴',qty:65,unit:'%',threshold:20,claimedBy:null,logs:[]}
  ],
  rules:[
    {id:'r1',title:'夜间安静时间',content:'工作日 23:00 后降低音量，使用耳机；周末延后至 24:00。',category:'作息',confirmed:['u1','u2','u3','u4']},
    {id:'r2',title:'访客提前告知',content:'留宿访客至少提前一天在群里说明，征得室友同意。',category:'访客',confirmed:['u1','u2','u3']},
    {id:'r3',title:'公共区域随手归位',content:'使用完厨房和客厅后及时清理，个人物品不过夜堆放。',category:'清洁',confirmed:['u1','u3']}
  ]
};
let state = load(); let page = 'home'; let expenseMode = 'all'; let roomLit=false;
function load(){try{const x=JSON.parse(localStorage.getItem(STORE_KEY));return x?.version===1?x:structuredClone(demo)}catch{return structuredClone(demo)}}
function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch{toast('浏览器暂时无法保存，当前修改将在关闭后丢失')}}
function person(id){return state.people.find(p=>p.id===id)||{name:'未知',color:'#777'}}
function money(c){return `¥${(c/100).toFixed(2)}`}
function uid(prefix){return prefix+crypto.randomUUID()}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function avatar(id,size=''){const p=person(id);return `<span class="avatar" title="${esc(p.name)}" style="background:${p.color};${size}">${esc(p.name.slice(-1))}</span>`}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1900)}
function init(){
  const nav = navItems.map(([id,symbol,label])=>`<button class="nav-btn ${page===id?'active':''}" data-page="${id}"><span class="nav-icon">${icon(symbol)}</span><span>${label}</span></button>`).join('');
  document.querySelector('#nav').innerHTML=nav;document.querySelector('#bottom-nav').innerHTML=nav;
  document.querySelector('#current-user').innerHTML=state.people.map(p=>`<option value="${p.id}" ${p.id===state.currentUser?'selected':''}>${p.name}</option>`).join('');
  render();
}
let keyboardInput=false,modalTrigger=null,closingTimer;
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function go(p){
  if(!navItems.some(x=>x[0]===p))return;
  const previous=navItems.findIndex(x=>x[0]===page),next=navItems.findIndex(x=>x[0]===p);
  page=p;render();
  const panel=document.querySelector('#content');panel.getAnimations().forEach(a=>a.cancel());
  if(!keyboardInput&&!reduceMotion()&&previous!==next)panel.animate([{opacity:.35,transform:`translateX(${next>previous?9:-9}px)`},{opacity:1,transform:'translateX(0)'}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'});
  window.scrollTo({top:0,behavior:'instant'});
}
function pageHead(kicker,title,sub,button=''){return `<div class="page-head"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${sub}</p></div>${button}</div>`}
function pendingFor(id){return state.expenses.reduce((sum,e)=>sum+(!e.settled.includes(id)&&e.participants.includes(id)?e.shares[id]:0),0)}
function render(){
  document.querySelector('#content').innerHTML=({home:homeView,expenses:expenseView,chores:choreView,items:itemView,rules:ruleView}[page])();
  document.querySelector('#current-page-name').textContent=navItems.find(x=>x[0]===page)[2];
  document.querySelectorAll('.nav-btn').forEach(b=>{b.classList.toggle('active',b.dataset.page===page);if(b.dataset.page===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function openModal(title,body,submit,submitLabel='保存'){
  clearTimeout(closingTimer);modalTrigger=document.activeElement;
  document.body.classList.add('modal-open');
  document.querySelector('#modal-root').innerHTML=`<div class="modal-backdrop"><form class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="modal-head"><h2 id="dialog-title">${esc(title)}</h2><button type="button" class="close" data-action="close" aria-label="关闭弹窗">×</button></div>${body}<div class="form-error" id="form-error"></div><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close">取消</button><button class="primary-btn" type="submit">${submitLabel}</button></div></form></div>`;
  document.querySelector('form.modal').onsubmit=e=>{e.preventDefault();submit(new FormData(e.currentTarget),e.currentTarget)};
  document.querySelectorAll('.modal .field').forEach((f,i)=>{const label=f.querySelector(':scope > label'),input=f.querySelector('input,select,textarea');if(label&&input){if(!input.id)input.id='modal-field-'+i;label.htmlFor=input.id}});
  document.querySelector('.modal input:not([disabled]),.modal textarea,.modal select,.modal .close')?.focus({preventScroll:true});
}
function closeModal(){
  const root=document.querySelector('#modal-root'),overlay=root.firstElementChild;if(!overlay)return;
  overlay.classList.add('closing');overlay.inert=true;
  const finish=()=>{root.innerHTML='';document.body.classList.remove('modal-open');if(modalTrigger?.isConnected)modalTrigger.focus({preventScroll:true});else document.querySelector(`.nav-btn[data-page="${page}"]`)?.focus({preventScroll:true})};
  if(reduceMotion()||keyboardInput)finish();else closingTimer=setTimeout(finish,140);
}
function error(msg){document.querySelector('#form-error').textContent=msg}
function addExpense(){
  const checks=state.people.map(p=>`<label class="check"><input type="checkbox" name="people" value="${p.id}" checked> ${p.name}</label>`).join('');
  const custom=state.people.map(p=>`<label class="check"><span style="min-width:42px">${p.name}</span><input name="share_${p.id}" type="number" min="0" step="0.01" value="0" disabled style="width:100%"></label>`).join('');
  openModal('记一笔共同开支',`<div class="form-grid"><div class="field full"><label>费用名称</label><input name="title" required placeholder="例如：十月水费"></div><div class="field"><label>总金额（元）</label><input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></div><div class="field"><label>垫付人</label><select name="payer">${state.people.map(p=>`<option value="${p.id}" ${p.id===state.currentUser?'selected':''}>${p.name}</option>`).join('')}</select></div><div class="field full"><label>参与室友</label><div class="check-grid">${checks}</div></div><div class="field full"><label>分摊方式</label><select name="split_mode" id="split-mode"><option value="equal">按人数均摊</option><option value="custom">自定义金额</option></select></div><div class="field full" id="custom-shares" hidden><label>每人承担金额（元，合计须等于总额）</label><div class="check-grid">${custom}</div></div></div>`,fd=>{
    const cents=Math.round(Number(fd.get('amount'))*100),parts=fd.getAll('people');
    if(!fd.get('title').trim())return error('请填写费用名称');if(!Number.isInteger(cents)||cents<1)return error('请输入有效金额');if(!parts.length)return error('请至少选择一位参与室友');
    const shares={};
    if(fd.get('split_mode')==='custom'){
      let total=0;
      for(const id of parts){const value=Math.round(Number(fd.get(`share_${id}`))*100);if(!Number.isInteger(value)||value<0)return error('自定义金额不能为负数');shares[id]=value;total+=value}
      if(total!==cents)return error(`自定义分摊合计为 ${money(total)}，需要等于 ${money(cents)}`);
    }else{const base=Math.floor(cents/parts.length),rem=cents%parts.length;parts.forEach((id,i)=>shares[id]=base+(i<rem?1:0))}
    state.expenses.unshift({id:uid('e'),title:fd.get('title').trim(),amount:cents,payer:fd.get('payer'),participants:parts,shares,date:'今天',settled:[fd.get('payer')]});save();closeModal();render();toast('账单已记录，分摊金额已算好')
  },'确认分摊');
  document.querySelector('#split-mode').addEventListener('change',e=>{const isCustom=e.target.value==='custom',box=document.querySelector('#custom-shares');box.hidden=!isCustom;box.querySelectorAll('input').forEach(i=>i.disabled=!isCustom)});
}
function addChore(){openModal('添加值日任务',`<div class="form-grid"><div class="field full"><label>区域或任务</label><input name="area" required placeholder="例如：阳台整理"></div><div class="field"><label>负责人</label><select name="person">${state.people.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div><div class="field"><label>完成时间</label><input name="due" required placeholder="例如：周六 18:00"></div></div>`,fd=>{if(!fd.get('area').trim()||!fd.get('due').trim())return error('请填写任务和完成时间');state.chores.push({id:uid('c'),area:fd.get('area').trim(),icon:'🧹',person:fd.get('person'),due:fd.get('due').trim(),status:'pending'});save();closeModal();render();toast('值日任务已加入排班')})}
function addItem(){openModal('登记公共物品',`<div class="form-grid"><div class="field full"><label>物品名称</label><input name="name" required placeholder="例如：厨房纸"></div><div class="field"><label>当前数量</label><input name="qty" type="number" min="0" step="1" required value="1"></div><div class="field"><label>单位</label><input name="unit" required value="个"></div><div class="field full"><label>低库存提醒阈值</label><input name="threshold" type="number" min="0" step="1" required value="1"></div></div>`,fd=>{const qty=Number(fd.get('qty')),threshold=Number(fd.get('threshold'));if(!fd.get('name').trim()||!fd.get('unit').trim()||!Number.isFinite(qty)||!Number.isFinite(threshold)||qty<0||threshold<0)return error('请完整填写有效信息');state.items.push({id:uid('i'),name:fd.get('name').trim(),icon:'📦',qty,unit:fd.get('unit').trim(),threshold,claimedBy:null,logs:[{type:'restock',qty,user:state.currentUser,time:new Date().toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}]});save();closeModal();render();toast('物品已加入公共物品柜')})}
function ruleForm(existing){openModal(existing?'编辑公约':'新建室友公约',`<div class="form-grid"><div class="field"><label>分类</label><select name="category">${['作息','访客','清洁','费用','其他'].map(x=>`<option ${existing?.category===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field full"><label>公约标题</label><input name="title" required value="${esc(existing?.title||'')}" placeholder="一句话说清约定"></div><div class="field full"><label>具体内容</label><textarea name="content" rows="4" required placeholder="写清适用场景和共同约定">${esc(existing?.content||'')}</textarea></div></div>`,fd=>{if(!fd.get('title').trim()||!fd.get('content').trim())return error('请完整填写公约内容');if(existing){existing.title=fd.get('title').trim();existing.content=fd.get('content').trim();existing.category=fd.get('category');existing.confirmed=[]}else state.rules.push({id:uid('r'),title:fd.get('title').trim(),content:fd.get('content').trim(),category:fd.get('category'),confirmed:[state.currentUser]});save();closeModal();render();toast(existing?'公约已更新，请大家重新确认':'新公约已建立')})}
function itemChange(id,kind){const x=state.items.find(i=>i.id===id);openModal(kind==='consume'?`消耗 ${x.name}`:`补货 ${x.name}`,`<div class="form-grid"><div class="field full"><label>数量（${x.unit}）</label><input name="qty" type="number" min="1" step="1" required value="1"></div><p style="grid-column:1/-1;color:var(--muted);font-size:13px">当前库存：${x.qty}${esc(x.unit)}。操作会记入 ${person(state.currentUser).name} 的物品流水。</p></div>`,fd=>{const q=Number(fd.get('qty'));if(!Number.isFinite(q)||q<=0)return error('请输入大于 0 的数量');if(kind==='consume'&&q>x.qty)return error(`库存不足，最多可消耗 ${x.qty}${esc(x.unit)}`);x.qty+=kind==='consume'?-q:q;x.logs.unshift({type:kind,qty:q,user:state.currentUser,time:'刚刚'});if(kind==='restock')x.claimedBy=null;save();closeModal();render();toast(kind==='consume'?'消耗已记录':'补货已记录，感谢你照顾屋里')},kind==='consume'?'确认消耗':'确认补货')}
function showLogs(id){const x=state.items.find(i=>i.id===id);openModal(`${x.name} · 消耗记录`,`<div class="list">${x.logs.map(l=>`<div class="list-row"><span>${l.type==='consume'?'−':'＋'}</span><div class="row-main"><b>${l.type==='consume'?'消耗':'补货'} ${l.qty}${esc(x.unit)}</b><small>${person(l.user).name} · ${l.time}</small></div></div>`).join('')||'<div class="empty"><b>还没有记录</b>首次消耗或补货后会显示在这里</div>'}</div>`,()=>{},'关闭');document.querySelector('form.modal').onsubmit=e=>{e.preventDefault();closeModal()}}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;if(b.dataset.page)return go(b.dataset.page);
  const a=b.dataset.action,id=b.dataset.id;
  if(a==='toggle-light'){roomLit=!roomLit;document.querySelector('.hero').classList.toggle('is-evening',roomLit);b.setAttribute('aria-pressed',String(roomLit));b.querySelector('span').textContent=roomLit?'回到午后':'点亮小屋'}
  if(a==='close')closeModal();
  if(a==='expense-detail'){const x=state.expenses.find(x=>x.id===id);openModal(x.title+' · 分摊明细',`<div class="list">${x.participants.map(p=>`<div class="list-row">${avatar(p)}<div class="row-main"><b>${esc(person(p).name)}</b><small>${p===x.payer?'垫付人 · 本人份额':x.settled.includes(p)?'已结清':'待线下结算'}</small></div><span class="amount">${money(x.shares[p])}</span></div>`).join('')}</div>`,()=>closeModal(),'知道了')}if(a==='add-expense')addExpense();if(a==='add-chore')addChore();if(a==='add-item')addItem();if(a==='add-rule')ruleForm();
  if(a==='settle'){const x=state.expenses.find(x=>x.id===id);x.settled.push(state.currentUser);save();render();toast('已标记线下结清')}
  if(a==='toggle-chore'){const x=state.chores.find(x=>x.id===id);if(x.status==='done'){x.status=x.previousStatus||'pending'}else{x.previousStatus=x.status;x.status='done'}save();render();toast(x.status==='done'?'辛苦了，任务已完成':'任务已恢复为待完成')}
  if(a==='reassign'){const x=state.chores.find(x=>x.id===id);openModal('调整负责人',`<div class="field"><label for="assigned-person">${esc(x.area)} · 本次负责人</label><select id="assigned-person" name="person">${state.people.map(p=>`<option value="${p.id}" ${p.id===x.person?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div>`,fd=>{x.person=fd.get('person');save();closeModal();render();toast(`已安排给 ${person(x.person).name}`)})}
  if(a==='claim'){const x=state.items.find(x=>x.id===id);x.claimedBy=state.currentUser;save();render();toast('已在本演示空间认领采购')}
  if(a==='item-change')itemChange(id,b.dataset.kind);if(a==='logs')showLogs(id);
  if(a==='confirm-rule'){const x=state.rules.find(x=>x.id===id);if(!x.confirmed.includes(state.currentUser)){x.confirmed.push(state.currentUser);save();render();toast('已确认这条共同约定')}}
  if(a==='edit-rule')ruleForm(state.rules.find(x=>x.id===id));
  if(b.dataset.filter){expenseMode=b.dataset.filter;render()}
});
document.querySelector('#current-user').addEventListener('change',e=>{state.currentUser=e.target.value;save();render();toast(`已切换为 ${person(state.currentUser).name}`)});
document.querySelector('#reset-btn').addEventListener('click',()=>{if(confirm('确定恢复为最初的演示数据吗？')){state=structuredClone(demo);save();init();toast('演示数据已重置')}});
document.addEventListener('pointerdown',()=>{keyboardInput=false;document.body.classList.remove('keyboard-input')});
document.addEventListener('keydown',e=>{
  keyboardInput=true;document.body.classList.add('keyboard-input');
  if(e.key==='Escape'){closeModal();return}
  const modal=document.querySelector('form.modal');if(!modal||e.key!=='Tab')return;
  const focusable=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')].filter(x=>x.offsetParent!==null);
  const first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
});
document.querySelector('#modal-root').addEventListener('click',e=>{if(e.target.classList.contains('modal-backdrop'))closeModal()});
init();
