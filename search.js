
/* one search for everything: tests, results, fee receipts, students, series and pages (only what the person may open) */
(function(){
 var app=document.getElementById('app'),tb=document.getElementById('tb'),bar=document.getElementById('bar');
 if(!tb)return;
 var btn=document.createElement('button');btn.type='button';btn.id='gsb';btn.setAttribute('aria-label','Search');btn.innerHTML='&#128269;';tb.appendChild(btn);
 var ov=document.createElement('div');ov.id='gso';
 ov.innerHTML='<div class="gsh"><input id="gsq" type="search" placeholder="Search tests, results, fees, students\u2026" autocomplete="off" aria-label="Search"><button type="button" id="gsx" aria-label="Close search">\u2715</button></div><div id="gsc" class="gsc"></div><div id="gsr" class="gsr"></div>';
 document.body.appendChild(ov);
 var inp=ov.querySelector('#gsq'),chips=ov.querySelector('#gsc'),box=ov.querySelector('#gsr');
 var D=null,LOADING=null,STAMP=0,UID=null,TYPE='',ITEMS=[],tmr=0;
 var isStaff=function(){return typeof me!=='undefined'&&me&&(me.email===TEACHER||!!STAFF)};
 function vis(){var ok=typeof me!=='undefined'&&me&&!isParent()&&!app.classList.contains('nt');btn.style.display=ok?'':'none';if(!ok)close()}
 new MutationObserver(vis).observe(bar,{childList:true,subtree:true});
 new MutationObserver(vis).observe(app,{attributes:true,attributeFilter:['class']});
 vis();
 function lc(){return [].slice.call(arguments).join(' ').toLowerCase()}
 function recKey(){return 'stemgs_'+(me?me.uid:'')}
 function recGet(){try{return JSON.parse(localStorage.getItem(recKey())||'[]')}catch(e){return []}}
 function recAdd(q){q=q.trim();if(q.length<2)return;try{var a=recGet().filter(function(x){return x!==q});a.unshift(q);localStorage.setItem(recKey(),JSON.stringify(a.slice(0,6)))}catch(e){}}
 function go(fn){close();setTimeout(function(){try{fn()}catch(e){alert(e.message||e)}},30)}
 function pagesItems(){
  var out=[];try{(window.stemGroups?window.stemGroups():[]).forEach(function(g){g[1].forEach(function(t){out.push({t:'Pages',ti:t[0],su:g[0],k:lc(t[0],g[0]),lb:'Open',a:t[1]})})})}catch(e){}
  if(!isStaff()){out.push({t:'Pages',ti:'My profile',su:'Account',k:'my profile account photo',lb:'Open',a:function(){myProfile()}})}
  return out}
 async function build(){
  var items=[],safe=function(p){return p.then(function(x){return x}).catch(function(){return null})};
  if(!isStaff()){
   var r=await Promise.all([safe(db.collection('students').doc(me.uid).get()),safe(db.collection('tests').get()),safe(db.collection('results').where('uid','==',me.uid).get()),safe(db.collection('payments').where('uid','==',me.uid).get()),safe(db.collection('series').get())]);
   var st=(r[0]&&r[0].exists?r[0].data():{})||{},done={},now=Date.now();
   if(r[2])r[2].forEach(function(d){done[d.data().testId]=d.data().at&&d.data().at.toMillis?d.data().at.toMillis():1});
   if(r[1])r[1].forEach(function(d){var t=d.data();
    if(t.live===false||(t.start&&t.start.toMillis&&t.start.toMillis()>now)||!canSee(t,st))return;
    var n=t.qs?t.qs.length:t.n,id=d.id;
    if(done[id])items.push({t:'Results',ti:t.title||'Test',su:'Result and analysis \u00b7 '+(n||'?')+' questions',k:lc(t.title,'result results analysis marks score report'),lb:'View result',a:function(){review(id,2)},o:done[id]});
    else items.push({t:'Tests',ti:t.title||'Test',su:(n||'?')+' questions \u00b7 '+t.mins+' minutes \u00b7 not attempted',k:lc(t.title,'test start exam mock'),lb:'Start test',a:function(){startTest(id)},o:0})});
   var P=r[3]?r[3].docs.map(function(d){return Object.assign({id:d.id},d.data())}):[];
   P.forEach(function(p){items.push({t:'Receipts',ti:(p.no||'Receipt')+' \u00b7 Rs. '+p.amount,su:(p.seriesTitle||p.series||'')+' \u00b7 '+payDt(p)+' \u00b7 '+(p.method||''),k:lc(p.no,p.seriesTitle,p.series,p.amount,p.method,payDt(p),p.note,'fee fees receipt bill payment paid'),lb:'Receipt PDF',a:function(){PAYS=P;receiptPdf(p.id)},a2:{lb:'My fees',fn:function(){myReceipts()}},o:payMs(p)})});
   if(r[4])r[4].forEach(function(d){var x=d.data();if(x.active===false||!owns(st,d.id))return;items.push({t:'Series',ti:x.title||d.id,su:'My purchased test series'+(x.mode?' \u00b7 '+x.mode:''),k:lc(x.title,x.desc,x.mode,x.exam,'series purchased test series'),lb:'Open',a:function(){studentView(d.id)}})});
  }else{
   var wantS=tabOk('s')||tabOk('a')||tabOk('p'),wantT=tabOk('m')||tabOk('t')||tabOk('r'),wantP=tabOk('p');
   var q=await Promise.all([wantS?safe(db.collection('students').get()):null,wantT?safe(db.collection('tests').get()):null,wantP?safe(db.collection('payments').get()):null]);
   if(q[0])q[0].forEach(function(d){var x=d.data();
    var it={t:'Students',ti:(x.name||'Student')+' ('+(x.roll||'')+')',su:'Class '+(x.cls||'-')+(x.mobile?' \u00b7 '+x.mobile:''),k:lc(x.name,x.roll,x.mobile,x.cls?'class '+x.cls:'','student'),lb:'Open',a:null};
    if(tabOk('s'))it.a=function(){LSQ=String(x.roll||x.name||'');teacherView('s')};
    else if(tabOk('a'))it.a=function(){teacherView('a')};
    else if(tabOk('p'))it.a=function(){teacherView('p')};
    items.push(it)});
   if(q[1])q[1].forEach(function(d){var t=d.data(),n=t.qs?t.qs.length:t.n,tt=t.title||'Test';
    var it={t:'Tests',ti:tt,su:(n||'?')+' questions \u00b7 '+(t.live===false?'Draft':'Live')+(t.cls?' \u00b7 Class '+t.cls:''),k:lc(tt,t.pat,t.cls,'test paper',t.live===false?'draft':'live'),lb:'Open',a:null};
    if(tabOk('m'))it.a=function(){teacherView('m')};
    if(tabOk('r'))it.a2={lb:'Results',fn:function(){RF.q=tt;teacherView('r')}};
    if(!it.a&&it.a2){it.a=it.a2.fn;it.lb='Results';it.a2=null}
    if(it.a)items.push(it)});
   if(q[2]){var P=q[2].docs.map(function(d){return Object.assign({id:d.id},d.data())}).sort(function(a,b){return payMs(b)-payMs(a)});
    P.forEach(function(p){items.push({t:'Receipts',ti:(p.no||'Receipt')+' \u00b7 '+(p.name||'')+' ('+(p.roll||'')+')',su:'Rs. '+p.amount+' \u00b7 '+(p.seriesTitle||p.series||'')+' \u00b7 '+payDt(p),k:lc(p.no,p.name,p.roll,p.cls,p.seriesTitle,p.series,p.amount,p.method,payDt(p),p.note,'fee fees receipt bill payment paid'),lb:'Receipt PDF',a:function(){PAYS=P;receiptPdf(p.id)},a2:{lb:'Fees',fn:function(){teacherView('p')}},o:payMs(p)})})}
  }
  pagesItems().forEach(function(x){items.push(x)});
  items.forEach(function(x){if(x.o===undefined)x.o=0});
  return items}
 function load(force){
  if(!force&&D&&UID===me.uid&&Date.now()-STAMP<10*60*1000)return Promise.resolve(D);
  if(LOADING)return LOADING;
  UID=me.uid;
  LOADING=build().then(function(x){D=x;STAMP=Date.now();LOADING=null;return x},function(e){LOADING=null;throw e});
  return LOADING}
 var ORDER=['Results','Tests','Receipts','Students','Series','Pages'],LABEL={Results:'Results',Tests:'Tests',Receipts:'Fee receipts',Students:'Students',Series:'Test series',Pages:'Pages'};
 function renderChips(){
  var cnt={};(D||[]).forEach(function(x){cnt[x.t]=(cnt[x.t]||0)+1});
  chips.innerHTML=['']
   .concat(ORDER.filter(function(t){return cnt[t]})).map(function(t){return '<button type="button" class="gsch'+(TYPE===t?' on':'')+'" data-t="'+t+'">'+(t?LABEL[t]:'All')+'</button>'}).join('')+'<button type="button" class="gsch gsrf" data-r="1" title="Reload the latest data">&#8635;</button>'}
 function find(q){
  var tk=q.toLowerCase().split(/\s+/).filter(Boolean),L=(D||[]).filter(function(x){return (!TYPE||x.t===TYPE)&&tk.every(function(w){return x.k.indexOf(w)>=0})});
  L.forEach(function(x){var ti=x.ti.toLowerCase();x.sc=(tk.length&&ti.indexOf(tk.join(' '))===0?0:tk.every(function(w){return ti.indexOf(w)>=0})?1:2)});
  L.sort(function(a,b){return a.sc-b.sc||ORDER.indexOf(a.t)-ORDER.indexOf(b.t)||(b.o||0)-(a.o||0)});
  return L}
 function row(x,i){return '<div class="gsw" data-i="'+i+'"><div class="gsm"><span class="gst">'+esc(x.t==='Pages'?'Page':LABEL[x.t].replace(/s$/,''))+'</span><b>'+esc(x.ti)+'</b><small>'+esc(x.su||'')+'</small></div><div class="gsa">'+(x.a?'<button type="button" data-p="'+i+'">'+esc(x.lb||'Open')+'</button>':'')+(x.a2?'<button type="button" class="s" data-q="'+i+'">'+esc(x.a2.lb)+'</button>':'')+'</div></div>'}
 function render(){
  var q=inp.value.trim();renderChips();
  if(!D){box.innerHTML='<p class="gsn">Loading\u2026</p>';return}
  if(!q&&!TYPE){
   var rc=recGet(),pg=D.filter(function(x){return x.t==='Pages'}).slice(0,8);ITEMS=pg;
   box.innerHTML=(rc.length?'<h4>Recent searches</h4><div class="gsrec">'+rc.map(function(r){return '<button type="button" class="s" data-rq="'+esc(r)+'">'+esc(r)+'</button>'}).join('')+'</div>':'')+
    '<p class="gsn">'+(isStaff()?'Type a student name, roll number or mobile, a test name or a receipt number.':'Type a test name, \u201cresult\u201d, \u201creceipt\u201d, a series or a page name.')+'</p>'+(pg.length?'<h4>Quick links</h4>'+pg.map(row).join(''):'');return}
  var L=find(q);ITEMS=L.slice(0,60);
  box.innerHTML=L.length?(L.length>60?'<small class="gsn">Showing 60 of '+L.length+'. Type more to narrow.</small>':'')+ITEMS.map(row).join(''):'<p class="gsn">Nothing found for \u201c'+esc(q)+'\u201d.</p>'}
 function run(i,sec){var x=ITEMS[i];if(!x)return;var fn=sec?(x.a2&&x.a2.fn):x.a;if(!fn)return;recAdd(inp.value);go(fn)}
 box.addEventListener('click',function(e){
  var b=e.target.closest('button'),w=e.target.closest('.gsw');
  if(b&&b.dataset.rq){inp.value=b.dataset.rq;render();inp.focus();return}
  if(b&&b.dataset.q!==undefined){run(+b.dataset.q,1);return}
  if(b&&b.dataset.p!==undefined){run(+b.dataset.p,0);return}
  if(w&&!b)run(+w.dataset.i,0)});
 chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.r){D=null;render();load(true).then(render).catch(fail);return}
  TYPE=b.dataset.t||'';render()});
 function fail(e){box.innerHTML='<p class="gsn bad">Could not load: '+esc(e.message||e)+'</p>'}
 inp.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(render,120)});
 inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();var f=box.querySelector('.gsw button[data-p]');if(f)f.click()}});
 function open(){if(typeof me==='undefined'||!me)return;document.body.classList.add('gson');TYPE='';render();load().then(render).catch(fail);setTimeout(function(){inp.focus()},60)}
 function close(){document.body.classList.remove('gson')}
 btn.onclick=open;ov.querySelector('#gsx').onclick=close;
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&btn.style.display!=='none'){e.preventDefault();open()}});
})();
