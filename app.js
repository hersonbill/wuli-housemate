const STORE_KEY = 'wuli_housemate_v1';
const navItems = [
  ['home','⌂','首页'],['expenses','¥','费用'],['chores','✓','值日'],['items','▣','物品'],['rules','◎','公约']
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
let state = load(); let page = 'home'; let expenseMode = 'all';
function load(){try{const x=JSON.parse(localStorage.getItem(STORE_KEY));return x?.version===1?x:structuredClone(demo)}catch{return structuredClone(demo)}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
function person(id){return state.people.find(p=>p.id===id)||{name:'未知',color:'#777'}}
function money(c){return `¥${(c/100).toFixed(2)}`}
function uid(prefix){return prefix+Date.now().toString(36)}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function avatar(id,size=''){const p=person(id);return `<span class="avatar" style="background:${p.color};${size}">${p.name.slice(-1)}</span>`}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1900)}
function init(){
  const nav = navItems.map(([id,icon,label])=>`<button class="nav-btn ${page===id?'active':''}" data-page="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join('');
  document.querySelector('#nav').innerHTML=nav;document.querySelector('#bottom-nav').innerHTML=nav;
  document.querySelector('#current-user').innerHTML=state.people.map(p=>`<option value="${p.id}" ${p.id===state.currentUser?'selected':''}>${p.name}</option>`).join('');
  render();
}
function go(p){page=p;document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));render();window.scrollTo({top:0,behavior:'smooth'})}
function pageHead(kicker,title,sub,button=''){return `<div class="page-head"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${sub}</p></div>${button}</div>`}
function pendingFor(id){return state.expenses.reduce((sum,e)=>sum+(!e.settled.includes(id)&&e.participants.includes(id)?e.shares[id]:0),0)}
function render(){const c=document.querySelector('#content');c.innerHTML=({home:homeView,expenses:expenseView,chores:choreView,items:itemView,rules:ruleView}[page])()}
function homeView(){
  const me=person(state.currentUser), pending=pendingFor(me.id), chores=state.chores.filter(x=>x.person===me.id&&x.status!=='done'), low=state.items.filter(x=>x.qty<=x.threshold), unconfirmed=state.rules.filter(x=>!x.confirmed.includes(me.id));
  return `<div class="hero"><div class="hero-main"><span class="hero-badge">☀ 今天也要好好住在一起</span><h1>晚上好，${me.name}<br>屋里的事，一起理清楚。</h1><p>每一笔钱有去向，每一次劳动被看见。把容易说不清的小事，变成大家都安心的共识。</p><div class="hero-people">${state.people.map(p=>avatar(p.id)).join('')}<span>春和里 6 栋 · 4 位室友</span></div></div><div class="hero-side"><div><small>你当前待结算</small><strong>${money(pending)}</strong><p>${pending?`来自 ${state.expenses.filter(e=>e.participants.includes(me.id)&&!e.settled.includes(me.id)).length} 笔共同开支`:'本月账目清清爽爽'}</p></div><button class="primary-btn" data-page="expenses">去处理账单 →</button></div></div>
  <div class="stats"><div class="stat"><div class="stat-top">待结算<span class="stat-icon">¥</span></div><strong>${money(pending)}</strong><small>线下结算后可标记</small></div><div class="stat"><div class="stat-top">我的值日<span class="stat-icon">✓</span></div><strong>${chores.length} 项</strong><small>${chores.some(x=>x.status==='overdue')?'有任务已逾期':'按计划进行中'}</small></div><div class="stat"><div class="stat-top">补货提醒<span class="stat-icon">▣</span></div><strong>${low.length} 件</strong><small>${low.length?'需要大家留意':'物品储备充足'}</small></div><div class="stat"><div class="stat-top">待确认公约<span class="stat-icon">◎</span></div><strong>${unconfirmed.length} 条</strong><small>共同约定更安心</small></div></div>
  <div class="dashboard-grid"><div class="card"><div class="card-head"><h2>今天，屋里要做什么</h2><button class="link-btn" data-page="chores">查看排班</button></div><div class="list">${chores.slice(0,3).map(x=>`<div class="list-row"><span style="font-size:24px">${x.icon}</span><div class="row-main"><b>${x.area}</b><small>${x.due} · 由你负责</small></div><span class="tag ${x.status==='overdue'?'red':''}">${x.status==='overdue'?'已逾期':'待完成'}</span><button class="mini-btn" data-action="toggle-chore" data-id="${x.id}">完成</button></div>`).join('')||`<div class="empty"><b>今天没有待办</b>享受整洁的公共空间吧</div>`}</div></div>
  <div class="card"><div class="card-head"><h2>需要补货</h2><button class="link-btn" data-page="items">物品柜</button></div><div class="list">${low.map(x=>`<div class="list-row"><span style="font-size:23px">${x.icon}</span><div class="row-main"><b>${x.name}</b><small>仅剩 ${x.qty}${x.unit} · 阈值 ${x.threshold}${x.unit}</small></div>${x.claimedBy?`<span class="tag">${person(x.claimedBy).name} 已认领</span>`:`<button class="mini-btn" data-action="claim" data-id="${x.id}">我来买</button>`}</div>`).join('')||`<div class="empty"><b>储备充足</b>暂时没有需要补货的物品</div>`}</div></div></div>`;
}
function expenseView(){
  const list=state.expenses.filter(e=>expenseMode==='all'||(expenseMode==='mine'&&e.participants.includes(state.currentUser))||(expenseMode==='unsettled'&&e.participants.includes(state.currentUser)&&!e.settled.includes(state.currentUser)));
  return `${pageHead('Shared expenses','费用 AA','每笔开支都清楚，每份承担都公平。','<button class="primary-btn" data-action="add-expense">＋ 记一笔</button>')}<div class="card" style="margin-bottom:16px"><div class="toolbar"><div class="segmented">${[['all','全部'],['mine','与我相关'],['unsettled','待结算']].map(x=>`<button data-filter="${x[0]}" class="${expenseMode===x[0]?'active':''}">${x[1]}</button>`).join('')}</div><span style="margin-left:auto;color:var(--muted);font-size:13px">我的待结算 <b style="color:var(--ink)">${money(pendingFor(state.currentUser))}</b></span></div></div><div class="table-wrap"><table><thead><tr><th>费用</th><th>总额</th><th>垫付人</th><th>参与人</th><th>我的分摊</th><th>状态</th></tr></thead><tbody>${list.map(e=>`<tr><td><b>${esc(e.title)}</b><br><small style="color:var(--muted)">${e.date}</small></td><td class="amount">${money(e.amount)}</td><td>${person(e.payer).name}</td><td>${e.participants.map(id=>person(id).name).join('、')}</td><td>${e.participants.includes(state.currentUser)?money(e.shares[state.currentUser]):'—'}</td><td>${e.participants.includes(state.currentUser)?(e.settled.includes(state.currentUser)?'<span class="tag">已结清</span>':`<button class="mini-btn" data-action="settle" data-id="${e.id}">标记结清</button>`):'—'}</td></tr>`).join('')||'<tr><td colspan="6"><div class="empty"><b>没有符合条件的账单</b>记录一笔新的共同开支吧</div></td></tr>'}</tbody></table></div>`;
}
function choreView(){return `${pageHead('Cleaning rota','清洁值日','责任轮流承担，完成也值得被看见。','<button class="primary-btn" data-action="add-chore">＋ 添加任务</button>')}<div class="data-grid">${state.chores.map(x=>`<article class="item-card"><div class="item-card-top"><div><span style="font-size:28px">${x.icon}</span><h3 style="margin-top:10px">${esc(x.area)}</h3><p>${x.due}</p></div><span class="tag ${x.status==='overdue'?'red':x.status==='pending'?'warn':''}">${x.status==='done'?'已完成':x.status==='overdue'?'已逾期':'待完成'}</span></div><div style="display:flex;align-items:center;gap:10px;margin-top:18px">${avatar(x.person)}<div><small style="color:var(--muted)">本次负责人</small><b style="display:block">${person(x.person).name}</b></div></div><div class="item-card-actions"><button class="mini-btn" data-action="toggle-chore" data-id="${x.id}">${x.status==='done'?'撤销完成':'标记完成'}</button><button class="mini-btn" data-action="reassign" data-id="${x.id}">换人</button></div></article>`).join('')}</div>`}
function itemView(){return `${pageHead('Shared supplies','公共物品','谁用了、谁补了，公共消耗都有记录。','<button class="primary-btn" data-action="add-item">＋ 登记物品</button>')}<div class="data-grid">${state.items.map(x=>{const low=x.qty<=x.threshold;return `<article class="item-card ${low?'low':''}"><div class="item-card-top"><div><span style="font-size:29px">${x.icon}</span><h3 style="margin-top:9px">${esc(x.name)}</h3><p>提醒阈值 ${x.threshold}${x.unit}</p></div><div style="text-align:right"><strong style="font-size:25px">${x.qty}</strong><small> ${x.unit}</small><br>${low?'<span class="tag warn">库存偏低</span>':'<span class="tag">库存充足</span>'}</div></div><div class="progress ${low?'warn':''}"><i style="width:${Math.min(100,Math.max(8,x.qty/(x.threshold*3)*100))}%"></i></div><div class="item-card-actions"><button class="mini-btn" data-action="item-change" data-kind="consume" data-id="${x.id}">− 消耗</button><button class="mini-btn" data-action="item-change" data-kind="restock" data-id="${x.id}">＋ 补货</button>${low&&!x.claimedBy?`<button class="mini-btn" data-action="claim" data-id="${x.id}">我来买</button>`:''}<button class="mini-btn" data-action="logs" data-id="${x.id}">记录 ${x.logs.length}</button></div>${x.claimedBy?`<p style="margin-top:12px">🛒 ${person(x.claimedBy).name} 已认领采购</p>`:''}</article>`}).join('')}</div>`}
function ruleView(){return `${pageHead('House rules','室友公约','让边界被看见，让共识有回音。','<button class="primary-btn" data-action="add-rule">＋ 新建公约</button>')}<div class="list">${state.rules.map(x=>{const ok=x.confirmed.includes(state.currentUser),pct=x.confirmed.length/state.people.length*100;return `<article class="card"><div class="item-card-top"><div><span class="tag">${esc(x.category)}</span><h3 style="margin:12px 0 8px">${esc(x.title)}</h3><p style="color:var(--muted);line-height:1.7;margin:0">${esc(x.content)}</p></div><span style="white-space:nowrap;color:var(--muted);font-size:12px">${x.confirmed.length}/${state.people.length} 已确认</span></div><div class="progress"><i style="width:${pct}%"></i></div><div class="item-card-actions"><button class="${ok?'secondary-btn':'primary-btn'}" data-action="confirm-rule" data-id="${x.id}">${ok?'✓ 我已确认':'确认这条公约'}</button><button class="mini-btn" data-action="edit-rule" data-id="${x.id}">编辑</button></div></article>`}).join('')}</div>`}
function openModal(title,body,submit,submitLabel='保存'){
  document.querySelector('#modal-root').innerHTML=`<div class="modal-backdrop"><form class="modal"><div class="modal-head"><h2>${title}</h2><button type="button" class="close" data-action="close">×</button></div>${body}<div class="form-error" id="form-error"></div><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close">取消</button><button class="primary-btn" type="submit">${submitLabel}</button></div></form></div>`;
  document.querySelector('.modal form').onsubmit=e=>{e.preventDefault();submit(new FormData(e.currentTarget),e.currentTarget)};
}
function closeModal(){document.querySelector('#modal-root').innerHTML=''}
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
function addItem(){openModal('登记公共物品',`<div class="form-grid"><div class="field full"><label>物品名称</label><input name="name" required placeholder="例如：厨房纸"></div><div class="field"><label>当前数量</label><input name="qty" type="number" min="0" step="1" required value="1"></div><div class="field"><label>单位</label><input name="unit" required value="个"></div><div class="field full"><label>低库存提醒阈值</label><input name="threshold" type="number" min="0" step="1" required value="1"></div></div>`,fd=>{const qty=Number(fd.get('qty')),threshold=Number(fd.get('threshold'));if(!fd.get('name').trim()||!fd.get('unit').trim()||qty<0||threshold<0)return error('请完整填写有效信息');state.items.push({id:uid('i'),name:fd.get('name').trim(),icon:'📦',qty,unit:fd.get('unit').trim(),threshold,claimedBy:null,logs:[{type:'restock',qty,user:state.currentUser,time:'刚刚'}]});save();closeModal();render();toast('物品已加入公共物品柜')})}
function ruleForm(existing){openModal(existing?'编辑公约':'新建室友公约',`<div class="form-grid"><div class="field"><label>分类</label><select name="category">${['作息','访客','清洁','费用','其他'].map(x=>`<option ${existing?.category===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field full"><label>公约标题</label><input name="title" required value="${esc(existing?.title||'')}" placeholder="一句话说清约定"></div><div class="field full"><label>具体内容</label><textarea name="content" rows="4" required placeholder="写清适用场景和共同约定">${esc(existing?.content||'')}</textarea></div></div>`,fd=>{if(!fd.get('title').trim()||!fd.get('content').trim())return error('请完整填写公约内容');if(existing){existing.title=fd.get('title').trim();existing.content=fd.get('content').trim();existing.category=fd.get('category');existing.confirmed=[]}else state.rules.push({id:uid('r'),title:fd.get('title').trim(),content:fd.get('content').trim(),category:fd.get('category'),confirmed:[state.currentUser]});save();closeModal();render();toast(existing?'公约已更新，请大家重新确认':'新公约已建立')})}
function itemChange(id,kind){const x=state.items.find(i=>i.id===id);openModal(kind==='consume'?`消耗 ${x.name}`:`补货 ${x.name}`,`<div class="form-grid"><div class="field full"><label>数量（${x.unit}）</label><input name="qty" type="number" min="1" step="1" required value="1"></div><p style="grid-column:1/-1;color:var(--muted);font-size:13px">当前库存：${x.qty}${x.unit}。操作会记入 ${person(state.currentUser).name} 的物品流水。</p></div>`,fd=>{const q=Number(fd.get('qty'));if(!Number.isFinite(q)||q<=0)return error('请输入大于 0 的数量');if(kind==='consume'&&q>x.qty)return error(`库存不足，最多可消耗 ${x.qty}${x.unit}`);x.qty+=kind==='consume'?-q:q;x.logs.unshift({type:kind,qty:q,user:state.currentUser,time:'刚刚'});if(kind==='restock')x.claimedBy=null;save();closeModal();render();toast(kind==='consume'?'消耗已记录':'补货已记录，感谢你照顾屋里')},kind==='consume'?'确认消耗':'确认补货')}
function showLogs(id){const x=state.items.find(i=>i.id===id);openModal(`${x.name} · 消耗记录`,`<div class="list">${x.logs.map(l=>`<div class="list-row"><span>${l.type==='consume'?'−':'＋'}</span><div class="row-main"><b>${l.type==='consume'?'消耗':'补货'} ${l.qty}${x.unit}</b><small>${person(l.user).name} · ${l.time}</small></div></div>`).join('')||'<div class="empty"><b>还没有记录</b>首次消耗或补货后会显示在这里</div>'}</div>`,()=>{},'关闭');document.querySelector('.modal form').onsubmit=e=>{e.preventDefault();closeModal()}}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;if(b.dataset.page)return go(b.dataset.page);
  const a=b.dataset.action,id=b.dataset.id;
  if(a==='close')closeModal();if(a==='add-expense')addExpense();if(a==='add-chore')addChore();if(a==='add-item')addItem();if(a==='add-rule')ruleForm();
  if(a==='settle'){const x=state.expenses.find(x=>x.id===id);x.settled.push(state.currentUser);save();render();toast('已标记线下结清')}
  if(a==='toggle-chore'){const x=state.chores.find(x=>x.id===id);x.status=x.status==='done'?'pending':'done';save();render();toast(x.status==='done'?'辛苦了，任务已完成':'任务已恢复为待完成')}
  if(a==='reassign'){const x=state.chores.find(x=>x.id===id),i=state.people.findIndex(p=>p.id===x.person);x.person=state.people[(i+1)%state.people.length].id;save();render();toast(`已轮换给 ${person(x.person).name}`)}
  if(a==='claim'){const x=state.items.find(x=>x.id===id);x.claimedBy=state.currentUser;save();render();toast('已认领采购，室友们都能看到')}
  if(a==='item-change')itemChange(id,b.dataset.kind);if(a==='logs')showLogs(id);
  if(a==='confirm-rule'){const x=state.rules.find(x=>x.id===id);if(!x.confirmed.includes(state.currentUser)){x.confirmed.push(state.currentUser);save();render();toast('已确认这条共同约定')}}
  if(a==='edit-rule')ruleForm(state.rules.find(x=>x.id===id));
  if(b.dataset.filter){expenseMode=b.dataset.filter;render()}
});
document.querySelector('#current-user').addEventListener('change',e=>{state.currentUser=e.target.value;save();render();toast(`已切换为 ${person(state.currentUser).name}`)});
document.querySelector('#reset-btn').addEventListener('click',()=>{if(confirm('确定恢复为最初的演示数据吗？')){state=structuredClone(demo);save();init();toast('演示数据已重置')}});
init();
