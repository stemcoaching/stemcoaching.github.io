
const cfg={apiKey:"AIzaSyDQ1AjgkcsiZRx2Rhzt3rdzKzVkXgsNak4",authDomain:"stem-coaching.firebaseapp.com",projectId:"stem-coaching",storageBucket:"stem-coaching.firebasestorage.app",messagingSenderId:"947770205223",appId:"1:947770205223:web:aec031896125916fe91a02"};
firebase.initializeApp(cfg);
const auth=firebase.auth(),db=firebase.firestore(),$=id=>document.getElementById(id),app=$('app');
try{db.settings({experimentalAutoDetectLongPolling:true})}catch(e){}
const DOM='@stemcoaching.app',TEACHER='teacher'+DOM;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---- Subscript / power text. Write H_{2}O or x^{2}  (short forms H_2O, x^2 also work) ---- */
const SUBS='\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089\u208a\u208b',SUBT='0123456789+-',SUPS='\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079\u207a\u207b\u207f',SUPT='0123456789+-n';
function mkNorm(s){s=String(s==null?'':s);
 s=s.replace(new RegExp('['+SUBS+']+','g'),m=>'_{'+[...m].map(c=>SUBT[SUBS.indexOf(c)]).join('')+'}');
 s=s.replace(new RegExp('['+SUPS+']+','g'),m=>'^{'+[...m].map(c=>SUPT[SUPS.indexOf(c)]).join('')+'}');
 return s}
function mkSeg(s){s=mkNorm(s);const out=[],re=/([_^])(?:\{([^{}\n]*)\}|([+\-\u2212]?\d+))/g;let p=0,m;
 while((m=re.exec(s))){if(m.index>p)out.push({t:s.slice(p,m.index),m:0});out.push({t:m[2]!=null?m[2]:m[3],m:m[1]==='_'?1:2});p=re.lastIndex}
 if(p<s.length)out.push({t:s.slice(p),m:0});return out}
const rich=s=>mkSeg(s).map(g=>g.m?'<'+(g.m===1?'sub':'sup')+'>'+esc(g.t)+'</'+(g.m===1?'sub':'sup')+'>':esc(g.t)).join('');
const FB=id=>'<div class="fb"><button type="button" class="s" onclick="fmtWrap(\''+id+'\',0)">Subscript (H<sub>2</sub>O)</button><button type="button" class="s" onclick="fmtWrap(\''+id+'\',1)">Power (x<sup>2</sup>)</button></div><small>Select the number or letter first, then tap Subscript or Power. You can also type H_{2}O or x^{2}. Text copied from Word or Google Docs keeps its subscripts and powers automatically.</small>';
function fmtWrap(id,pw){const t=$(id);if(!t)return;const a=t.selectionStart,b=t.selectionEnd;if(a===b){alert('First select the number or letter that should become '+(pw?'a power':'a subscript')+', then tap the button.');return}
 const o=(pw?'^{':'_{')+t.value.slice(a,b)+'}';t.value=t.value.slice(0,a)+o+t.value.slice(b);t.focus();t.setSelectionRange(a+o.length,a+o.length)}
function htmlToMk(h){
 const d=new DOMParser().parseFromString(h,'text/html');let o='';const BL=/^(P|DIV|LI|TR|H[1-6]|TABLE|UL|OL)$/;
 (function w(n){n.childNodes.forEach(c=>{
  if(c.nodeType===3){o+=c.nodeValue.replace(/[\r\n]+/g,' ').replace(/\u00a0/g,' ');return}
  if(c.nodeType!==1)return;const t=c.tagName;if(/^(STYLE|SCRIPT|HEAD|TITLE|META|XML)$/.test(t))return;
  if(t==='BR'){o+='\n';return}
  const vs=(c.getAttribute('style')||'').toLowerCase(),sb=t==='SUB'||/vertical-align\s*:\s*sub/.test(vs),sp=t==='SUP'||/vertical-align\s*:\s*super/.test(vs);
  if(sb||sp){o+=(sb?'_{':'^{');w(c);o+='}';return}
  w(c);if(BL.test(t))o+='\n'})})(d.body);
 return o.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n')}
document.addEventListener('paste',e=>{const t=e.target;if(!t||t.tagName!=='TEXTAREA'||!/^(qt$|ax|eqt)/.test(t.id))return;
 const cb=e.clipboardData;if(!cb)return;const h=cb.getData('text/html');if(!h||!/<su[bp][\s>]|vertical-align\s*:\s*(sub|super)/i.test(h))return;
 e.preventDefault();const s=htmlToMk(h),a=t.selectionStart,b=t.selectionEnd;t.value=t.value.slice(0,a)+s+t.value.slice(b);t.selectionStart=t.selectionEnd=a+s.length},true);

let me=null,timerId=null;

let busy=false;
var NAV=[],CUR=null;
const isParent=()=>{try{return localStorage.getItem('stemparent')==='1'}catch(e){return false}};
const setParent=v=>{try{v?localStorage.setItem('stemparent','1'):localStorage.removeItem('stemparent')}catch(e){}};
const barHtml=()=>isParent()?'<div class="row"><button type="button" class="tl tl-r" onclick="auth.signOut()"><span class="tic">&#128682;</span><span>Logout</span></button></div>':'<div class="row"><button class="s" id="bk" onclick="goBack()" style="margin-right:auto;'+(NAV.length?'':'display:none')+'">&lt; Back</button><button type="button" class="tl tl-g" onclick="pwView()"><span class="tic">&#128274;</span><span>Password</span></button><button type="button" class="tl tl-r" onclick="auth.signOut()"><span class="tic">&#128682;</span><span>Logout</span></button></div>';
function updBack(){const b=document.getElementById('bk');if(b)b.style.display=NAV.length?'':'none'}
function goBack(){const p=NAV.pop();if(!p){updBack();return}CUR=null;window[p.n](...p.a);updBack()}
let STAFF=null,REGUN=null,NEWREG=[],REGALL=[],REGSEEN=0,REGFIRST=true;
const back=()=>me&&(me.email===TEACHER||STAFF)?teacherView():studentView();
const HOME_TOP=`<div class="home"><div class="hh"><div class="hl"><h2>Welcome to STEM Coaching Institute</h2><p>NEET / Board / Medical / Foundation coaching in Lakhpedabagh, Barabanki. Log in to take your tests, see your results and track your attendance.</p><div class="hc"><span>NEET</span><span>Board</span><span>Medical</span><span>Foundation</span></div><div class="hb"><a class="call" href="tel:9236990414">Call 9236990414</a><a class="call wab" href="https://wa.me/919236990414" target="_blank" rel="noopener">WhatsApp us</a><button class="dm" onclick="demoView()">Try a free demo test</button></div></div><div class="hr">`;
const HOME_REST=`</div></div>
<div id="hn"></div><div id="ht"></div>
<div class="hs"><h3>Our courses</h3><div class="cg"><div class="ci"><i>🧬</i><b>NEET</b><p>Full NEET, Biology, Physics and Chemistry test series.</p></div><div class="ci"><i>📘</i><b>Board</b><p>Practice tests to prepare for your Board exams.</p></div><div class="ci"><i>🩺</i><b>Medical</b><p>Preparation for medical entrance exams.</p></div><div class="ci"><i>🌱</i><b>Foundation</b><p>Build strong basics early with regular practice.</p></div></div></div>
<div class="hs"><div class="hv"><div><b>Free demo test</b><p>Try a short test right now. No account needed.</p></div><button class="dm2" onclick="demoView()">Start demo test</button></div></div>
<div class="hs"><h3>What you get on this portal</h3><div class="cg"><div class="ci"><i>📝</i><b>Online tests</b><p>Take mock tests on screen in the same style as the real exam.</p></div><div class="ci"><i>📊</i><b>Instant results</b><p>See your score, correct answers and wrong answers as soon as you submit.</p></div><div class="ci"><i>🎯</i><b>Strong and weak topics</b><p>Find out which topics need more practice.</p></div><div class="ci"><i>⏱️</i><b>Time analysis</b><p>See how long you spent on every question.</p></div><div class="ci"><i>📅</i><b>Attendance and marks</b><p>Check your monthly attendance and last test marks in your profile.</p></div><div class="ci"><i>🧾</i><b>Fee receipts</b><p>Your fee receipts are saved in one place.</p></div></div></div>
<div class="hs"><h3>How it works</h3><div class="cg stp"><div class="ci"><span>1</span><b>Create your account</b><p>Use your 10-digit mobile number. It takes one minute.</p></div><div class="ci"><span>2</span><b>Choose a test series</b><p>Pick the series for your class from Test series.</p></div><div class="ci"><span>3</span><b>Take the test</b><p>Read the instructions, then answer in the given time.</p></div><div class="ci"><span>4</span><b>Learn from your result</b><p>Check the analysis and practise your weak topics.</p></div></div></div>
<div id="hm"></div><div id="hrv"></div>
<div class="hs"><h3>Find us</h3><div class="map"><iframe title="Map of STEM Coaching Institute" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=STEM%20Coaching%20Institute%2C%20Maharshi%20Nagar%2C%20Pragya%20Puram%20Colony%2C%20Lakhpedabagh%2C%20Barel%2C%20Barabanki%2C%20Uttar%20Pradesh%20225001&output=embed"></iframe></div></div>
<div class="hs"><div class="hv"><div><b>STEM Coaching Institute</b><p>Pargyapuram, Lakhpedabagh, Barabanki</p></div><div class="hb"><a class="call" href="tel:9236990414">Call 9236990414</a><a class="call wab" href="https://wa.me/919236990414" target="_blank" rel="noopener">WhatsApp us</a><a class="call dir" href="https://maps.app.goo.gl/1wZv5KMeUUbhtVm86?g_st=ac" target="_blank" rel="noopener">Get directions</a></div></div></div>
<a class="wa" href="https://wa.me/919236990414" target="_blank" rel="noopener">WhatsApp</a></div>`;
async function loadHome(){
 try{
  let c=null;try{c=JSON.parse(localStorage.getItem('stemHomeC')||'null')}catch(e){}
  if(c){try{paintHome(c)}catch(e){}}
  const d=await db.collection('site').doc('home').get(),x=d.exists?d.data():{};
  try{localStorage.setItem('stemHomeC',JSON.stringify(x))}catch(e){}
  paintHome(x);
 }catch(e){}
}
function paintHome(x){
 try{
  const put=(id,h)=>{const e=$(id);if(e)e.innerHTML=h};
  const N=x.notices||[],T=x.toppers||[],M=x.materials||[],R=x.reviews||[];
  put('hn',N.length?'<div class="hs"><h3>Notice board</h3><div class="ntb">'+N.slice().reverse().map(n=>`<div class="nti"><b>${esc(n.t)}</b>${n.d?'<small>'+esc(n.d)+'</small>':''}</div>`).join('')+'</div></div>':'');
  put('ht',T.length?'<div class="hs"><h3>Our toppers</h3><div class="cg tpg">'+T.map(t=>`<div class="tpc">${t.img&&String(t.img).startsWith('data:image/')?`<img src="${t.img}" alt="${esc(t.n)}">`:`<span>${esc((t.n||'?').charAt(0).toUpperCase())}</span>`}<b>${esc(t.n)}</b><p>${esc(t.r||'')}</p></div>`).join('')+'</div></div>':'');
  put('hm',M.length?'<div class="hs"><h3>Study material</h3><div class="mtl">'+M.map(m=>/^https?:\/\//i.test(m.u||'')?`<a class="mti" href="${esc(m.u)}" target="_blank" rel="noopener">📄 ${esc(m.t)}</a>`:'').join('')+'</div></div>':'');
  put('hrv',R.length?'<div class="hs"><h3>What students say</h3><div class="cg">'+R.map(r=>`<div class="ci rvc"><p>${esc(r.t)}</p><b>${esc(r.n)}</b></div>`).join('')+'</div></div>':'');
 }catch(e){}
}
const DEMO=[
 {q:'What is the SI unit of force?',o:['Joule','Newton','Watt','Pascal'],a:1},
 {q:'Which cell organelle is called the powerhouse of the cell?',o:['Nucleus','Ribosome','Mitochondria','Golgi apparatus'],a:2},
 {q:'What is the atomic number of carbon?',o:['4','6','8','12'],a:1},
 {q:'Which of these is a vector quantity?',o:['Speed','Mass','Velocity','Time'],a:2},
 {q:'Which pigment mainly traps sunlight for photosynthesis?',o:['Haemoglobin','Chlorophyll','Melanin','Keratin'],a:1},
 {q:'What is the chemical symbol of sodium?',o:['S','So','Na','N'],a:2}
];
function demoView(){
 window.scrollTo(0,0);
 app.innerHTML=`<div class="card"><h3>Free demo test</h3><p>Try ${DEMO.length} easy questions. No account is needed. Each correct answer gives 1 mark.</p>`+DEMO.map((d,i)=>`<div class="dq"><b>${i+1}. ${esc(d.q)}</b>`+d.o.map((o,j)=>`<label class="opt"><input type="radio" name="d${i}" value="${j}">${esc(o)}</label>`).join('')+'</div>').join('')+`<button id="dsb">Submit demo test</button><button class="s" id="dbk">Back to home</button></div>`;
 $('dbk').onclick=()=>loginView();
 $('dsb').onclick=()=>{
  const A=DEMO.map((_,i)=>{const c=document.querySelector('input[name=d'+i+']:checked');return c?+c.value:null});
  const ok=A.filter((a,i)=>a===DEMO[i].a).length,un=A.filter(a=>a===null).length,bad=DEMO.length-ok-un;
  window.scrollTo(0,0);
  app.innerHTML=`<div class="card rhero"><h3>Free demo test</h3><h2>Score: <b>${ok}</b> / ${DEMO.length}</h2><div class="rst"><div class="t-ok"><b>${ok}</b>Correct</div><div class="t-bad"><b>${bad}</b>Wrong</div><div class="t-un"><b>${un}</b>Not attempted</div></div></div>`+
   DEMO.map((d,i)=>{const a=A[i],st=a===null?'un':a===d.a?'ok':'bad';return `<div class="card rq rq-${st}"><div class="rqh"><span class="rqn">${i+1}</span><b class="qt">${esc(d.q)}</b></div><div class="rqm"><span class="rqb">${a===null?'Not attempted':st==='ok'?'Correct':'Wrong'}</span></div><div class="ra ra-${st}"><small>Your answer:</small><span>${a===null?'Not attempted':esc(d.o[a])}</span></div>`+(st==='ok'?'':`<div class="ra ra-ok"><small>Correct answer:</small><span class="ok">${esc(d.o[d.a])}</span></div>`)+'</div>'}).join('')+
   `<div class="card"><h3>Want to take full tests?</h3><p>Create your free account to take full mock tests and see your analysis.</p><button id="dsu">Create account</button><button class="s" id="dlg">Back to login</button></div>`;
  $('dsu').onclick=()=>signupView();$('dlg').onclick=()=>loginView();
 };
}
function loginView(msg=''){
  setParent(false);
  app.innerHTML=HOME_TOP+`<div class="card"><h3>Student login</h3><input id="u" placeholder="Mobile number, roll number or staff ID" autocapitalize="off" autocomplete="username"><input id="p" type="password" placeholder="Password" autocomplete="current-password"><button id="go">Login</button><p class="bad">${msg}</p><div class="row"><button class="s" id="fu">Forgot username?</button><button class="s" id="fp">Forgot password?</button></div></div><div class="card"><b>New student?</b><br><small>Create your own account in one minute.</small><button class="s" id="su">Create account</button></div><div class="card"><b>Parent?</b><br><small>See your child's attendance, test marks and fees.</small><button class="s" id="pl">Parent's Dashboard</button></div>`+HOME_REST;
  $('go').onclick=async()=>{try{await loginTry($('u').value.trim().toLowerCase(),$('p').value)}catch(e){loginView(e.code==='auth/too-many-requests'?'Too many attempts. Please wait a few minutes and try again.':'Wrong mobile number / roll number or password.')}};
  $('su').onclick=()=>signupView();
  $('pl').onclick=()=>parentLoginView();
  $('fu').onclick=()=>forgotUserView();
  $('fp').onclick=()=>forgotPwView();
  loadHome();
}

/* ---------- PARENT'S DASHBOARD (read only) ---------- */
function parentLoginView(msg=''){
  setParent(false);
  app.innerHTML=`<div class="card"><h3>Parent's Dashboard</h3><p>Log in with your child's <b>mobile number or roll number</b> and password. You will only see your child's attendance, test marks and fees. Nothing can be changed here.</p><input id="pu" placeholder="Child's mobile number or roll number" autocapitalize="off" autocomplete="username"><input id="pp" type="password" placeholder="Password" autocomplete="current-password"><button id="pg">Open Parent's Dashboard</button><p class="bad">${msg}</p><button class="s" id="pb">Back to home</button><small>Forgot the password? Call the institute: <a href="tel:9236990414">9236990414</a>.</small></div>`;
  $('pb').onclick=()=>loginView();
  $('pg').onclick=async()=>{setParent(true);try{await loginTry($('pu').value.trim().toLowerCase(),$('pp').value)}catch(e){parentLoginView(e.code==='auth/too-many-requests'?'Too many attempts. Please wait a few minutes and try again.':'Wrong mobile number / roll number or password.')}};
}
async function parentView(){
  wmOff();app.innerHTML='Loading…';
  try{
    const [sd,ph,at,mk,tsn,rsn,py,ss]=await Promise.all([db.collection('students').doc(me.uid).get(),db.collection('photos').doc(me.uid).get(),db.collection('attendance').where('uid','==',me.uid).get(),db.collection('marks').where('uid','==',me.uid).get(),db.collection('tests').get(),db.collection('results').where('uid','==',me.uid).get(),db.collection('payments').where('uid','==',me.uid).get(),db.collection('series').get()]);
    if(!sd.exists){app.innerHTML='<div class="card">This account is not active. Please contact STEM Coaching Institute: <a href="tel:9236990414">9236990414</a>.</div>';return}
    const x=sd.data();MYA={};at.forEach(d=>{const o=d.data();MYA[o.ym]=o.d||{}});
    const t=new Date();MYM=t.getFullYear()+String(t.getMonth()+1).padStart(2,'0');
    const TS=new Set(tsn.docs.map(d=>d.id)),RS=new Set(rsn.docs.map(d=>d.data().testId));
    const M=mk.docs.map(d=>d.data()).filter(m=>m.classTest||!TS.has(m.testId)||RS.has(m.testId)).sort((a,b)=>(b.t0||0)-(a.t0||0));
    const P=py.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>payMs(b)-payMs(a)),SR={};ss.forEach(d=>SR[d.id]=d.data());
    const pend=(x.plans||[]).filter(k=>!P.some(q=>q.series===k)).map(k=>{const y=SR[k]||{};return '<b>'+esc(y.title||(typeof PN!=='undefined'&&PN[k])||k)+'</b>'+(y.price>0?' - Fee Rs. '+y.price:'')});
    const hasPh=ph.exists&&String(ph.data().d).startsWith('data:image/');
    const photo=hasPh?`<img class="ph" src="${ph.data().d}" alt="Photo">`:'<div class="ph" style="display:flex;align-items:center;justify-content:center;font-size:2.4rem;background:#8882">'+esc((x.name||'?').charAt(0).toUpperCase())+'</div>';
    const row=(l,v)=>v?`<div><small>${l}</small><br><b>${esc(v)}</b></div>`:'';
    const hasAtt=!(x.cls==='Dropper'&&!regular(x));
    const L=M[0];
    const marks=M.length?`<b>${esc(L.title)}</b><div class="big">${L.sc} / ${L.max}</div>`+(L.classTest?'<small>Class test (marks given by teacher)</small>':`<div class="rst lt"><div class="t-ok"><b>${L.ok}</b>Correct</div><div class="t-bad"><b>${L.bad}</b>Wrong</div><div class="t-un"><b>${L.un}</b>Not attempted</div></div>`)+(L.rank?`<p class="rk">Rank: <b>${L.rank}</b> of ${L.of}</p>`:'')+(M.length>1?`<details><summary>Earlier tests (${M.length-1})</summary>${M.slice(1).map(m=>esc(m.title)+': <b>'+m.sc+' / '+m.max+'</b>'+(m.rank?' (Rank '+m.rank+' of '+m.of+')':'')).join('<br>')}</details>`:''):'No test marks yet. Marks appear here after a test is checked.';
    const fees=(pend.length?`<div class="bad"><b>Fee pending</b><br>${pend.join('<br>')}<br><small>If already paid, please show the payment to the institute: <a href="tel:9236990414">9236990414</a>.</small></div>`:'<b class="ok">No fee pending.</b>')+(P.length?'<details open><summary>Payments made ('+P.length+')</summary>'+P.map(q=>esc(q.seriesTitle||q.series||'Payment')+': <b>Rs. '+esc(String(q.amount||0))+'</b> ('+esc(dmy(new Date(payMs(q)).toISOString().slice(0,10)))+')').join('<br>')+'</details>':'');
    app.innerHTML=`<div class="phero"><span class="phi" style="background:linear-gradient(135deg,#1fa56a,#0e6b43)">&#128106;</span><div class="pht"><b>Parent's Dashboard</b><small>Read only</small></div></div>`+
      `<div class="card mzx"><div class="pf">${photo}<div><h3 style="margin:0 0 6px">${esc(x.name||'')}</h3>${row('Roll no.',x.roll)}${row('Class',x.cls)}${row("Father's name",x.father)}${row("Mother's name",x.mother)}${row('Mobile',x.mobile)}</div></div></div>`+
      (hasAtt?`<div class="card mzx"><h3 style="margin-top:0">Attendance</h3><div id="att">${attHtml(MYM)}</div></div>`:'')+
      `<div class="card mzx"><h3 style="margin-top:0">Test marks</h3>${marks}</div>`+
      `<div class="card mzx"><h3 style="margin-top:0">Fees</h3>${fees}</div>`;
  }catch(e){app.innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
function forgotUserView(){
  app.innerHTML=`<div class="card"><h3>Forgot username?</h3><p>Your username is the <b>10-digit mobile number</b> you used when you created your account, or the <b>roll number</b> given to you by the institute.</p><p>If you still cannot remember it, call the institute at <a href="tel:9236990414">9236990414</a> and tell us your full name and class.</p><button class="s" id="b1">Back to login</button></div>`;
  $('b1').onclick=()=>loginView();
}
async function apiPub(action,data){
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data})});
 const j=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(j.error||'Request failed. Please try again.');
 return j;
}
function forgotPwView(){
  app.innerHTML=`<div class="card"><h3>Forgot password?</h3><p>If you have verified your email (this is done after you create your account), we can send a 6-digit code to it so you can set a new password yourself.</p>
  <input id="fr0" placeholder="Mobile number or roll number" autocapitalize="off">
  <button id="fc">Send code to my email</button>
  <div id="fb" style="display:none"><input id="fk" inputmode="numeric" maxlength="6" placeholder="6-digit code from your email" autocomplete="one-time-code"><input id="fw" type="password" placeholder="New password (at least 6 characters)" autocomplete="new-password"><button id="fz">Set new password</button></div>
  <p id="fm" class="bad"></p></div>
  <div class="card"><b>No verified email?</b><p>Send a request and the institute will set a new password for you and let you know.</p>
  <input id="fn" placeholder="Your full name" autocomplete="name">
  <input id="fr" placeholder="Mobile number or roll number" autocapitalize="off">
  <button class="s" id="fs">Send request to the institute</button><p id="fx" class="bad"></p>
  <small>You can also call the institute at <a href="tel:9236990414">9236990414</a>.</small></div>
  <button class="s" id="b2">Back to login</button>`;
  $('b2').onclick=()=>loginView();
  const rollOk=r=>/^[a-z0-9]+(\.[2-4])?$/.test(r);
  $('fc').onclick=async()=>{
   const r=$('fr0').value.trim().toLowerCase(),m=$('fm');
   if(!rollOk(r)){m.className='bad';return m.textContent='Please enter your mobile number or roll number.'}
   $('fc').disabled=true;m.className='';m.textContent='Please wait…';
   try{await apiPub('fpsend',{roll:r});m.className='ok';m.textContent='If this account has a verified email, a 6-digit code has been sent to it. Enter the code below. If nothing arrives in a few minutes, check the spam folder or send a request to the institute.';$('fb').style.display='';setTimeout(()=>{$('fc').disabled=false},60000)}
   catch(e){$('fc').disabled=false;m.className='bad';m.textContent=e.message}
  };
  $('fz').onclick=async()=>{
   const r=$('fr0').value.trim().toLowerCase(),m=$('fm'),c=$('fk').value.trim(),w=$('fw').value;
   if(!/^[0-9]{6}$/.test(c)){m.className='bad';return m.textContent='Please enter the 6-digit code.'}
   if(w.length<6){m.className='bad';return m.textContent='The new password must be at least 6 characters.'}
   $('fz').disabled=true;m.className='';m.textContent='Please wait…';
   try{await apiPub('fpreset',{roll:r,code:c,password:w});alert('Your password has been changed. Please login with the new password.');loginView()}
   catch(e){$('fz').disabled=false;m.className='bad';m.textContent=e.message}
  };
  $('fs').onclick=async()=>{
   const n=$('fn').value.trim(),r=$('fr').value.trim().toLowerCase(),x=$('fx');
   if(n.length<2||!/^[a-z0-9]+$/.test(r)){x.className='bad';return x.textContent='Please enter your name and your mobile number or roll number.'}
   $('fs').disabled=true;
   try{await db.collection('resetRequests').add({name:n,roll:r,at:firebase.firestore.FieldValue.serverTimestamp()});x.className='ok';x.textContent='Request sent. The institute will set a new password and contact you.'}
   catch(e){$('fs').disabled=false;x.className='bad';x.textContent='Could not send the request. Please call the institute: 9236990414.'}
  };
}
function pwView(){
  if($('tm'))return alert('Please finish and submit your test first.');
  app.innerHTML=`<div class="card"><h3>Change password</h3>
  <input id="cp" type="password" placeholder="Current password" autocomplete="current-password">
  <input id="np" type="password" placeholder="New password (at least 6 characters)" autocomplete="new-password">
  <input id="nq" type="password" placeholder="Confirm new password" autocomplete="new-password">
  <button id="cs">Change password</button><p id="cx" class="bad"></p><button class="s" id="cb">Back</button></div>`;
  $('cb').onclick=()=>back();
  $('cs').onclick=async()=>{
   const c=$('cp').value,n=$('np').value,q=$('nq').value,x=$('cx');x.className='bad';
   if(!c)return x.textContent='Please enter your current password.';
   if(n.length<6)return x.textContent='New password must be at least 6 characters.';
   if(n!==q)return x.textContent='The two new passwords do not match.';
   if(n===c)return x.textContent='The new password must be different from the current one.';
   $('cs').disabled=true;
   try{
    await me.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(me.email,c));
    await me.updatePassword(n);
    x.className='ok';x.textContent='Your password has been changed.';
   }catch(e){
    $('cs').disabled=false;
    x.textContent=(e.code==='auth/wrong-password'||e.code==='auth/invalid-credential'||e.code==='auth/invalid-login-credentials')?'Your current password is wrong.':e.code==='auth/too-many-requests'?'Too many attempts. Please try again after some time.':'Could not change password: '+(e.message||e.code);
   }
  };
}

/* A deleted student's old login stays in Firebase, so a number can have extra logins: 9876543210, 9876543210.2, .3, .4 */
async function signupLogin(m,p){
 /* One mobile number = one login. Only the plain number is ever used (no .2 / .3 / .4 copies). */
 const em=m+DOM;
 try{return await auth.createUserWithEmailAndPassword(em,p)}
 catch(e){
  if(e.code!=='auth/email-already-in-use')throw e;
  let cr=null;
  try{cr=await auth.signInWithEmailAndPassword(em,p)}
  catch(e2){if(e2.code==='auth/network-request-failed')throw e2;throw{code:'already-registered'}}
  const d=await db.collection('students').doc(cr.user.uid).get();
  if(!d.exists)return cr;
  await auth.signOut();throw{code:'already-registered'};
 }
}
async function loginTry(u,p){
 const ids=[u];if(/^[a-z0-9]+$/.test(u))for(let k=2;k<=4;k++)ids.push(u+'.'+k);
 let last=null;
 for(const id of ids){
  try{return await auth.signInWithEmailAndPassword(id+DOM,p)}
  catch(e){last=e;if(e.code==='auth/too-many-requests'||e.code==='auth/network-request-failed')break}
 }
 throw last;
}
/* ---------- EMAIL VERIFICATION POPUP ---------- */
/* Students who created their account on or after this date cannot close the popup until the email is verified. Older students can tap Later. */
const EMAIL_RULE_DATE=new Date('2026-11-10T00:00:00+05:30');
function closeEmailPopup(){const o=$('emo');if(o)o.remove()}
async function chkEmail(){
 try{
  if(!me||me.email===TEACHER||STAFF||$('emo'))return;
  const d=await db.collection('students').doc(me.uid).get();
  if(!d.exists)return;
  const st=await api('status',{});
  if(st.verified)return;
  const a=d.data().at,must=!!(a&&a.toDate&&a.toDate()>=EMAIL_RULE_DATE);
  emailPopup(must,st.email||'');
 }catch(e){}
}
function emailPopup(must,em){
 closeEmailPopup();
 const o=document.createElement('div');o.id='emo';
 o.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto';
 o.innerHTML=`<div class="card" style="max-width:420px;width:100%;margin:auto"><h3>Verify your email</h3><p>${must?'Email verification is required for your account.':'Your account does not have a verified email.'} A verified email is needed to buy test series and to reset your password yourself if you forget it.</p><input id="eme" type="email" placeholder="Your email address" value="${esc(em)}" autocomplete="email"><button id="ems">Send code</button><input id="emc" inputmode="numeric" maxlength="6" placeholder="6-digit code from your email" style="display:none" autocomplete="one-time-code"><button id="emv" style="display:none">Verify</button><p id="emm"></p>${must?'':'<button class="s" id="eml">Later</button>'}<button class="s" id="emx">Logout</button></div>`;
 document.body.appendChild(o);
 const m=$('emm');
 $('ems').onclick=async()=>{
  const e=$('eme').value.trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){m.className='bad';return m.textContent='Please enter a valid email address.'}
  m.className='';m.textContent='Sending…';$('ems').disabled=true;
  try{await api('sendcode',{email:e});m.className='ok';m.textContent='Code sent. Please check your inbox and spam folder.';$('emc').style.display=$('emv').style.display=''}
  catch(x){m.className='bad';m.textContent=x.message}
  $('ems').disabled=false;
 };
 $('emv').onclick=async()=>{
  const c=$('emc').value.trim();
  if(!/^[0-9]{6}$/.test(c)){m.className='bad';return m.textContent='Please enter the 6-digit code.'}
  m.className='';m.textContent='Checking…';$('emv').disabled=true;
  try{await api('verifycode',{code:c});closeEmailPopup();stemToast('Your email is verified.')}
  catch(x){m.className='bad';m.textContent=x.message;$('emv').disabled=false}
 };
 if($('eml'))$('eml').onclick=closeEmailPopup;
 $('emx').onclick=()=>{closeEmailPopup();auth.signOut()};
}
function signupView(){
  app.innerHTML=`<div class="card"><h3>Create student account</h3>
  <input id="sn" placeholder="Your full name" autocomplete="name">
  <input id="sm" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" autocomplete="username">
  <select id="sc"><option value="">Select your class</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>Dropper</option></select>
  <input id="sp" type="password" placeholder="Create password (at least 6 characters)" autocomplete="new-password">
  <input id="sq" type="password" placeholder="Confirm password" autocomplete="new-password">
  <input id="sr" type="tel" inputmode="numeric" maxlength="10" placeholder="Referral code (optional)">
  <button id="sg">Create account</button><p class="bad" id="sx"></p>
  <small>Your mobile number will be your login ID. Please remember your password. After creating the account you must verify your email address.</small>
  <button class="s" id="sb">Back to login</button></div>`;
  $('sb').onclick=()=>loginView();
  $('sg').onclick=async()=>{
   const n=$('sn').value.trim(),m=$('sm').value.trim(),c=$('sc').value,p=$('sp').value,q=$('sq').value,x=$('sx');
   if(n.length<2)return x.textContent='Please enter your name.';
   if(!/^[6-9][0-9]{9}$/.test(m))return x.textContent='Please enter a valid 10-digit mobile number.';
   if(!c)return x.textContent='Please select your class.';
   if(p.length<6)return x.textContent='Password must be at least 6 characters.';
   if(p!==q)return x.textContent='The two passwords do not match.';
   $('sg').disabled=true;x.textContent='Creating your account…';busy=true;
   try{
    const cr=await signupLogin(m,p);
    const o={name:n,roll:m,cls:c,plans:[],self:true,at:firebase.firestore.FieldValue.serverTimestamp()},rf=($('sr').value||'').trim();if(/^[6-9][0-9]{9}$/.test(rf)&&rf!==m)o.refBy=rf;
    try{try{await db.collection('students').doc(cr.user.uid).set(o)}catch(e1){if(!o.refBy)throw e1;delete o.refBy;await db.collection('students').doc(cr.user.uid).set(o)}}
    catch(e){await cr.user.delete();throw{code:'save-failed'}}
    busy=false;me=cr.user;$('bar').innerHTML=barHtml();myProfile();emailPopup(true,'');
   }catch(e){
    busy=false;$('sg').disabled=false;
    x.textContent=(e.code==='auth/email-already-in-use'||e.code==='already-registered')?'This mobile number is already registered. Please go back and login. If you forgot your password, call the institute: 9236990414.':e.code==='too-many-logins'?'This mobile number has been registered too many times. Please call the institute: 9236990414.':e.code==='save-failed'?'Could not save your account. Please contact the institute.':'Could not create account: '+(e.message||e.code);
   }
  };
}
let __first=true;
auth.onAuthStateChanged(u=>{
  if(busy)return;
  const early=__first&&window.__earlyHome;__first=false;window.__authDone=true;
  try{u?localStorage.setItem('stemHint','1'):localStorage.removeItem('stemHint')}catch(e){}
  if(!u&&early&&app.querySelector('.home'))return;
  closeEmailPopup();clearInterval(timerId);NAV=[];CUR=null;$('bar').innerHTML='';wmOff();if(REGUN){REGUN();REGUN=null}NEWREG=[];REGALL=[];REGSEEN=0;window.__pre=null;
  if(!u)return loginView();
  me=u;$('bar').innerHTML=barHtml();
  if(u.email===TEACHER){STAFF=null;return teacherView()}
  if(!isParent()){window.__pre=profReads(u.uid);window.__pre.catch(()=>{})}
  db.collection('staff').doc(u.uid).get().then(d=>{if(d.exists&&(d.data().perms||[]).length){window.__pre=null;STAFF=d.data();teacherView()}else{STAFF=null;if(isParent()){window.__pre=null;parentView()}else{myProfile();setTimeout(chkEmail,2000)}}}).catch(()=>{STAFF=null;if(isParent()){window.__pre=null;parentView()}else myProfile()});
 });
/* show the homepage at once for visitors who are not logged in (do not wait for the login check) */
document.addEventListener('DOMContentLoaded',function(){
 try{
  var hint=!!(localStorage.getItem('stemHint')||localStorage.getItem('stemparent')||sessionStorage.getItem('stemview'));
  if(hint||window.__authDone||app.querySelector('.home'))return;
  window.__earlyHome=true;loginView();
 }catch(e){}
});

/* ---------- STUDENT ---------- */
/* ===== NEW FEATURES: language, anti-cheat, mistakes, daily quiz, winners, referral ===== */
const isoD=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
let LANG='en';try{LANG=localStorage.getItem('stemlang')||'en'}catch(e){}
const qL=q=>LANG==='hi'&&q.qh?q.qh:q.q;
const oL=q=>LANG==='hi'&&q.oh&&q.o&&q.oh.length===q.o.length?q.oh:(q.o||[]);
const lgBtn=q=>q.qh?`<button class="s lgt" onclick="setLang('${LANG==='hi'?'en':'hi'}')">${LANG==='hi'?'English':'हिंदी'}</button>`:'';
function setLang(l){const t=X&&!X.sub&&$('tm');if(t){try{const v=cur();if(v!=null)X.pd={i:X.i,v}}catch(e){}}LANG=l;try{localStorage.setItem('stemlang',l)}catch(e){}if(t)draw();else if($('rv1')&&window.REVID)review(window.REVID);else if($('misw'))mistakesView()}
/* anti-cheating: 3 warnings then auto-submit */
const VIO_MAX=3;let vioT=0;
function vio(){if(!X||X.sub||!app.classList.contains('nt')||!$('tm'))return;const n=Date.now();if(n-vioT<700)return;vioT=n;X.vio=(X.vio||0)+1;progSave(true);if(X.vio>=VIO_MAX){stemToast('Test submitted automatically: you left the test screen '+VIO_MAX+' times.',1);submitT();return}stemToast('Warning '+X.vio+'/'+VIO_MAX+': do not leave the test screen. At '+VIO_MAX+' warnings the test is submitted.',1)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)vio();else if(X&&!X.sub&&(X.vio||0)>=VIO_MAX)submitT()});
window.addEventListener('blur',()=>{setTimeout(()=>{if(!document.hasFocus())vio()},400)});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)vio()});
document.addEventListener('keydown',e=>{if(!app.classList.contains('nt'))return;const k=(e.key||'').toLowerCase(),inp=e.target&&e.target.tagName==='INPUT';if(e.key==='F12'||e.key==='PrintScreen'||((e.ctrlKey||e.metaKey)&&['u','s','p'].includes(k))||((e.ctrlKey||e.metaKey)&&['c','x','a'].includes(k)&&!inp)||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(k)))e.preventDefault()});
/* stronger copy protection during a test: clipboard is overwritten, selection is cleared, every attempt is a warning */
['copy','cut'].forEach(ev=>document.addEventListener(ev,e=>{if(!app.classList.contains('nt')||(e.target&&e.target.tagName==='INPUT'))return;e.preventDefault();e.stopPropagation();try{e.clipboardData.setData('text/plain','Copying is not allowed during the test.')}catch(x){}vio()},true));
document.addEventListener('selectionchange',()=>{if(!app.classList.contains('nt'))return;const a=document.activeElement;if(a&&a.tagName==='INPUT')return;const g=window.getSelection();if(g&&!g.isCollapsed)g.removeAllRanges()});
window.addEventListener('beforeprint',()=>{if(app.classList.contains('nt'))vio()});
/* mistake notebook */
async function saveMist(){try{
 const k=await db.collection('keys').doc(X.id).get(),K=k.data().ans,it=[];
 X.T.qs.forEach((_,i)=>{const q=qs_(X.T,i),a=X.a[i];if(!unans(a,q.t)&&isOk(q,a,K[i]))return;
  it.push({q:q.q,qh:q.qh||'',o:q.o||[],oh:q.oh||[],s:q.s||'',t:q.t,k:K[i]})});
 if(it.length)await db.collection('mistakes').doc(me.uid+'_'+X.id).set({uid:me.uid,testId:X.id,title:X.T.title||'Test',items:it,at:firebase.firestore.FieldValue.serverTimestamp()});
}catch(e){}}
let MIS=[];
async function mistakesView(){
 app.innerHTML=sNav('m')+'<h3>Mistake notebook</h3>Loading…';
 try{const s=await db.collection('mistakes').where('uid','==',me.uid).get();MIS=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.at&&b.at.toMillis?b.at.toMillis():0)-(a.at&&a.at.toMillis?a.at.toMillis():0)))}
 catch(e){app.innerHTML=sNav('m')+'<div class="card bad">Could not load: '+esc(e.message)+'</div>';return}
 const n=MIS.reduce((a,d)=>a+d.items.length,0);
 app.innerHTML=sNav('m')+`<div id="misw"><h3>Mistake notebook</h3>`+(MIS.some(d=>d.items.some(q=>q.qh))?lgBtn({qh:1}):'')+`<small>Wrong and unattempted questions from your tests (${n}). Tap an option to try again. Tap "I understood this" when you are sure.</small>`+
 MIS.map((d,x)=>d.items.length?`<details class="card"${x?'':' open'}><summary><b>${esc(d.title||'Test')}</b> <small>(${d.items.length})</small></summary>`+d.items.map((q,i)=>`<div class="card" id="mi${x}_${i}"><small>${esc(q.s||'')}</small><p class="qt">${rich(qL(q))}</p>`+(q.t==='num'?`<button class="s" onclick="misShow(${x},${i})">Show answer</button><p class="ok" id="mn${x}_${i}"></p>`:oL(q).map((o,j)=>`<button class="s mo" onclick="misTry(${x},${i},${j})">${rich(o)}</button>`).join(''))+`<button onclick="misDone(${x},${i})">I understood this</button></div>`).join('')+'</details>':'').join('')+(n?'':'<div class="card">No mistakes saved yet. After you submit a test, your wrong and unattempted questions appear here.</div>')+'</div>';
}
function misTry(x,i,j){const q=MIS[x].items[i];document.querySelectorAll('#mi'+x+'_'+i+' .mo').forEach((b,k)=>{b.disabled=true;if(k===q.k)b.classList.add('okb');else if(k===j)b.classList.add('badb')})}
function misShow(x,i){$('mn'+x+'_'+i).textContent='Answer: '+MIS[x].items[i].k}
async function misDone(x,i){const d=MIS[x];d.items.splice(i,1);try{if(d.items.length)await db.collection('mistakes').doc(d.id).update({items:d.items});else await db.collection('mistakes').doc(d.id).delete()}catch(e){alert(e.message)}mistakesView()}
/* daily quiz + streak */
let QZ=null;
async function quizView(){
 app.innerHTML=sNav('q')+'<h3>Daily quiz</h3>Loading…';
 const td=isoToday();let qd=null,sk={};
 try{const[a,b]=await Promise.all([db.collection('dailyquiz').doc(td).get(),db.collection('streaks').doc(me.uid).get()]);qd=a.exists?a.data():null;sk=b.exists?b.data():{}}
 catch(e){app.innerHTML=sNav('q')+'<div class="card bad">Could not load: '+esc(e.message)+'</div>';return}
 const y=isoD(new Date(Date.now()-864e5)),c0=(sk.last===td||sk.last===y)?(sk.count||0):0;
 const hd=`<div class="card shero"><b>🔥 Streak: ${c0} day${c0==1?'':'s'}</b><br>Best: ${sk.best||0}</div>`;
 if(!qd||!qd.qs||!qd.qs.length){app.innerHTML=sNav('q')+hd+'<div class="card">Today\'s quiz is not added yet. Please check later.</div>';return}
 if(sk.last===td){app.innerHTML=sNav('q')+hd+'<div class="card"><b class="ok">Today\'s quiz is done.</b><br>Your score: '+(sk.lastScore??'')+' / '+qd.qs.length+'<br><small>Come back tomorrow to keep your streak.</small><button class="s" onclick="pdfQuiz(\''+td+'\',this,1)">Download today\'s quiz (PDF with answers)</button></div>';return}
 QZ={qd,sk,td,y,a:[],n:0,ok:0};
 app.innerHTML=sNav('q')+hd+(qd.qs.some(q=>q.qh)?lgBtn({qh:1}):'')+'<small>Tap an option to see if it is right. Answer every question to keep your streak.</small>'+qd.qs.map((q,i)=>`<div class="card" id="zq${i}"><b>${i+1}.</b> <span class="qt">${rich(qL(q))}</span>`+oL(q).map((o,j)=>`<button class="s zo" onclick="zAns(${i},${j})">${rich(o)}</button>`).join('')+'</div>').join('')+'<div id="zres"></div>';
}
function zAns(i,j){if(QZ.a[i]!=null)return;QZ.a[i]=j;const k=QZ.qd.ans[i];document.querySelectorAll('#zq'+i+' .zo').forEach((b,x)=>{b.disabled=true;if(x===k)b.classList.add('okb');else if(x===j)b.classList.add('badb')});if(j===k)QZ.ok++;QZ.n++;if(QZ.n===QZ.qd.qs.length)zDone()}
async function zDone(){const{sk,td,y,ok,qd}=QZ,c=sk.last===y?(sk.count||0)+1:1,b=Math.max(sk.best||0,c);
 try{await db.collection('streaks').doc(me.uid).set({uid:me.uid,last:td,count:c,best:b,lastScore:ok})}catch(e){}
 $('zres').innerHTML=`<div class="card shero"><b>Score: ${ok} / ${qd.qs.length}</b><br>🔥 Streak: ${c} day${c==1?'':'s'}</div>`;window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})}
function quizToText(qs,ans){return qs.map((q,i)=>{const L=[],ql=String(q.q).split('\n');L.push('Q: '+ql[0],...ql.slice(1));if(q.qh)L.push('QH: '+q.qh);if(q.img)L.push('IMG: '+q.img);(q.o||[]).forEach((o,j)=>L.push('ABCD'[j]+') '+o));if(q.oh)q.oh.forEach((o,j)=>L.push('H'+'ABCD'[j]+') '+o));L.push('ANS: '+'ABCD'[ans[i]]);return L.join('\n')}).join('\n\n')}
function quizAdmin(){$('tv').innerHTML=`<div class="card"><h3>Daily quiz</h3><small>Pick a date. To change a saved quiz, tap Edit below (or Load this date), correct it and save again.</small><input id="zd" type="date" value="${isoToday()}"><textarea id="zt" rows="14" placeholder="Same format as test papers (about 10 questions):&#10;Q: question&#10;A) option&#10;B) option&#10;C) option&#10;D) option&#10;ANS: B&#10;&#10;Hindi is optional: add a QH: line after Q, and HA) HB) HC) HD) lines after D)."></textarea><div class="btns"><button onclick="quizSave()">Save quiz for this date</button><button class="s" onclick="quizEdit($('zd').value)">Load this date to edit</button></div><p id="zm"></p></div><div id="zl">Loading…</div>`;quizList()}
async function quizList(){const el=$('zl');if(!el)return;
 try{const s=await db.collection('dailyquiz').get(),L=s.docs.map(d=>({id:d.id,n:(d.data().qs||[]).length})).sort((a,b)=>b.id.localeCompare(a.id));
  el.innerHTML='<h3>Saved quizzes ('+L.length+')</h3>'+(L.map(x=>`<div class="card"><b>${esc(dmy(x.id)||x.id)}</b> <small>(${esc(x.id)})</small> &middot; ${x.n} questions<div class="btns"><button class="s" onclick="quizEdit('${x.id}')">Edit</button><button class="s" onclick="pdfQuiz('${x.id}',this,0)">PDF</button><button class="s" onclick="pdfQuiz('${x.id}',this,1)">PDF with answers</button></div><button class="s" onclick="quizDel('${x.id}')">Delete</button></div>`).join('')||'<p>No quiz saved yet.</p>')}
 catch(e){el.innerHTML='<p class="bad">Could not list the saved quizzes: '+esc(e.message)+'</p>'}}
async function quizEdit(d){const m=$('zm');m.className='';
 if(!d){m.className='bad';m.textContent='Choose a date first.';return}
 try{const s=await db.collection('dailyquiz').doc(d).get();
  if(!s.exists){m.className='bad';m.textContent='No quiz is saved for '+dmy(d)+'. You can type a new one and save it.';$('zt').value='';return}
  const x=s.data();$('zd').value=d;$('zt').value=quizToText(x.qs||[],x.ans||[]);m.className='ok';m.textContent='Editing the quiz of '+dmy(d)+' ('+(x.qs||[]).length+' questions). Change it and tap Save quiz for this date.';window.scrollTo({top:0,behavior:'smooth'})}
 catch(e){m.className='bad';m.textContent=e.message}}
async function quizDel(d){if(!confirm('Delete the quiz of '+dmy(d)+'?'))return;try{await db.collection('dailyquiz').doc(d).delete();quizList()}catch(e){alert(e.message)}}
async function quizSave(){const m=$('zm'),r=parseQ($('zt').value);if(r.err){m.className='bad';return m.textContent=r.err}if(!r.qs.length||r.qs.some(q=>q.t==='num')){m.className='bad';return m.textContent='Add multiple-choice questions only.'}if(!$('zd').value){m.className='bad';return m.textContent='Choose a date.'}try{await db.collection('dailyquiz').doc($('zd').value).set({qs:r.qs,ans:r.ans});m.className='ok';m.textContent='Saved '+r.qs.length+' questions for '+dmy($('zd').value)+'.';quizList()}catch(e){m.className='bad';m.textContent=e.message}}
async function pdfQuiz(d,btn,withKey){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const old=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent='Preparing PDF…'}
 try{
  const s=await db.collection('dailyquiz').doc(d).get();if(!s.exists)throw new Error('This quiz was not found.');
  const Q=s.data(),qs=Q.qs||[],an=Q.ans||[],doc=new window.jspdf.jsPDF('p','mm','a4'),bil=pbHasHi(qs),qp=await pbFlow(doc,qs,bil);
  pbPages(doc,'Daily Quiz: '+dmy(d),'STEM Coaching Institute',qp,bil,1);
  if(withKey){
   doc.addPage();doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(23,48,107);doc.text('Answer key: Daily Quiz '+dmy(d),12,20);
   doc.setTextColor(0);doc.setFont('helvetica','normal');doc.setFontSize(12);
   an.forEach((a,i)=>doc.text((i+1)+'.  '+('ABCD'[a]||'-'),14+(i%5)*38,34+Math.floor(i/5)*10));
  }
  doc.save('STEM_DailyQuiz_'+d+(withKey?'_with_answers':'')+'.pdf');
 }catch(e){alert('Could not make the PDF: '+e.message)}
 if(btn){btn.disabled=false;btn.textContent=old}
}
/* student of the week + topper wall */
function winAdmin(){$('tv').innerHTML='<div class="card"><h3>Student of the week</h3><small>Uses marks of tests taken in the last 7 days. Open the Results tab once first so marks are up to date.</small><button onclick="winPick()">Pick this week\'s toppers</button><p id="wm"></p></div>'}
async function winPick(){const m=$('wm');m.className='';m.textContent='Working…';try{
 const[mk,st]=await Promise.all([db.collection('marks').get(),db.collection('students').get()]),S={},A={},from=Date.now()-7*864e5;
 st.forEach(d=>S[d.id]=d.data());
 mk.forEach(d=>{const x=d.data();if(!(x.t0>=from)||!x.max)return;const a=A[x.uid]=A[x.uid]||{sc:0,max:0,n:0};a.sc+=x.sc;a.max+=x.max;a.n++});
 const L=Object.entries(A).map(([u,a])=>({uid:u,n:(S[u]||{}).name||'Student',cls:(S[u]||{}).cls||'',pct:Math.round(a.sc*1000/a.max)/10,tests:a.n})).sort((a,b)=>b.pct-a.pct).slice(0,10);
 if(!L.length){m.textContent='No tests were taken in the last 7 days.';return}
 await db.collection('winners').doc('current').set({week:isoToday(),list:L});m.className='ok';m.textContent='Saved. Student of the week: '+L[0].n+' ('+L[0].pct+'%)';
}catch(e){m.className='bad';m.textContent=e.message}}
async function wallView(){
 app.innerHTML=sNav('k')+'<h3>Topper wall</h3>Loading…';let w=null;
 try{const d=await db.collection('winners').doc('current').get();w=d.exists?d.data():null}catch(e){}
 if(!w||!w.list||!w.list.length){app.innerHTML=sNav('k')+'<h3>Topper wall</h3><div class="card">This week\'s toppers will be announced soon.</div>';return}
 const t=w.list[0];
 app.innerHTML=sNav('k')+`<h3>Topper wall</h3><div class="card shero"><small>🏆 STUDENT OF THE WEEK</small><br><b>${esc(t.n)}</b><br>Class ${esc(t.cls)} | ${t.pct}% in ${t.tests} test${t.tests==1?'':'s'}</div>`+w.list.slice(1).map((x,i)=>`<div class="card"><b>${i+2}. ${esc(x.n)}</b> <small>Class ${esc(x.cls)}</small><br>${x.pct}% | ${x.tests} test${x.tests==1?'':'s'}</div>`).join('')+`<small>Week of ${esc(w.week)}</small>`;
}
/* referral */
async function referView(){
 const st=(await db.collection('students').doc(me.uid).get()).data()||{},c=st.roll||'',msg=encodeURIComponent('Join STEM Coaching Institute online tests. Sign up at '+location.origin+location.pathname+' and enter my referral code '+c+' when creating your account.');
 app.innerHTML=sNav('r')+`<h3>Refer &amp; earn</h3><div class="card shero"><small>YOUR REFERRAL CODE</small><br><b>${esc(c)}</b></div><div class="card"><p>Share your code with friends. When a friend joins with it and buys a test series, the institute gives you a discount coupon.</p><a class="call wab" href="https://wa.me/?text=${msg}" target="_blank" rel="noopener">Share on WhatsApp</a></div>`;
}
async function refAdmin(){$('tv').innerHTML='Loading…';try{
 const st=await db.collection('students').get(),S=[],R={};st.forEach(d=>{const x={id:d.id,...d.data()};S.push(x);R[x.roll]=x});const L=S.filter(x=>x.refBy);
 $('tv').innerHTML='<div class="card"><h3>Referrals</h3><small>After the friend buys a series, give the referrer a coupon (Coupons tab) and tap Mark reward given.</small></div>'+(L.map(x=>{const r=R[x.refBy]||{},bought=(x.plans||[]).length>0;return `<div class="card"><b>${esc(r.name||x.refBy)}</b> (${esc(x.refBy)}) referred <b>${esc(x.name||'')}</b> (${esc(x.roll||'')})<br>${bought?'<span class="ok">Friend has bought a series</span>':'<small>Not bought yet</small>'}<br>`+(x.refRewarded?'<span class="ok">Reward given</span>':bought?`<button onclick="refPay('${x.id}')">Mark reward given</button>`:'')+'</div>'}).join('')||'<p>No referrals yet.</p>');
}catch(e){$('tv').innerHTML='<div class="card bad">'+esc(e.message)+'</div>'}}
async function refPay(id){try{await db.collection('students').doc(id).update({refRewarded:true});refAdmin()}catch(e){alert(e.message)}}

const OFFG=['neetoff','biooff','phyoff','chemoff'];
const grp=k=>k==='neet'?['neet','bio','phy','chem']:k==='neetoff'?OFFG:[k];
const owns=(st,k)=>{const p=st.plans||[];return p.includes(k)||(p.includes('neet')&&['bio','phy','chem'].includes(k))||(p.includes('neetoff')&&['biooff','phyoff','chemoff'].includes(k))};
const pnName=x=>(x.title||'')+(x.mode==='offline'?' (Offline at centre)':' (Online)');
const modeBadge=x=>x.mode==='offline'?'<span class="bd">OFFLINE AT CENTRE</span>':'<span class="bo">ONLINE</span>';
async function studentView(f){
 wmOff();
 if(typeof f!=='string')f=null;
 app.innerHTML='Loading…';
 const sd=await db.collection('students').doc(me.uid).get(),st=sd.data()||{};
 if(!sd.exists){app.innerHTML='<div class="card">Your account is not active. Please contact STEM Coaching Institute.</div>';return}
 const [ts,rs,ss,dm]=await Promise.all([db.collection('tests').get(),db.collection('results').where('uid','==',me.uid).get(),db.collection('series').get(),db.collection('demos').get()]);
 const done={};rs.forEach(d=>done[d.data().testId]=1);
 const live={};ts.forEach(d=>{const t=d.data();if(t.live!==false&&!(t.start&&t.start.toMillis&&t.start.toMillis()>Date.now()))live[d.id]=1});
 const dmo={};dm.forEach(d=>{if(live[d.data().testId])dmo[d.id]=d.data().testId});
 const SD={};ss.forEach(d=>SD[d.id]=d.data());
 if(!f&&exGate(st,ss)){examPick('studentView');return}
 const demoRows=Object.keys(dmo).map(k=>({k,title:PN[k]?PN[k].replace(/ \((Online|Offline at centre)\)$/,''):k,...(SD[k]||{})})).filter(x=>x.active!==false&&examOk(x)&&(!x.cls||!st.cls||String(x.cls)===String(st.cls))).sort((a,b)=>(a.o??99)-(b.o??99));
 const demoCard=f?'':`<details class="card" id="dmd"><summary><b>Demo tests</b> <small>(tap to see the test series)</small></summary>`+(demoRows.length?demoRows.map(x=>`<div class="tc"><b>${esc(x.title)}</b>${x.cls?' <small>(Class '+esc(x.cls)+')</small>':''}<br>${modeBadge(x)}<br><button onclick="demoOpen('${x.k}')">${done[dmo[x.k]]?'View demo result':'Open demo test'}</button></div>`).join(''):'<p>No demo tests are available yet.</p>')+`</details>`;
 const cntM={};ts.forEach(d=>{const t=d.data();if(t.live!==false&&!(t.start&&t.start.toMillis&&t.start.toMillis()>Date.now())&&canSee(t,st)){const k=t.pat||'custom';cntM[k]=(cntM[k]||0)+1}});
 const mineRows=ss.docs.map(d=>({k:d.id,...d.data()})).filter(x=>x.active!==false&&owns(st,x.k)&&examOk(x)).sort((a,b)=>(a.o??99)-(b.o??99));
 const mineCard=f?'':(mineRows.length?'<h3>My purchased series</h3>'+mineRows.map(x=>{const n=grp(x.k).reduce((a,k)=>a+(cntM[k]||0),0),off=x.mode==='offline';return `<div class="card tc"><b>${esc(x.title)}</b>${x.cls?' <small>(Class '+esc(x.cls)+')</small>':''}<br>${modeBadge(x)}<br>`+(off?'<b class="ok">You are enrolled. Tests are held offline at the centre.</b>':'')+(n>0||!off?`<br><button onclick="studentView('${x.k}')">Open (${n} test${n==1?'':'s'})</button>`:'')+'</div>'}).join(''):'');
 const now=Date.now(),list=ts.docs.filter(d=>d.data().live!==false&&!(d.data().start&&d.data().start.toMillis()>now)&&canSee(d.data(),st)&&(f?grp(f).includes(d.data().pat||'custom'):(d.data().pat||'custom')==='custom')).map(d=>{
  const t=d.data(),n=t.qs?t.qs.length:t.n,f=t.start&&t.start.toMillis()>now;
  return `<div class="card tc"><b>${esc(t.title)}</b><span class="chip">${n} questions, ${t.mins} minutes</span>`+
   (done[d.id]?`<button class="s" onclick="review('${d.id}')">View result</button>`:f?`<b>Starts on ${t.start.toDate().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</b><br><small>Refresh this page at that time.</small>`:`<button onclick="startTest('${d.id}')">Start test</button>`)+'</div>'}).join('');
 app.innerHTML=`<div class="card shero"><b>${esc(st.name||'')}</b><br>Roll no: ${esc(st.roll||'')} | Class ${esc(st.cls||'')}</div>${sNav(f?'s':'t')}${f?'':exBar('studentView')}<h3>${f?esc(PN[f]||'Series')+' tests':'Mock tests'}</h3>${demoCard}${mineCard}`+(f?(list||'<p>No tests available yet.</p>'):(list?'<h3>Other tests</h3>'+list:(mineRows.length?'':'<p><small>Your purchased series tests are in Test series, then Open.</small></p>')));
}

/* ---------- student chooses NEET or JEE ---------- */
const exKey=()=>'stemexam_'+(me?me.uid:'');
const EXC=()=>{try{return localStorage.getItem(exKey())||''}catch(e){return ''}};
const examOk=x=>{const c=EXC(),e=examOf(x);return !c||c==='ALL'||!e||e===c};
function exGate(st,ss){const E={};ss.docs.forEach(d=>{const x={k:d.id,...d.data()};if(x.active!==false)E[examOf(x)]=1});window.__exboth=!!(E.NEET&&E.JEE);return window.__exboth&&!EXC()&&(st.plans||[]).length>0}
function exBar(n){if(!window.__exboth)return '';const c=EXC();return '<div class="exseg"><b>Exam</b>'+[['NEET','NEET'],['JEE','JEE'],['ALL','Show all']].map(a=>'<button type="button" class="'+(c===a[0]?'on':'')+'" onclick="examSet(\''+a[0]+'\',\''+n+'\')">'+a[1]+'</button>').join('')+'</div>'}
function examSet(v,n){try{localStorage.setItem(exKey(),v)}catch(e){}(window[n||'studentView']||studentView)()}
function examPick(n){n=n||'studentView';app.innerHTML='<div class="phero"><span class="phi" style="background:linear-gradient(135deg,#f5b800,#d98e00)">&#127919;</span><div class="pht"><b>Choose your exam</b><small>You will see only that exam\'s test series</small></div><button type="button" class="phb" onclick="myProfile()">&#8249; Home</button></div><div class="xg"><button type="button" class="xt xt-n" onclick="examSet(\'NEET\',\''+n+'\')"><span>&#129658;</span><b>NEET</b><small>Medical entrance</small></button><button type="button" class="xt xt-j" onclick="examSet(\'JEE\',\''+n+'\')"><span>&#9881;&#65039;</span><b>JEE</b><small>Engineering entrance</small></button></div><button type="button" class="s xb" onclick="examSet(\'ALL\',\''+n+'\')">Show both</button><p class="xn">You can change this any time from the menu.</p>'}
async function demoOpen(k){
 try{
  window.__ds='reading demo';const dd=await db.collection('demos').doc(k).get();
  if(!dd.exists)return alert('No demo test is set for this series yet.');
  const id=dd.data().testId,rs=(window.__ds='reading results',await db.collection('results').where('uid','==',me.uid).get());window.__ds='opening test';
  if(rs.docs.some(d=>d.data().testId===id))await review(id);else await startTest(id);
 }catch(e){alert('Demo test error at "'+(window.__ds||'start')+'": '+(e.message||e.code))}
}
async function catalogue(){
 app.innerHTML='Loading…';
 try{
  const sd=await db.collection('students').doc(me.uid).get(),st=sd.data()||{};
  const [ss,ts]=await Promise.all([db.collection('series').get(),db.collection('tests').get()]);
  const cnt={};ts.forEach(d=>{const t=d.data();if(t.live!==false&&!(t.start&&t.start.toMillis&&t.start.toMillis()>Date.now())){const k=t.pat||'custom';cnt[k]=(cnt[k]||0)+1}});
  ss.forEach(d=>PN[d.id]=pnName(d.data()));
  if(exGate(st,ss)){examPick('catalogue');return}
  const rows=ss.docs.map(d=>({k:d.id,...d.data()})).filter(x=>x.active!==false&&examOk(x)&&(!x.cls||x.cls===st.cls)).sort((a,b)=>(a.o??99)-(b.o??99));
  app.innerHTML=`${sNav('s')}${exBar('catalogue')}<h3>Test series</h3>`+(rows.map(x=>{
   const n=grp(x.k).reduce((a,k)=>a+(cnt[k]||0),0),has=owns(st,x.k),off=x.mode==='offline';
   return `<div class="card tc"><b>${esc(x.title)}</b>${x.cls?' <small>(Class '+esc(x.cls)+')</small>':''}<br>${modeBadge(x)}<br>${esc(x.desc||'')}<br>`+
    (has?(off?'<b class="ok">You are enrolled. Tests are held offline at the centre.</b>':'')+(n>0||!off?`<br><button onclick="studentView('${x.k}')">Open (${n} test${n==1?'':'s'})</button>`:''):x.price>0?`<b>Fee: ₹${x.price}</b><button onclick="buy('${x.k}')">Buy</button>`:'<small>Price coming soon</small>')+'</div>'}).join('')||'<p>No test series available for your class yet.</p>');
 }catch(e){app.innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}

/* ---------- TEST SERIES SCHEDULE (students download as PDF, no purchase needed) ---------- */
async function schedView(){
 app.innerHTML='Loading…';
 try{
  const sd=await db.collection('students').doc(me.uid).get(),st=sd.data()||{};
  const [ss,sc]=await Promise.all([db.collection('series').get(),db.collection('schedules').get()]);
  const S={};sc.forEach(d=>S[d.id]=d.data());
  const rows=ss.docs.map(d=>({k:d.id,...d.data()})).filter(x=>x.active!==false&&examOk(x)&&(!x.cls||x.cls===st.cls)).sort((a,b)=>(a.o??99)-(b.o??99));
  app.innerHTML=sNav('d')+'<h3>Test schedule</h3><small>Tap Download PDF next to a test series to get its schedule. You do not need to buy the series.</small>'+
   (rows.map(x=>{
    const has=S[x.k]&&String(S[x.k].txt||'').trim();
    return `<div class="card tc"><div class="sch"><div class="sn"><b>${esc(x.title)}</b>${x.cls?' <small>(Class '+esc(x.cls)+')</small>':''}<br>${modeBadge(x)}</div>${has?`<button class="sd" onclick="schedPdf('${x.k}',this)">Download PDF</button>`:'<small>Schedule coming soon</small>'}</div></div>`}).join('')||'<p>No test series available for your class yet.</p>');
 }catch(e){app.innerHTML=sNav('d')+'<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
async function schedPdf(k,btn){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const old=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent='Preparing…'}
 try{
  const [sd,cd]=await Promise.all([db.collection('series').doc(k).get(),db.collection('schedules').doc(k).get()]);
  const s=sd.data()||{},x=cd.exists?cd.data():null;
  if(!x||!String(x.txt||'').trim()){alert('The schedule for this series is not available yet.');return}
  const HD=['Date','Test','Syllabus / Subject','Time'];
  const lines=String(x.txt).split('\n').map(l=>l.trim()).filter(Boolean);
  const parsed=lines.map(l=>{
   if(l.indexOf('|')<0)return {h:l.replace(/^#+\s*/,'')};
   const p=l.split('|').map(z=>z.trim());
   if(p.length>4)p.splice(3,p.length-3,p.slice(3).join(' | '));
   return {c:p};
  });
  let nc=1;parsed.forEach(r=>{if(r.c){let m=r.c.length;while(m>1&&!r.c[m-1])m--;nc=Math.max(nc,m)}});
  const body=parsed.map(r=>r.h!=null?[{content:r.h,colSpan:nc,styles:{halign:'left',fontStyle:'bold',fillColor:[238,241,248],textColor:[23,48,107]}}]:Array.from({length:nc},(_,i)=>r.c[i]||''));
  const doc=new window.jspdf.jsPDF(),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
  doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('STEM COACHING INSTITUTE',W/2,14,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('NEET / Board / Medical / Foundation | Pargyapuram, Lakhpedabagh, Barabanki | 9236990414',W/2,20,{align:'center'});
  const ttl=(s.title||x.title||'Test series'),sub=(s.mode==='offline'?'Offline at centre':'Online')+(s.cls?' | Class '+s.cls:'');
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Test Schedule: '+ttl,W/2,29,{align:'center',maxWidth:W-24});
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(sub+(x.at&&x.at.toDate?' | Updated: '+x.at.toDate().toLocaleDateString('en-GB'):''),W/2,35,{align:'center'});
  doc.autoTable({startY:40,theme:'grid',head:[HD.slice(0,nc)],body,styles:{fontSize:10,cellPadding:2.4,lineColor:[150,150,150],valign:'middle'},headStyles:{fillColor:[23,48,107],textColor:255},margin:{left:12,right:12}});
  const nt=String(x.note||'').trim();
  if(nt){
   let y=doc.lastAutoTable.finalY+8;doc.setFont('helvetica','bold');doc.setFontSize(10);
   if(y>H-30){doc.addPage();y=20}
   doc.text('Note:',12,y);y+=5;doc.setFont('helvetica','normal');doc.setFontSize(9);
   doc.splitTextToSize(nt,W-24).forEach(l=>{if(y>H-14){doc.addPage();y=20}doc.text(l,12,y);y+=4.6});
  }
  const pc=doc.getNumberOfPages();
  for(let i=1;i<=pc;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('Page '+i+' of '+pc,W/2,H-6,{align:'center'})}
  doc.save('STEM_Schedule_'+R_name(ttl+(s.mode==='offline'?' Offline':' Online'))+'.pdf');
 }catch(e){alert('Could not make the PDF: '+(e.message||e.code))}
 if(btn){btn.disabled=false;btn.textContent=old}
}
async function schedAdmin(msg){
 $('tv').innerHTML='Loading…';
 try{
  const [ss,sc]=await Promise.all([db.collection('series').get(),db.collection('schedules').get()]);
  const S={};sc.forEach(d=>S[d.id]=d.data());
  const rows=ss.docs.map(d=>({k:d.id,...d.data()})).sort((a,b)=>(a.o??99)-(b.o??99));
  $('tv').innerHTML='<h3>Test series schedule</h3><small>Students see a Download PDF button next to every series that has a schedule. They do not need to buy the series.</small>'+(msg?'<p class="ok">'+esc(msg)+'</p>':'')+
   (rows.map(x=>{
    const c=S[x.k],has=c&&String(c.txt||'').trim(),n=has?String(c.txt).split('\n').filter(l=>l.trim()).length:0;
    return `<div class="card"><b>${esc(x.title)}</b> ${modeBadge(x)}<br><small>${has?'Schedule is set ('+n+' line'+(n==1?'':'s')+')':'No schedule yet'}</small><div class="btns"><button class="s" onclick="schedEdit('${x.k}')">${has?'Edit schedule':'Add schedule'}</button>${has?`<button class="s" onclick="schedPdf('${x.k}',this)">Preview PDF</button>`:''}</div><div id="sg${x.k}"></div></div>`}).join('')||'<p>No test series yet. Add them in the Series tab first.</p>');
 }catch(e){$('tv').innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function schedEdit(k){
 const box=$('sg'+k);box.innerHTML='Loading…';
 try{
  const d=await db.collection('schedules').doc(k).get(),x=d.exists?d.data():{};
  box.innerHTML=`<small>Write one test per line: <b>Date | Test | Syllabus | Time</b>. A line without | becomes a heading row (for example: Biology tests).</small><textarea id="st${k}" rows="10" placeholder="Biology tests&#10;05/12/2026 | Test 1 | Cell: Structure and Function | 10:00 AM&#10;12/12/2026 | Test 2 | Biomolecules | 10:00 AM">${esc(x.txt||'')}</textarea><textarea id="sn${k}" rows="3" placeholder="Note for students (optional), for example: Bring your admit card and OMR pen.">${esc(x.note||'')}</textarea><button onclick="schedSave('${k}')">Save schedule</button>${d.exists?`<button class="s" onclick="schedDel('${k}')">Delete schedule</button>`:''}<p id="sm${k}" class="bad"></p>`;
 }catch(e){box.innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function schedSave(k){
 const txt=$('st'+k).value.trim(),note=$('sn'+k).value.trim(),m=$('sm'+k);
 if(!txt)return m.textContent='Please write the schedule first.';
 try{
  let t='';try{t=((await db.collection('series').doc(k).get()).data()||{}).title||''}catch(e){}
  await db.collection('schedules').doc(k).set({title:t,txt,note,at:firebase.firestore.FieldValue.serverTimestamp()});
  schedAdmin('Schedule saved. Students can download it now.');
 }catch(e){m.textContent=e.message||e.code}
}
async function schedDel(k){
 if(!confirm('Delete the schedule of this series?'))return;
 try{await db.collection('schedules').doc(k).delete();schedAdmin('Schedule deleted.')}catch(e){alert(e.message)}
}
async function buy(k){
 let s;try{s=(await db.collection('series').doc(k).get()).data()||{}}catch(e){return alert(e.message)}
 let fin=s.price,used='';
 app.innerHTML=`<div class="phero"><span class="phi" style="background:linear-gradient(135deg,#f59a23,#d9680b)">&#128722;</span><div class="pht"><b>Enroll now</b><small>Review your test series and pay</small></div><button type="button" class="phb" onclick="catalogue()">&#8249; Back</button></div><div class="card"><h3>${esc(s.title||'')}</h3>${modeBadge(s)}<p>${esc(s.desc||'')}</p><div class="fee"><span>Fee</span><span id="pr"><b>₹${s.price}</b></span></div><small>Have a coupon? Enter it below.</small><div class="cpn"><input id="cc" placeholder="Coupon code" autocapitalize="characters" autocomplete="off"><button class="s" id="ca" type="button">Apply</button></div><p id="cm"></p><button id="pn" class="payb">Continue to pay &#8250;</button><button class="s" onclick="catalogue()">Back to test series</button><p class="xn">&#128274; You pay securely online.</p></div>`;
 $('ca').onclick=async()=>{
  const c=$('cc').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),m=$('cm');
  const bad=t=>{fin=s.price;used='';$('pr').innerHTML='<b>₹'+s.price+'</b>';m.className='bad';m.textContent=t};
  if(!c)return bad('Please type your coupon code.');
  try{
   const d=await db.collection('coupons').doc(c).get(),x=d.data();
   if(!d.exists||x.active===false||!(x.pct>0&&x.pct<=100))return bad('This coupon code is not valid.');
   if(x.exp&&Date.now()>x.exp)return bad('This coupon code has expired.');
   if(x.max>0&&(x.used||0)>=x.max)return bad('This coupon has reached its usage limit.');
   fin=Math.round(s.price*(100-x.pct)/100);used=c;
   $('pr').innerHTML='<s>₹'+s.price+'</s> <b>₹'+fin+'</b>';m.className='ok';m.textContent=x.pct+'% discount applied. You save ₹'+(s.price-fin)+'.';
  }catch(e){bad('This coupon code is not valid.')}
 };
 $('pn').onclick=()=>payStart(k,s,()=>used);
}
const API='https://stem-api-947770205223.asia-south1.run.app';
async function api(action,data){
 const t=await me.getIdToken();
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action,...data})});
 const j=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(j.error||'Request failed. Please try again.');
 return j;
}
async function payStart(k,s,gu){
 app.innerHTML='<div class="card">Please wait…</div>';
 try{const st=await api('status',{});if(!st.verified)return emailStep(k,s,gu,st.email||'');await payGo(k,s,gu())}
 catch(e){alert(e.message);buy(k)}
}
function emailStep(k,s,gu,em){
 app.innerHTML=`<div class="card"><h3>Verify your email</h3><small>We will send a 6-digit code to your email. This is needed only once, before your first online payment.</small><input id="ve" type="email" placeholder="Your email address" value="${esc(em)}" autocomplete="email"><button id="vs">Send code</button><input id="vc" inputmode="numeric" maxlength="6" placeholder="6-digit code" style="display:none"><button id="vv" style="display:none">Verify and continue</button><p id="vm"></p><button class="s" onclick="buy('${k}')">Back</button></div>`;
 const m=$('vm');
 $('vs').onclick=async()=>{m.className='';m.textContent='Sending…';$('vs').disabled=true;
  try{await api('sendcode',{email:$('ve').value.trim()});m.className='ok';m.textContent='Code sent. Please check your inbox and spam folder.';$('vc').style.display=$('vv').style.display=''}
  catch(e){m.className='bad';m.textContent=e.message}
  $('vs').disabled=false};
 $('vv').onclick=async()=>{m.className='';m.textContent='Checking…';
  try{await api('verifycode',{code:$('vc').value.trim()});payGo(k,s,gu())}catch(e){m.className='bad';m.textContent=e.message}};
}
async function payGo(k,s,used){
 app.innerHTML='<div class="card">Starting payment…</div>';
 try{
  if(!window.Razorpay)await new Promise((ok,no)=>{const x=document.createElement('script');x.src='https://checkout.razorpay.com/v1/checkout.js';x.onload=ok;x.onerror=()=>no(new Error('Could not load the payment page. Please check your internet.'));document.head.appendChild(x)});
  const o=await api('order',{series:k,coupon:used}),sd=(await db.collection('students').doc(me.uid).get()).data()||{};
  let paid=0;
  const rz=new Razorpay({key:o.key,amount:o.amount,currency:'INR',name:'STEM Coaching Institute',description:o.title,order_id:o.orderId,prefill:{name:sd.name||'',contact:sd.roll||'',email:o.email||''},theme:{color:'#1a56db'},
   handler:async r=>{paid=1;app.innerHTML='<div class="card">Confirming your payment. Please do not close this page…</div>';
    try{const v=await api('verify',{orderId:r.razorpay_order_id,paymentId:r.razorpay_payment_id,signature:r.razorpay_signature});alert('Payment successful. Receipt no. '+v.no);myReceipts()}
    catch(e){app.innerHTML='<div class="card bad">Your payment was received, but confirmation is delayed. Please do not pay again. Call the institute: <a href="tel:9236990414">9236990414</a>. Reference: '+esc(r.razorpay_payment_id)+'</div>'}},
   modal:{ondismiss:()=>{if(!paid)catalogue()}}});
  rz.on('payment.failed',r=>alert('Payment failed: '+((r.error&&r.error.description)||'please try again.')));
  rz.open();
 }catch(e){alert(e.message);catalogue()}
}
let WM='',PHOTO='';
function wmOff(){const d=$('wmk');if(d)d.remove();app.classList.remove('nt');app.style.visibility=''}
function wmOn(){
 wmOff();
 const svg="<svg xmlns='http://www.w3.org/2000/svg' width='300' height='170'><text x='150' y='90' text-anchor='middle' transform='rotate(-25 150 85)' font-size='17' font-family='sans-serif' fill='#777' fill-opacity='.30'>"+esc(WM)+"</text></svg>";
 const d=document.createElement('div');d.id='wmk';
 d.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:50;pointer-events:none';
 d.style.backgroundImage='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
 document.body.appendChild(d);
}
function chkHide(){app.style.visibility=app.classList.contains('nt')&&(document.hidden||!document.hasFocus())?'hidden':''}
['visibilitychange','blur','focus'].forEach(ev=>(ev==='visibilitychange'?document:window).addEventListener(ev,chkHide));
['contextmenu','copy','cut','dragstart','selectstart'].forEach(ev=>document.addEventListener(ev,e=>{if(app.classList.contains('nt')&&!(e.target&&e.target.tagName==='INPUT'))e.preventDefault()}));
const IMG={};
async function loadImgs(T){
 const ids=[...new Set((T.qs||[]).filter(q=>q.img).map(q=>q.img))];
 await Promise.all(ids.map(async id=>{try{const d=await db.collection('qimg').doc(id).get();if(d.exists&&String(d.data().d).startsWith('data:image/'))IMG[id]=d.data().d}catch(e){}}));
}
const qimg=q=>q.img&&IMG[q.img]?'<img class="qi" src="'+IMG[q.img]+'">':'';
async function startTest(id){
 const T=(await db.collection('tests').doc(id).get()).data(),pos=T.pos??4,neg=T.neg??1;
 if(T.live===false||(T.start&&T.start.toMillis&&T.start.toMillis()>Date.now()))return alert('This test is not available yet.');
 if(!T.qs){try{T.qs=(await db.collection('qbank').doc(id).get()).data().qs}catch(e){return alert((e&&e.code==='permission-denied')?'Could not open this test: Firestore rules do not allow it. Please publish the latest Firestore rules (they must contain isDemo).':'This test has not started yet. Please try again at the start time.')}}
 await loadImgs(T);
 try{const sd=await db.collection('students').doc(me.uid).get();WM=((sd.data()||{}).name||'')+' • '+String(me.email||'').split('@')[0]}catch(e){WM=String(me.email||'').split('@')[0]}
 try{const pd=await db.collection('photos').doc(me.uid).get();PHOTO=pd.exists&&String(pd.data().d).startsWith('data:image/')?pd.data().d:''}catch(e){PHOTO=''}
 app.innerHTML=`<div class="ins"><div class="inh"><h3>GENERAL INSTRUCTIONS</h3></div><div class="card">
 <h4 class="ic">Please read the instructions carefully</h4>
 <p class="ih"><u>General Instructions:</u></p>
 <ol>
 <li>Total duration of ${esc(T.title)} is ${T.mins} min.</li>
 <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
 <li>The Questions Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
  <ol class="syl">
  <li><span class="sy sy0"></span>You have not visited the question yet.</li>
  <li><span class="sy sy1"></span>You have not answered the question.</li>
  <li><span class="sy sy2"></span>You have answered the question.</li>
  <li><span class="sy sy3"></span>You have NOT answered the question, but have marked the question for review.</li>
  <li><span class="sy sy4"></span>The question(s) "Answered and Marked for Review" will be considered for evalution.</li>
  </ol></li>
 <li>You can click on the "&gt;" arrow which apperes to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "&lt;" which appears on the right side of question window.</li>
 <li>You can click on your "Profile" image on top right corner of your screen to change the language during the exam for entire question paper. On clicking of Profile image you will get a drop-down to change the question content to the desired language.</li>
 <li>You can click on <span class="nvi">&darr;</span> to navigate to the bottom and <span class="nvi">&uarr;</span> to navigate to top of the question are, without scrolling.</li>
 </ol>
 <p class="ih"><u>Navigating to a Question:</u></p>
 <ol start="7"><li>To answer a question, do the following:
  <ol type="a">
  <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
  <li>Click on <b>Save &amp; Next</b> to save your answer for the current question and then go to the next question.</li>
  <li>Click on <b>Mark for Review &amp; Next</b> to save your answer for the current question, mark it for review, and then go to the next question.</li>
  </ol></li></ol>
 <p class="ih"><u>Answering a Question:</u></p>
 <ol start="8"><li>Procedure for answering a multiple choice type question:
  <ol type="a">
  <li>To select you answer, click on the button of one of the options.</li>
  <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <b>Clear Response</b> button</li>
  <li>To change your chosen answer, click on the button of another option</li>
  <li>To save your answer, you MUST click on the Save &amp; Next button.</li>
  <li>To mark the question for review, click on the Mark for Review &amp; Next button.</li>
  </ol></li>
  <li>To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</li></ol>
 <p class="ih"><u>Navigating through sections:</u></p>
 <ol start="10">
 <li>Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by click on the section name. The section you are currently viewing is highlighted.</li>
 <li>After click the Save &amp; Next button on the last question for a section, you will automatically be taken to the first question of the next section.</li>
 <li>You can shuffle between sections and questions anything during the examination as per your convenience only during the time stipulated.</li>
 <li>Candidate can view the corresponding section summery as part of the legend that appears in every section above the question palette.</li>
 </ol>
 <p class="tdet">Duration: ${T.mins} minutes. Questions: ${T.qs.length}.<br>Correct answer: +${pos} marks. Wrong multiple-choice answer: −${neg} mark. ${T.nn?'Numerical questions: −'+T.nn+' mark for a wrong answer (enter the answer as a whole number).':'Numerical questions have no negative marking.'} Unanswered questions get 0.<br>You can attempt this test only once. Do not leave the test screen: after 3 warnings the test is submitted automatically.</p>
 <p class="rn">Please note all questions will appear in your default language. This language can be changed for a particular question later on.</p>
 <label class="agr"><input type="checkbox" id="rd"><span>I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall.I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations.</span></label>
 <button id="bg" class="proc">Proceed</button></div></div>`;
 $('bg').onclick=()=>{if(!$('rd').checked)return alert('Please tick the box first.');$('bg').disabled=true;runTest(id,T)};
}
const qs_=(T,i)=>{const q=T.qs[i];return{...q,s:q.s||'General',t:q.t||(q.o?'mcq':'num')}};
const unans=(v,t)=>v==null||(t!=='num'&&v===-1);
function score(T,K,A){
 const pos=T.pos??4,neg=T.neg??1,r={sc:0,ok:0,bad:0,un:0,sec:{}};
 T.qs.forEach((_,i)=>{const q=qs_(T,i),a=A[i],k=K[i];r.sec[q.s]=r.sec[q.s]||0;
  if(unans(a,q.t)){r.un++;return}
  const ok=q.t==='num'?Math.abs(a-k)<0.01:a===k,m=ok?pos:-(q.t==='num'?(T.nn||0):neg);
  ok?r.ok++:r.bad++;r.sc+=m;r.sec[q.s]+=m});
 return r;
}
let X;
/* warn before refresh / close while a test is running */
window.addEventListener('beforeunload',function(e){if(typeof X!=='undefined'&&X&&!X.sub&&document.getElementById('tm')){e.preventDefault();e.returnValue='Your test is running. If you refresh or leave, you may lose your progress.';return e.returnValue}});
const tm=()=>{const s=Math.max(0,Math.round((X.end-Date.now())/1000));return[s/3600|0,(s/60|0)%60,s%60].map(v=>String(v).padStart(2,'0')).join(':')};
async function runTest(id,T){
 $('bar').innerHTML='';wmOn();app.classList.add('nt');chkHide();try{const de=document.documentElement;de.requestFullscreen&&de.requestFullscreen().catch(()=>{})}catch(e){}
 /* extra history pages so the Back button cannot leave the test (must run inside the Proceed click) */
 try{history.pushState({stem:1},'',location.href);history.pushState({stem:1},'',location.href)}catch(e){}
 const n=T.qs.length;
 X={id,T,n,secs:[...new Set(T.qs.map((_,i)=>qs_(T,i).s))],i:0,a:Array(n).fill(null),st:Array(n).fill(0),sub:false,tm:Array(n).fill(0),cq:null,t0:Date.now(),end:Date.now()+T.mins*60000,gd:2,vio:0};
 const P=await progLoad(id);
 if(P&&Array.isArray(P.a)&&P.a.length===n&&Number(P.end)>0){
  X.a=P.a.slice();
  X.st=Array.isArray(P.st)&&P.st.length===n?P.st.slice():X.a.map(v=>v==null?0:2);
  X.tm=Array.isArray(P.tm)&&P.tm.length===n?P.tm.map(v=>+v||0):X.tm;
  X.i=Math.max(0,Math.min(n-1,+P.i||0));
  X.end=+P.end;X.vio=+P.vio||0;
  stemToast('Your saved answers have been restored.');
 }else progSave(true);
 go(X.i);
 timerId=setInterval(()=>{const e=$('tm');if(e)e.textContent=tm();if(Date.now()>=X.end)submitT()},1000);
 if(Date.now()>=X.end||(X.vio||0)>=VIO_MAX)submitT();
}
/* ---- save progress (every answer is saved when the student clicks Save & Next) ---- */
function stemToast(m,bad){
 let e=document.getElementById('stt');
 if(!e){e=document.createElement('div');e.id='stt';e.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;padding:9px 16px;border-radius:20px;font:600 14px system-ui,sans-serif;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:90%;text-align:center;pointer-events:none';document.body.appendChild(e)}
 e.style.background=bad?'#bd3540':'#147a52';e.textContent=m;e.style.display='block';
 clearTimeout(e._t);e._t=setTimeout(()=>{e.style.display='none'},bad?5000:1600);
}
const progKey=id=>'stemprog_'+me.uid+'_'+id;
async function progLoad(id){
 let L=null,F=null;
 try{L=JSON.parse(localStorage.getItem(progKey(id))||'null')}catch(e){}
 try{const d=await db.collection('progress').doc(me.uid+'_'+id).get();if(d.exists)F=d.data()}catch(e){}
 const ok=p=>p&&Array.isArray(p.a)&&p.end;
 if(ok(L)&&ok(F))return (L.upd||0)>(F.upd||0)?L:F;
 return ok(F)?F:ok(L)?L:null;
}
function progSave(quiet){
 if(!X||X.sub||!X.id)return;
 const id=X.id,d={uid:me.uid,testId:id,a:X.a.slice(),st:X.st.slice(),tm:X.tm.map(v=>Math.round(v)),i:X.i,end:X.end,vio:X.vio||0,upd:Date.now()};
 try{localStorage.setItem(progKey(id),JSON.stringify(d))}catch(e){}
 X.pw=(X.pw||Promise.resolve()).then(()=>X.sub?null:db.collection('progress').doc(me.uid+'_'+id).set(d))
  .then(()=>{if(!quiet)stemToast('Answer saved \u2713')})
  .catch(()=>{if(!quiet)stemToast('Saved on this phone, but not on the server. Check your internet; it will retry on the next save.',true)});
}
async function progDel(id){
 try{localStorage.removeItem(progKey(id))}catch(e){}
 try{await db.collection('progress').doc(me.uid+'_'+id).delete()}catch(e){}
}
function go(i){tmFlush();if(X)X.pd=null;X.i=Math.max(0,Math.min(X.n-1,i));X.cq=X.i;if(X.st[X.i]===0)X.st[X.i]=1;draw()}
function cur(){
 const q=qs_(X.T,X.i);
 if(q.t==='num'){const v=$('nv').value.trim();return v===''||isNaN(v)?null:+v}
 const c=document.querySelector('input[name=o]:checked');return c?+c.value:null;
}
function act(k){
 const i=X.i;
 if(k===1){X.a[i]=cur();X.st[i]=X.a[i]==null?1:2}
 else if(k===2){X.a[i]=cur();X.st[i]=X.a[i]==null?3:4}
 else if(k===3){X.a[i]=null;X.st[i]=3}
 else{X.a[i]=null;X.st[i]=1;draw();progSave();return}
 go(i+1);
 progSave();
}
function sv(d){const e=$(d?'qb':'qc');if(e)e.scrollIntoView({behavior:'smooth',block:d?'end':'start'})}
function tp(){X.pc=!X.pc;const g=document.querySelector('.g'),b=$('tg');if(g)g.classList.toggle('pc',X.pc);if(b)b.innerHTML=X.pc?'&lt;':'&gt;'}
function draw(){
 const {T,i}=X,q=qs_(T,i),sec=q.s,idx=T.qs.map((_,k)=>k).filter(k=>qs_(T,k).s===sec),a=(X.pd&&X.pd.i===i)?X.pd.v:X.a[i],c=[0,0,0,0,0];
 idx.forEach(k=>c[X.st[k]]++);
 app.innerHTML=`<div class="th"><div class="av"${PHOTO?` style="background:url(${PHOTO}) center/cover no-repeat"`:''}></div><div class="inf"><div class="ir"><span>Candidate Name</span><span>: <b>${esc(WM.split(' • ')[0])}</b></span></div><div class="ir"><span>Exam Name</span><span>: <b>${esc(T.title)}</b></span></div><div class="ir"><span>Subject Name</span><span>: <b>${esc(sec)}</b></span></div><div class="ir"><span>Remaining Time</span><span>: <b class="tm" id="tm">${tm()}</b></span></div></div></div>
 <div class="tabs">${X.secs.map(s=>`<button class="${s===sec?'on':''}" onclick="go(${T.qs.findIndex((_,k)=>qs_(T,k).s===s)})">${esc(s)}</button>`).join('')}</div>
 <div class="g${X.pc?' pc':''}"><div class="card qc" id="qc"><button class="tgl" id="tg" onclick="tp()" title="Question palette">${X.pc?'&lt;':'&gt;'}</button><div class="qh"><span>Question ${idx.indexOf(i)+1}:</span><span class="mk">+${T.pos??4} / −${q.t==='num'?(T.nn||0):T.neg??1}</span>${lgBtn(q)}<button class="nv" onclick="sv(1)">&darr;</button></div><p class="qt">${rich(qL(q))}</p>${qimg(q)}`+
 (q.t==='num'?`<input id="nv" inputmode="decimal" placeholder="Type your numerical answer" value="${a??''}">`:oL(q).map((o,j)=>`<label class="opt"><input type="radio" name="o" value="${j}" ${a===j?'checked':''}><span class="ot">${rich(o)}</span></label>`).join(''))+
 `<div class="nvr"><button class="nv" onclick="sv(0)">&uarr;</button></div>
 <div class="tb" id="qb"><button class="b1" onclick="act(1)">Save &amp; Next</button><button class="b2" onclick="act(4)">Clear Response</button><button class="b3" onclick="act(2)">Save &amp; Mark for Review</button><button class="b4" onclick="act(3)">Mark for Review &amp; Next</button></div>
 <div class="nbar"><div class="nl"><button class="nb" onclick="go(X.i-1)">&lt;&lt; Back</button><button class="nb" onclick="go(X.i+1)">Next &gt;&gt;</button></div><button class="sb" onclick="submitT(1)">Submit test</button></div></div>
 <div class="card pal"><div class="lgb"><div><span class="sy sy0">${c[0]}</span>Not Visited</div><div><span class="sy sy1">${c[1]}</span>Not Answered</div><div><span class="sy sy2">${c[2]}</span>Answered</div><div><span class="sy sy3">${c[3]}</span>Marked for Review</div><div class="w"><span class="sy sy4">${c[4]}</span>Answered &amp; Marked for Review (will be considered for evaluation)</div></div>
 <div class="pg">${idx.map((k,m)=>`<button class="s${X.st[k]} ${k===i?'cur':''}" onclick="go(${k})">${String(m+1).padStart(2,'0')}</button>`).join('')}</div></div></div>`;
}
async function submitT(ask){
 if(X.sub)return;const c=[0,0,0,0,0];X.st.forEach(v=>c[v]++);
 if(ask&&!confirm('Answered: '+(c[2]+c[4])+'\nNot answered: '+(c[1]+c[3])+'\nNot visited: '+c[0]+'\n\nSubmit the test now?'))return;
 tmFlush();X.sub=true;clearInterval(timerId);try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}
 try{try{await X.pw}catch(e){}await saveResult();await saveMist();const sid=X.id,gd=X.gd||0;await progDel(sid);window.__holdRev=Date.now()+7000;if(gd){try{history.go(-gd)}catch(e){}}$('bar').innerHTML=barHtml();try{await review(sid,2)}catch(re){app.innerHTML='<div class="card"><b class="ok">Your test is submitted.</b><br><small>'+esc(re.message||re)+'</small><button onclick="review(\''+sid+'\',2)">Open my result</button></div>'}
  [1200,3200].forEach(ms=>setTimeout(()=>{if(window.__holdRev&&Date.now()<window.__holdRev&&!app.querySelector('#rv1')&&!app.classList.contains('nt'))review(sid,2).catch(()=>{})},ms))}
 catch(e){alert('Could not submit: '+e.message);X.sub=false}
}
async function review(id,tab){window.REVID=id;
 wmOff();
 const [t,k,r,om]=await Promise.all([db.collection('tests').doc(id).get(),db.collection('keys').doc(id).get(),db.collection('results').doc(me.uid+'_'+id).get(),db.collection('omrimg').doc(me.uid+'_'+id).get().catch(()=>null)]);
 const T=t.data();if(!T.qs)T.qs=(await db.collection('qbank').doc(id).get()).data().qs;await loadImgs(T);const K=k.data().ans,A=r.data().a,R=score(T,K,A);
 const hasOmr=!!(r.data().omr||(om&&om.exists&&om.data().d)),tot=(R.ok+R.bad+R.un)||1,pc=v=>(v*100/tot).toFixed(1);
 app.innerHTML=`<div class="card rhero"><h3>${esc(T.title)}</h3><h2>Score: <b>${R.sc}</b> / ${T.qs.length*(T.pos??4)}</h2>
 <div class="rst"><div class="t-ok"><b>${R.ok}</b>Correct</div><div class="t-bad"><b>${R.bad}</b>Wrong</div><div class="t-un"><b>${R.un}</b>Not attempted</div></div>
 <div class="rbar"><i class="g1" style="width:${pc(R.ok)}%"></i><i class="g2" style="width:${pc(R.bad)}%"></i><i class="g3" style="width:${pc(R.un)}%"></i></div>
 <div class="rsec">`+Object.entries(R.sec).map(([s,v])=>`<span>${esc(s)}: <b>${v}</b></span>`).join('')+'</div></div>'+(T.qs.some(q=>q.qh)?lgBtn({qh:1}):'')+revTabs(hasOmr)+'<div id="rv1">'+
  T.qs.map((_,i)=>{const q=qs_(T,i),a=A[i],un=unans(a,q.t),ok=!un&&(q.t==='num'?Math.abs(a-K[i])<0.01:a===K[i]),sh=v=>q.t==='num'?v:rich(oL(q)[v]),st=un?'un':ok?'ok':'bad',qx=rich(qL(q)).replace(new RegExp('^\\s*'+(i+1)+'[.)]\\s+'),'');
  return `<div class="card rq rq-${st}"><div class="rqh"><span class="rqn">${i+1}</span><b class="qt">${qx}</b></div><div class="rqm"><small>(${esc(q.s)})</small><span class="rqb">${un?'Not attempted':ok?'Correct':'Wrong'}</span></div>${qimg(q)}<div class="ra ra-${st}"><small>Your answer:</small><span class="${ok?'ok':'bad'}">${un?'Not attempted':a===9?'More than one option marked':sh(a)}</span></div>`+(ok?'':`<div class="ra ra-ok"><small>Correct answer:</small><span class="ok">${sh(K[i])}</span></div>`)+'</div>'}).join('')+'</div>'+(hasOmr?'<div id="rv3" style="display:none">'+omrTab(T,K,A,om)+'</div>':'')+'<div id="rv2" style="display:none">'+anaCard(T,K,A,R)+topicCard(topicStats(T.tp,K,A),'Your strong and weak topics in this test')+timeCard(T,K,A,r.data().tm)+'</div>'+
 '<button class="s" onclick="studentView()">Back to tests</button>';
 if(tab===2)revTab(2);
 {const bk=$('bk');if(bk){bk.style.display='';bk.onclick=function(){studentView()}}}
}


/* ---------- TEACHER ---------- */
async function loadPN(){try{const s=await db.collection('series').get();s.forEach(d=>{PN[d.id]=pnName(d.data());SEX[d.id]=examOf({k:d.id,...d.data()})})}catch(e){}}
const TGROUPS=[['Administrative',[['s','Admission of student'],['a','Attendance'],['p','Fees'],['u','Staff'],['x','Referrals']]],['Test',[['t','New test'],['m','Tests'],['r','Results'],['k','Class tests'],['o','OMR'],['v','Series'],['d','Schedule'],['y','Daily quiz'],['w','Weekly winners']]],['Miscellaneous',[['b','Backup'],['c','Coupons'],['q','Reset requests'],['h','Home page']]]];
const TAB_PERM={s:'admission',p:'admission',a:'attendance',t:'tests',m:'tests',r:'tests',k:'tests',o:'tests',d:'tests'};
const tabOk=t=>me&&(me.email===TEACHER||(STAFF&&TAB_PERM[t]&&(STAFF.perms||[]).includes(TAB_PERM[t])));
const TIC={s:'&#127891;',a:'&#128467;',p:'&#128179;',u:'&#128101;',x:'&#127873;',t:'&#10133;',m:'&#128203;',r:'&#128202;',k:'&#127979;',o:'&#128290;',v:'&#127919;',d:'&#128197;',y:'&#9889;',w:'&#127942;',h:'&#127968;',c:'&#127903;',b:'&#128190;',q:'&#128273;'};
function teacherHero(tab,G){let gn='',tt='';G.forEach((g,k)=>g[1].forEach(x=>{if(x[0]===tab){tt=x[1];gn=g[0]}}));const col=gn==='Administrative'?'#1c6fe6,#0d3f9e':gn==='Test'?'#8a4cf5,#5025b8':'#1fa56a,#0e6b43';return `<div class="phero"><span class="phi" style="background:linear-gradient(135deg,${col})">${TIC[tab]||'&#128214;'}</span><div class="pht"><b>${esc(tt)}</b><small>${esc(gn)}</small></div><button type="button" class="phb" onclick="teacherView()">&#8249; Home</button></div>`}
async function teacherView(tab){
 await loadPN();
 const G=TGROUPS.map(g=>[g[0],g[1].filter(x=>tabOk(x[0]))]).filter(g=>g[1].length);
 if(!G.length){app.innerHTML='<div class="card">Your account has no access yet. Please contact the institute.</div>';return}
 if(!tab||!tabOk(tab))tab=(me.email===TEACHER&&!tab)?'r':G[0][1][0][0];
 const gi=Math.max(0,G.findIndex(g=>g[1].some(x=>x[0]===tab)));
 app.innerHTML=(STAFF?'<div class="card"><b>'+esc(STAFF.name||'Staff')+'</b> <small>(staff login)</small></div>':'')+'<div id="regb"></div>'+teacherHero(tab,G)+'<div id="tv"></div>';
 ({u:staffTab,k:ctView,o:omrView,a:attView,b:backupView,p:payView,s:addStudent,t:newTest,m:testsView,h:homeView,r:results,q:resetReqs,v:seriesView,d:schedAdmin,c:couponsView,y:quizAdmin,w:winAdmin,x:refAdmin})[tab]();
 regBanner();regWatch();
}
/* ---------- NEW REGISTRATION ALERT (teacher and front desk) ---------- */
const regMs=x=>x&&x.at&&x.at.toMillis?x.at.toMillis():0;
const regKey=()=>'stem_reg_seen_'+(me?me.uid:'');
function regStore(){try{localStorage.setItem(regKey(),String(REGSEEN))}catch(e){}}
function regBeep(){
 try{const C=window.AudioContext||window.webkitAudioContext,a=new C(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.15;o.start();setTimeout(()=>{o.frequency.value=1175},170);setTimeout(()=>{o.stop();a.close()},380)}catch(e){}
 try{if(navigator.vibrate)navigator.vibrate([200,100,200])}catch(e){}
}
function regAlert(L){
 regBeep();
 try{if(window.Notification&&Notification.permission==='granted')new Notification(L.length>1?L.length+' new students registered':'New student registered',{body:L.slice(0,3).map(x=>(x.name||'?')+(x.cls?' (Class '+x.cls+')':'')).join(', ')})}catch(e){}
}
function regAllow(){try{Notification.requestPermission().then(()=>{regBanner();regCard()})}catch(e){}}
function regBanner(){
 document.querySelectorAll('[data-rb]').forEach(e=>{e.textContent=e.dataset.rb+(NEWREG.length?' ('+NEWREG.length+' new)':'')});
 const b=$('regb');if(!b)return;
 b.innerHTML=NEWREG.length?'<div class="card"><b>🔔 '+NEWREG.length+(NEWREG.length>1?' new students have':' new student has')+' registered</b><br><small>'+NEWREG.slice(0,3).map(x=>esc(x.name||'?')+(x.cls?' (Class '+esc(x.cls)+')':'')).join(', ')+(NEWREG.length>3?' and more':'')+'</small><div class="btns"><button class="s" onclick="teacherView(\'s\')">View</button><button class="s" onclick="regSeen()">Mark as seen</button></div></div>':'';
}
function regCard(){
 const el=$('nr');if(!el)return;
 const L=REGALL.slice().sort((a,b)=>regMs(b)-regMs(a)).slice(0,10);
 el.innerHTML=L.length?'<div class="card"><h3>New registrations (students who signed up themselves)</h3>'+L.map(x=>'<div style="margin:6px 0">'+(regMs(x)>REGSEEN?'<span class="bad"><b>NEW</b></span> ':'')+esc(x.name||'?')+' <small>(Class '+esc(x.cls||'-')+', mobile '+esc(x.mobile||x.roll||'')+(regMs(x)?', '+new Date(regMs(x)).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'')+')</small></div>').join('')+'<div class="btns">'+(NEWREG.length?'<button class="s" onclick="regSeen()">Mark all as seen</button>':'')+(window.Notification&&Notification.permission==='default'?'<button class="s" onclick="regAllow()">Allow sound and alerts</button>':'')+'</div><small>Shows the latest 10. You get an alert here while this site is open on your phone or computer.</small></div>':'';
}
function regSeen(){
 REGSEEN=Math.max(REGSEEN,...REGALL.map(regMs));regStore();NEWREG=[];regBanner();regCard();
}
function regWatch(){
 if(REGUN||!me||!tabOk('s'))return;
 REGSEEN=0;try{REGSEEN=+localStorage.getItem(regKey())||0}catch(e){}
 REGFIRST=true;
 REGUN=db.collection('students').where('self','==',true).onSnapshot(s=>{
  REGALL=s.docs.map(d=>({id:d.id,...d.data()}));
  if(!REGSEEN){REGSEEN=REGALL.reduce((m,x)=>Math.max(m,regMs(x)),1);regStore()}
  NEWREG=REGALL.filter(x=>regMs(x)>REGSEEN).sort((a,b)=>regMs(b)-regMs(a));
  if(!REGFIRST){const fresh=s.docChanges().filter(c=>c.type==='added'&&regMs(c.doc.data())>REGSEEN).map(c=>c.doc.data());if(fresh.length)regAlert(fresh)}
  REGFIRST=false;regBanner();regCard();
 },()=>{});
}
/* ---------- STAFF (teacher gives limited powers) ---------- */
let SL=[];
const staffBoxes=(cls,perms)=>'<label class="opt"><input type="checkbox" class="'+cls+'" value="attendance"'+(perms.includes('attendance')?' checked':'')+'>Can mark attendance only</label><label class="opt"><input type="checkbox" class="'+cls+'" value="admission"'+(perms.includes('admission')?' checked':'')+'>Front Desk: can admit students and receive fees (makes fee receipts)</label><label class="opt"><input type="checkbox" class="'+cls+'" value="tests"'+(perms.includes('tests')?' checked':'')+'>Can make tests and related work (new test, edit paper, answer key and paper PDF, results, class tests, OMR)</label>';
const staffAccess=p=>(p||[]).map(x=>x==='attendance'?'Attendance':x==='admission'?'Front Desk (admission and fees)':x==='tests'?'Tests and related work':x).join(', ')||'None';
async function staffTab(msg){
 $('tv').innerHTML='Loading…';
 try{
  const s=await db.collection('staff').get();
  SL=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  $('tv').innerHTML=`<div class="card"><h3>Add staff</h3><small>Staff log in on the same login page with the Login ID and password you create here. You decide what each person can do, and you can change or remove access at any time.</small><input id="fn2" placeholder="Staff name"><input id="fl" placeholder="Login ID (must start with staff, for example staffrahul)" autocapitalize="off"><input id="fpw" placeholder="Password (at least 6 characters)">${staffBoxes('fp',[])}<button id="fadd">Create staff login</button><p id="fm">${msg?esc(msg):''}</p></div>`+
   '<h3>Staff ('+SL.length+')</h3>'+(SL.map(x=>`<div class="card"><b>${esc(x.name||'')}</b><br><small>Login ID: ${esc(x.login||'')}<br>Access: ${esc(staffAccess(x.perms))}</small><div class="btns"><button class="s" onclick="staffEdit('${x.id}')">Change access</button><button class="s" onclick="staffDel('${x.id}')">Remove staff</button></div><div id="se${x.id}"></div></div>`).join('')||'<p>No staff yet.</p>');
  $('fadd').onclick=async()=>{
   const name=$('fn2').value.trim(),id=$('fl').value.trim().toLowerCase(),pw=$('fpw').value,perms=[...document.querySelectorAll('.fp:checked')].map(x=>x.value),m=$('fm');
   m.className='bad';
   if(name.length<2||!/^staff[a-z0-9]+$/.test(id)||pw.length<6||!perms.length)return m.textContent='Enter the name, a Login ID that starts with staff (letters and numbers only), a password of at least 6 characters, and tick at least one access.';
   $('fadd').disabled=true;m.className='';m.textContent='Creating…';
   const sec=firebase.apps.find(a=>a.name==='sec')||firebase.initializeApp(cfg,'sec');
   try{
    let cr;
    try{cr=await sec.auth().createUserWithEmailAndPassword(id+DOM,pw)}
    catch(e){if(e.code!=='auth/email-already-in-use')throw e;try{cr=await sec.auth().signInWithEmailAndPassword(id+DOM,pw)}catch(e2){throw{message:'This Login ID is already used. Please choose another ID.'}}}
    await db.collection('staff').doc(cr.user.uid).set({name,login:id,perms,at:firebase.firestore.FieldValue.serverTimestamp()});
    await sec.auth().signOut();
    staffTab('Created. Login ID: '+id+', password: '+pw);
   }catch(e){$('fadd').disabled=false;m.className='bad';m.textContent=e.message||e.code}
  };
 }catch(e){$('tv').innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
function staffEdit(id){const x=SL.find(z=>z.id===id)||{};$('se'+id).innerHTML=staffBoxes('fq'+id,x.perms||[])+`<button onclick="staffSave('${id}')">Save access</button>`}
async function staffSave(id){
 const perms=[...document.querySelectorAll('.fq'+id+':checked')].map(x=>x.value);
 if(!perms.length)return alert('Tick at least one access, or use Remove staff.');
 try{await db.collection('staff').doc(id).update({perms});staffTab('Access updated.')}catch(e){alert(e.message)}
}
async function staffDel(id){
 const x=SL.find(z=>z.id===id)||{};
 if(!confirm('Remove '+(x.name||'this staff member')+'? They will lose all access immediately.'))return;
 try{await db.collection('staff').doc(id).delete();staffTab('Staff removed.')}catch(e){alert(e.message)}
}
async function homeView(){
 $('tv').innerHTML='Loading…';
 let x={};
 try{const d=await db.collection('site').doc('home').get();x=d.exists?d.data():{}}
 catch(e){$('tv').innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>';return}
 const L=(k,f)=>(x[k]||[]).map((v,i)=>`<div class="card ar"><span>${f(v)}</span><button class="s" onclick="homeDel('${k}',${i})">Delete</button></div>`).join('')||'<p><small>Nothing added yet.</small></p>';
 $('tv').innerHTML=`<div class="card"><h3>Home page: notice board</h3><input id="hn1" placeholder="Notice (for example: New NEET batch starts on 1 December)"><button onclick="homeNotice()">Add notice</button>${L('notices',v=>'<b>'+esc(v.t)+'</b> <small>'+esc(v.d||'')+'</small>')}</div>
 <div class="card"><h3>Home page: toppers</h3><input id="ht1" placeholder="Student name"><input id="ht2" placeholder="Result (for example: NEET 2026 score 620)"><input id="ht3" type="file" accept="image/*"><small>Photo is optional.</small><button onclick="homeTopper()">Add topper</button>${L('toppers',v=>'<b>'+esc(v.n)+'</b> <small>'+esc(v.r||'')+'</small>')}</div>
 <div class="card"><h3>Home page: student reviews</h3><input id="hr1" placeholder="Student or parent name"><textarea id="hr2" placeholder="Review"></textarea><button onclick="homeReview()">Add review</button>${L('reviews',v=>'<b>'+esc(v.n)+'</b> <small>'+esc(v.t)+'</small>')}</div>
 <div class="card"><h3>Home page: study material</h3><input id="hm1" placeholder="Title (for example: Class 12 Physics notes)"><input id="hm2" placeholder="Link (Google Drive or any web link starting with https://)"><button onclick="homeMaterial()">Add material</button>${L('materials',v=>'<b>'+esc(v.t)+'</b> <small>'+esc(v.u)+'</small>')}</div>`;
}
async function homeAdd(k,item){
 try{const r=db.collection('site').doc('home'),d=await r.get(),a=(d.exists&&d.data()[k])||[];a.push(item);await r.set({[k]:a},{merge:true});homeView()}
 catch(e){alert('Could not save: '+e.message)}
}
async function homeDel(k,i){
 if(!confirm('Delete this item from the home page?'))return;
 try{const r=db.collection('site').doc('home'),d=await r.get(),a=((d.exists&&d.data())||{})[k]||[];a.splice(i,1);await r.set({[k]:a},{merge:true});homeView()}
 catch(e){alert('Could not delete: '+e.message)}
}
function homeNotice(){const t=$('hn1').value.trim();if(!t)return alert('Please type the notice.');homeAdd('notices',{t,d:new Date().toLocaleDateString('en-IN',{dateStyle:'medium'})})}
async function homeTopper(){
 const n=$('ht1').value.trim(),r=$('ht2').value.trim(),f=$('ht3').files[0];
 if(!n)return alert('Please type the student name.');
 let img='';if(f){try{img=await fileToData(f,240,300,.75)}catch(e){return alert(e.message)}}
 homeAdd('toppers',{n,r,img});
}
function homeReview(){const n=$('hr1').value.trim(),t=$('hr2').value.trim();if(!n||!t)return alert('Please type the name and the review.');homeAdd('reviews',{n,t})}
function homeMaterial(){const t=$('hm1').value.trim(),u=$('hm2').value.trim();if(!t)return alert('Please type the title.');if(!/^https?:\/\//i.test(u))return alert('The link must start with https://');homeAdd('materials',{t,u})}
function addStudent(){
 $('tv').innerHTML='<div class="card"><h3>Admission of student</h3><input id="n" placeholder="Student name"><input id="r" placeholder="Roll number (letters and numbers only)"><select id="c" onchange="$(\'dkw\').style.display=this.value===\'Dropper\'?\'\':\'none\'"><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>Dropper</option></select><label class="opt" id="dkw" style="display:none"><input type="checkbox" id="dao">Dropper: take class attendance (off by default)</label><input id="pw" placeholder="Password (at least 6 characters)"><p><b>Tests this student can take:</b></p><label class="opt"><input type="checkbox" id="nt">No tests for now (profile and attendance only)</label><label class="opt"><input type="checkbox" id="to">Test series only (no class attendance)</label><div id="plbox"></div><button id="add">Create student login</button><p id="m"></p></div><div id="nr"></div><div id="sl"></div>';
 $('plbox').innerHTML=serPickerHtml('new',[]);serFill('new');serChips('new');listStudents();regCard();
 $('add').onclick=async()=>{
  const roll=$('r').value.trim().toLowerCase(),name=$('n').value.trim();
  if(!/^[a-z0-9]+$/.test(roll)||$('pw').value.length<6||!name)return $('m').textContent='Fill every field correctly.';
  const sec=firebase.apps.find(a=>a.name==='sec')||firebase.initializeApp(cfg,'sec');
  try{
   if(!(await db.collection('students').where('roll','==',roll).get()).empty)return $('m').textContent='A student with this number already exists.';
   let cr=null;
   for(let k=1;k<=4&&!cr;k++){try{cr=await sec.auth().createUserWithEmailAndPassword(roll+(k>1?'.'+k:'')+DOM,$('pw').value)}catch(e){if(e.code!=='auth/email-already-in-use')throw e}}
   if(!cr)throw{message:'This number was used too many times. Delete its old login in Firebase Authentication first.'};
   const nt=$('nt').checked;await db.collection('students').doc(cr.user.uid).set({name,roll,cls:$('c').value.trim(),plans:nt?[]:[...SP['new']],notests:nt,testOnly:$('to').checked,...($('c').value==='Dropper'&&$('dao').checked?{attOn:true}:{})});
   await sec.auth().signOut();
   $('m').textContent='Created. Roll no: '+roll+', password: '+$('pw').value;listStudents();
  }catch(e){$('m').textContent=e.code==='auth/email-already-in-use'?'This roll number already exists.':e.message}
 };
}
const P={neet:{n:{Physics:45,Chemistry:45,Biology:90},m:180},bio:{n:{Biology:90},m:90},phy:{n:{Physics:45},m:45},chem:{n:{Chemistry:45},m:45}};
function norm(pat,qs){const p=P[pat];if(p)qs.forEach(x=>{const m=Object.keys(p.n).find(k=>k.toLowerCase()===x.s.toLowerCase());if(m)x.s=m})}
function chk(pat,qs){const p=P[pat];if(!p)return '';
 if(qs.some(x=>x.t==='num'))return 'NEET tests have multiple-choice questions only.';
 const c={};qs.forEach(x=>c[x.s]=(c[x.s]||0)+1);
 for(const [k,n] of Object.entries(p.n))if((c[k]||0)!==n)return k+' has '+(c[k]||0)+' questions but needs '+n+'.';
 return Object.keys(c).length!==Object.keys(p.n).length?'Use only these subject names: '+Object.keys(p.n).join(', ')+'.':'';}
function parseQ(txt,sec='General'){
 const qs=[],ans=[];
 for(const blk of txt.split(/\n\s*\n/)){
  const L=blk.trim().split('\n').map(x=>x.trim()).filter(Boolean);if(!L.length)continue;
  const sl=L.find(l=>/^SEC/i.test(l));if(sl)sec=sl.replace(/^SEC[:\s]*/i,'').trim()||sec;
  const ql=L.find(l=>/^Q/i.test(l));if(!ql)continue;
  const ex=[];for(let z=L.indexOf(ql)+1;z<L.length;z++){const l=L[z];if(/^[A-D]\)/i.test(l))break;if(/^(ANS|NUM|SEC|IMG|QH)[:\s]/i.test(l))continue;ex.push(l)}
  const q=[ql.replace(/^Q[:.]?\s*/i,''),...ex].join('\n'),il=L.find(l=>/^IMG[:\s]/i.test(l)),img=il?il.replace(/^IMG[:\s]*/i,'').trim():'',im=img?{img}:{},nl=L.find(l=>/^NUM[:\s]/i.test(l));const hx={},qhl=L.find(l=>/^QH[:\s]/i.test(l)),hoo=L.filter(l=>/^H[A-D]\)/i.test(l)).map(l=>l.slice(3).trim());if(qhl)hx.qh=qhl.replace(/^QH[:\s]*/i,'').trim();if(hoo.length)hx.oh=hoo;
  if(nl){const v=parseFloat(nl.replace(/^NUM[:\s]*/i,''));if(isNaN(v))return{err:'Check the NUM line in: '+q};qs.push({q,s:sec,t:'num',...im,...hx});ans.push(v);continue}
  const o=L.filter(l=>/^[A-D]\)/i.test(l)).map(l=>l.slice(2).trim()),an=L.find(l=>/^ANS[:\s]/i.test(l)),k=an?'ABCD'.indexOf(an.replace(/^ANS[:\s]*/i,'').trim().charAt(0).toUpperCase()):-1;
  if(o.length<2||k<0||k>=o.length)return{err:'Check this question: '+q};
  qs.push({q,o,s:sec,t:'mcq',...im,...hx});ans.push(k);
 }
 return{qs,ans};
}
function pickImg(taId,msgId){
 const f=document.createElement('input');f.type='file';f.accept='image/*';
 f.onchange=async()=>{
  const m=$(msgId),ta=$(taId),file=f.files[0];if(!file)return;
  m.className='';m.textContent='Adding image…';
  try{
   const u=URL.createObjectURL(file),im=new Image();
   await new Promise((ok,no)=>{im.onload=ok;im.onerror=no;im.src=u});
   let w=im.naturalWidth,h=im.naturalHeight;if(w>900){h=Math.round(h*900/w);w=900}
   const c=document.createElement('canvas');c.width=w;c.height=h;
   const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(im,0,0,w,h);URL.revokeObjectURL(u);
   let ql=.8,d=c.toDataURL('image/jpeg',ql);
   while(d.length>600000&&ql>.3){ql-=.1;d=c.toDataURL('image/jpeg',ql)}
   if(d.length>900000)throw new Error('This image is too large. Please crop it and try again.');
   const ref=db.collection('qimg').doc();await ref.set({d});
   const p=ta.selectionStart??ta.value.length,v=ta.value,pre=v.slice(0,p),post=v.slice(p);
   ta.value=pre+(pre&&!pre.endsWith('\n')?'\n':'')+'IMG: '+ref.id+(post.startsWith('\n')?'':'\n')+post;
   m.className='';m.textContent='Image added as the line IMG: '+ref.id+'. Keep this line inside its question.';
  }catch(e){m.className='bad';m.textContent='Could not add the image: '+e.message}
 };
 f.click();
}
async function newTestFor(k){window.NEWPAT=k;await teacherView('t')}
function newTest(){
 $('tv').innerHTML=`<div class="card"><h3>New mock test</h3><select id="pt"><option value="custom">Custom test</option><option value="neet">Full NEET (Physics 45, Chemistry 45, Biology 90)</option><option value="bio">Biology only (90 questions)</option><option value="phy">Physics only (45 questions)</option><option value="chem">Chemistry only (45 questions)</option></select><small id="ph"></small><select id="fm"><option value="">Exam style: NEET / school (numerical has no negative marking)</option><option value="neetc">NEET style test (any number of questions, +4 / −1, multiple choice only)</option><option value="jee">JEE Main full paper (NTA pattern, 75 questions, 3 hours)</option><option value="jeec">JEE Main style test (any number of questions, numerical −1)</option></select><small id="fh"></small><input id="ti" placeholder="Test title"><input id="cl" placeholder="Class (leave blank for all)"><input id="mi" type="number" placeholder="Time in minutes"><div class="row"><input id="pm" type="number" value="4"><input id="nm" type="number" value="1"></div><small>Left box: marks for a correct answer. Right box: marks lost for a wrong multiple-choice answer.</small>${FB('qt')}<textarea id="qt" rows="12" placeholder="SEC: Physics\nQ: Question text\nA) option 1\nB) option 2\nC) option 3\nD) option 4\nANS: B\n\nQ: A numerical question\nNUM: 24"></textarea><button class="s" onclick="pickImg('qt','m')">Add image to a question</button><small>For statements or assertion and reason, just type them on new lines under the Q: line, with no blank line inside the question. For a picture, tap at the end of the question text and press Add image.</small><button id="sv">Save as draft</button><p id="m"></p><small>The test is saved as a draft that students cannot see. Open the Tests tab to add more questions, set the go-live time and publish.</small></div>`;
 db.collection('series').get().then(ss=>{const sel=$('pt');if(sel)ss.forEach(d=>{const o=sel.querySelector('option[value="'+d.id+'"]');if(P[d.id]){if(o)o.textContent=pnName(d.data())+' ('+Object.entries(P[d.id].n).map(([k,c])=>c+' '+k).join(', ')+')'}else if(!o)sel.add(new Option('Series: '+pnName(d.data()),d.id))});applyPre()}).catch(()=>{});
 $('fm').onchange=()=>{const v=$('fm').value;if(v){$('pm').value=4;$('nm').value=1}if(v==='jee')$('mi').value=180;$('fh').textContent=v==='jee'?'NTA JEE Main (Paper 1): Physics, Chemistry and Mathematics, each with 20 multiple-choice questions (Section A) and 5 numerical questions (Section B), all compulsory. +4 for correct, −1 for wrong in BOTH sections, 0 if unanswered. Total 75 questions, 300 marks, 3 hours. Write the subjects as SEC: Physics, SEC: Chemistry, SEC: Mathematics, and the numerical ones as NUM: answer.':v==='jeec'?'Marks +4 / −1 for multiple-choice and −1 for a wrong numerical answer. Any number of questions.':v==='neetc'?'NEET style: +4 for a correct answer, −1 for a wrong one, multiple-choice questions only, any number of questions. Write the subjects as SEC: Physics, SEC: Chemistry, SEC: Biology.':''};
 $('pt').onchange=()=>{const p=P[$('pt').value];if(p){$('mi').value=p.m;$('pm').value=4;$('nm').value=1;$('ph').textContent='Needs '+Object.entries(p.n).map(([k,c])=>c+' '+k).join(', ')+'. Write the subject names exactly like this in the SEC: lines. Multiple-choice only. Marks set to +4 and −1.'}else $('ph').textContent=''};
 const applyPre=()=>{const k=window.NEWPAT,sel=$('pt');if(!k||!sel)return;if(sel.querySelector('option[value="'+k+'"]')){sel.value=k;if(sel.onchange)sel.onchange();window.NEWPAT=''}};applyPre();
 $('sv').onclick=async()=>{
  const pat=$('pt').value,r=parseQ($('qt').value);if(r.err)return $('m').textContent=r.err;
  if(!$('ti').value.trim()||!+$('mi').value)return $('m').textContent='Add a title and the time in minutes.';
  norm(pat,r.qs);const fmv=$('fm').value;
  if(fmv==='jee'){
   const MAP={maths:'Mathematics',math:'Mathematics',mathematics:'Mathematics',physics:'Physics',chemistry:'Chemistry'};
   r.qs.forEach(x=>{const k=MAP[String(x.s||'').trim().toLowerCase()];if(k)x.s=k});
   const need={Physics:[20,5],Chemistry:[20,5],Mathematics:[20,5]},cnt={};
   r.qs.forEach(x=>{const c=cnt[x.s]=cnt[x.s]||[0,0];(x.t==='num'||!x.o?c[1]++:c[0]++)});
   for(const k of Object.keys(need)){const c=cnt[k]||[0,0];if(c[0]!==20||c[1]!==5)return $('m').textContent=k+' has '+c[0]+' multiple-choice and '+c[1]+' numerical questions, but the JEE Main paper needs 20 multiple-choice and 5 numerical.'}
   if(Object.keys(cnt).length!==3)return $('m').textContent='Use only the subjects Physics, Chemistry and Mathematics in the SEC: lines.';
  }
  if(fmv==='neetc'&&r.qs.some(x=>x.t==='num'))return $('m').textContent='NEET style tests have multiple-choice questions only.';
  const ref=db.collection('tests').doc();
  try{
   await ref.set({title:$('ti').value.trim(),cls:$('cl').value.trim(),mins:+$('mi').value,pos:+$('pm').value,neg:+$('nm').value,nn:(fmv==='jee'||fmv==='jeec')?1:0,fmt:fmv,pat,live:false,n:r.qs.length});
   await db.collection('qbank').doc(ref.id).set({qs:r.qs});
   await db.collection('keys').doc(ref.id).set({ans:r.ans});
   $('m').textContent='Draft saved with '+r.qs.length+' questions. Open the Tests tab to continue.';
  }catch(e){$('m').textContent=e.message}
 };
}
const OPEN=new Set();let DMO={};
async function setDemo(k,id,on){
 try{
  if(on){
   const t=await db.collection('tests').doc(id).get();
   if(!t.exists||t.data().live===false)return alert('Publish this test first. Only a published test can be the demo test.');
   await db.collection('demos').doc(k).set({testId:id});
  }else await db.collection('demos').doc(k).delete();
  testsView();
 }catch(e){alert(e.message)}
}
async function testsView(){
 $('tv').innerHTML='Loading…';
 const ts=await db.collection('tests').get(),dm=await db.collection('demos').get(),fmt=t=>t.toDate().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
 const G={};DMO={};dm.forEach(d=>DMO[d.id]=d.data().testId);
 ts.docs.forEach(d=>{const t=d.data(),k=t.pat||'custom';(G[k]=G[k]||[]).push(d)});
 Object.keys(PN).forEach(k=>{if(!G[k])G[k]=[]});
 const order=[...Object.keys(PN),'custom'],keys=Object.keys(G).sort((a,b)=>{const x=order.indexOf(a),y=order.indexOf(b);return(x<0?99:x)-(y<0?99:y)});
 $('tv').innerHTML=keys.map(k=>{
  const L=G[k].sort((a,b)=>String(a.data().title||'').localeCompare(String(b.data().title||''),undefined,{numeric:true})),
   dr=L.filter(d=>d.data().live===false).length,nm=k==='custom'?'Custom tests':(PN[k]||k),nd=k!=='custom'&&L.length>0&&!L.some(d=>DMO[k]===d.id);
  return `<details ${OPEN.has(k)?'open':''} ontoggle="this.open?OPEN.add('${k}'):OPEN.delete('${k}')"><summary><b>${esc(nm)}</b> — ${L.length} test${L.length==1?'':'s'} (${L.length-dr} published, ${dr} draft)${nd?' <span class="bad">— no demo test yet</span>':''}</summary>`+(k==='custom'?'':'<button class="s" onclick="newTestFor(\''+k+'\')">+ Add new test in this series</button>')+(L.length?'':'<p><small>No test in this series yet. Students who buy it will see tests here after you add and publish them.</small></p>')+L.map(d=>{
   const t=d.data(),p=P[t.pat],need=p?Object.values(p.n).reduce((a,b)=>a+b):0,n=t.qs?t.qs.length:t.n,draft=t.live===false,
    st=draft?'Draft':(t.start&&t.start.toMillis()>Date.now()?'Scheduled for '+fmt(t.start):'Published (live)');
   const isD=DMO[t.pat||'custom']===d.id,sk=t.pat||'custom';
   return `<div class="card"><b>${esc(t.title)}</b>${isD?' <span class="bo">DEMO TEST</span>':''}<br>${st} | ${n??'?'} questions${need?' of '+need:''}`+(sk==='custom'?'':(isD?`<br><button class="s" onclick="setDemo('${sk}','${d.id}',false)">Remove from demo</button>`:`<br><button class="s" onclick="setDemo('${sk}','${d.id}',true)">Make this the demo test of ${esc(PN[sk]||sk)}</button>`))+(t.qs?'':
    (draft?`<br><button class="s" onclick="addQ('${d.id}')">Add more questions</button><label>Go live at (leave blank for now):</label><input type="datetime-local" id="dt${d.id}"><button onclick="publish('${d.id}')">Publish</button><div id="aq${d.id}"></div>`
     :`<br><button class="s" onclick="unpub('${d.id}')">Make draft (to edit or add questions)</button>`))+`<br><button class="s" onclick="editTest('${d.id}')">Edit paper</button><button class="s" onclick="pdfPaper('${d.id}',this)">Question paper PDF</button><button class="s" onclick="pdfKey('${d.id}')">Answer key PDF</button><div id="tedit${d.id}"></div><button class="s" onclick="topicsEdit('${d.id}')">Topics for strength and weakness</button><div id="tp${d.id}"></div><br><button class="s" onclick="delT('${d.id}')">Delete test</button></div>`}).join('')+`</details>`}).join('')||'<p>No tests yet.</p>';
}
function addQ(id){$('aq'+id).innerHTML=`${FB('ax'+id)}<textarea id="ax${id}" rows="8" placeholder="Paste more questions here. Add a SEC: line if the subject changes."></textarea><button class="s" onclick="pickImg('ax${id}','am${id}')">Add image to a question</button><button onclick="saveQ('${id}')">Add these questions</button><p id="am${id}"></p>`}
async function saveQ(id){
 const m=$('am'+id),tr=db.collection('tests').doc(id);
 try{
  const [t,qb,k]=await Promise.all([tr.get(),db.collection('qbank').doc(id).get(),db.collection('keys').doc(id).get()]);
  const T=t.data(),qs=qb.data().qs,ans=k.data().ans;
  if(T.live!==false)return m.textContent='Tap Make draft first, then add questions.';
  const r=parseQ($('ax'+id).value,qs.length?qs[qs.length-1].s:'General');if(r.err)return m.textContent=r.err;
  norm(T.pat,r.qs);const Q=[...qs,...r.qs],A=[...ans,...r.ans];
  await db.collection('qbank').doc(id).set({qs:Q});await db.collection('keys').doc(id).set({ans:A});await tr.update({n:Q.length});
  m.textContent='Added. Total '+Q.length+' questions.';
 }catch(e){m.textContent=e.message}
}
async function publish(id){
 const tr=db.collection('tests').doc(id),v=$('dt'+id).value;
 try{
  const T=(await tr.get()).data(),Q=(await db.collection('qbank').doc(id).get()).data().qs;
  const e=!Q.length?'Add questions first.':chk(T.pat,Q);if(e)return alert(e);
  await tr.update({live:true,start:v?firebase.firestore.Timestamp.fromDate(new Date(v)):firebase.firestore.FieldValue.serverTimestamp()});
  testsView();
 }catch(e){alert(e.message)}
}
async function unpub(id){await db.collection('tests').doc(id).update({live:false});try{for(const d of (await db.collection('demos').where('testId','==',id).get()).docs)await d.ref.delete()}catch(e){}testsView()}

/* ---------- EDIT PAPER (draft or live) AND ANSWER KEY PDF ---------- */
async function editTest(id){
 const box=$('tedit'+id);if(box.innerHTML){box.innerHTML='';return}
 box.innerHTML='Loading…';
 try{
  const [t,qb,k]=await Promise.all([db.collection('tests').doc(id).get(),db.collection('qbank').doc(id).get(),db.collection('keys').doc(id).get()]);
  const T=t.data(),qs=T.qs||(qb.exists?qb.data().qs:[]),K=k.data().ans;let sec=null;
  const txt=qs.map((q,i)=>{const L=[];if(q.s!==sec){L.push('SEC: '+q.s);sec=q.s}
   const ql=String(q.q).split('\n');L.push('Q: '+ql[0],...ql.slice(1));if(q.qh)L.push('QH: '+q.qh);if(q.img)L.push('IMG: '+q.img);
   if(q.t==='num'||!q.o)L.push('NUM: '+K[i]);else{q.o.forEach((o,j)=>L.push('ABCD'[j]+') '+o));if(q.oh)q.oh.forEach((o,j)=>L.push('H'+'ABCD'[j]+') '+o));L.push('ANS: '+'ABCD'[K[i]])}
   return L.join('\n')}).join('\n\n');
  box.innerHTML=`<div class="card"><b>Edit paper</b>${T.live===false?'':'<br><small class="bad">This test is live. Students who already took it will see the corrected answers and marks. If you change the number of questions, old answer sheets may not match.</small>'}
<label>Title</label><input id="etl${id}" value="${esc(T.title||'')}"><label>Time in minutes</label><input id="emn${id}" type="number" value="${T.mins||''}"><label>Class (blank for all)</label><input id="ecl${id}" value="${esc(T.cls||'')}">
<b>Question paper cover (for the PDF)</b><input id="ecb${id}" value="${esc((T.cv||{}).badge||'')}" placeholder="Top badge, for example NEET UG 2027"><input id="ecs${id}" value="${esc((T.cv||{}).series||'')}" placeholder="Series name, for example REVISION TEST SERIES"><input id="ecj${id}" value="${esc((T.cv||{}).sub||'')}" placeholder="Line under title, for example Biology \u00b7 Class XI \u00b7 Unit-wise Test"><textarea id="ecu${id}" rows="3" placeholder="Syllabus covered, one per line: UNIT 3 | Cell: Structure and Function">${esc(((T.cv||{}).units||[]).map(u=>u.u+' | '+u.t).join('\n'))}</textarea>
<div class="row"><input id="epo${id}" type="number" value="${T.pos??4}"><input id="eng${id}" type="number" value="${T.neg??1}"></div><small>Left: marks for a correct answer. Right: marks lost for a wrong multiple-choice answer.</small><small>Marks lost for a wrong numerical answer (0 for NEET, 1 for JEE):</small><input id="enn${id}" type="number" value="${T.nn||0}">
${FB('eqt'+id)}<textarea id="eqt${id}" rows="18">${esc(txt)}</textarea><button class="s" onclick="pickImg('eqt${id}','emg${id}')">Add image to a question</button><button onclick="saveTest('${id}')">Save changes</button><p id="emg${id}"></p></div>`;
 }catch(e){box.innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function saveTest(id){
 const m=$('emg'+id);m.className='';m.textContent='Saving…';
 try{
  const T=(await db.collection('tests').doc(id).get()).data(),r=parseQ($('eqt'+id).value);
  if(r.err)return m.textContent=r.err;if(!r.qs.length)return m.textContent='Add at least one question.';
  const ti=$('etl'+id).value.trim(),mi=+$('emn'+id).value;if(!ti||!(mi>0))return m.textContent='Add a title and the time in minutes.';
  norm(T.pat,r.qs);const e=chk(T.pat,r.qs);if(e)return m.textContent=e;
  const rs=await db.collection('results').where('testId','==',id).get(),old=T.qs?T.qs.length:(T.n||0);
  if(rs.size&&r.qs.length!==old&&!confirm('The number of questions changed from '+old+' to '+r.qs.length+'. '+rs.size+' students already have results, and their old answers may not match. Continue?')){m.textContent='';return}
  await db.collection('qbank').doc(id).set({qs:r.qs});await db.collection('keys').doc(id).set({ans:r.ans});
  const cvu=$('ecu'+id).value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const k=l.indexOf('|');return k<0?{u:'',t:l}:{u:l.slice(0,k).trim(),t:l.slice(k+1).trim()}});
  const u={cv:{badge:$('ecb'+id).value.trim(),series:$('ecs'+id).value.trim(),sub:$('ecj'+id).value.trim(),units:cvu},title:ti,cls:$('ecl'+id).value.trim(),mins:mi,pos:+$('epo'+id).value,neg:+$('eng'+id).value,nn:+($('enn'+id).value||0),n:r.qs.length};if(T.qs)u.qs=firebase.firestore.FieldValue.delete();
  await db.collection('tests').doc(id).update(u);
  m.className='ok';m.textContent='Saved. '+r.qs.length+' questions. Open the Results tab once so student marks are refreshed.';
 }catch(e){m.className='bad';m.textContent=e.message}
}
/* ---------- QUESTION PAPER PDF (cover page design + two-column questions) ---------- */
const PB={NAVY:'#14285f',GOLD:'#e0ae4a',CREAM:'#fbf9f4',F:'Arial, Helvetica, sans-serif'};
function pbRR(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function pbSpW(x,t,sp){let w=0;[...t].forEach(ch=>w+=x.measureText(ch).width+sp);return w-sp}
function pbSp(x,t,X,Y,sp,al){let w=pbSpW(x,t,sp),s=al==='center'?X-w/2:X;x.textAlign='left';[...t].forEach(ch=>{x.fillText(ch,s,Y);s+=x.measureText(ch).width+sp})}
function pbWrap(x,txt,w){const out=[];String(txt).split('\n').forEach(p=>{let ln='';p.split(' ').forEach(wd=>{const tt=ln?ln+' '+wd:wd;if(x.measureText(tt).width>w&&ln){out.push(ln);ln=wd}else ln=tt});out.push(ln)});return out}
function pbCover(T,n,pos,neg,secs){
 const K=2,c=document.createElement('canvas');c.width=924*K;c.height=1308*K;const x=c.getContext('2d');x.scale(K,K);x.textBaseline='alphabetic';
 const {NAVY,GOLD,CREAM,F}=PB,cv=T.cv||{};
 x.fillStyle=CREAM;x.fillRect(0,0,924,1308);
 x.fillStyle=NAVY;x.fillRect(0,0,924,355);
 x.save();x.beginPath();x.rect(0,0,924,355);x.clip();x.strokeStyle='rgba(255,255,255,.13)';x.lineWidth=2;[170,235].forEach(r=>{x.beginPath();x.arc(830,45,r,0,7);x.stroke()});x.restore();
 const lg=document.querySelector('header img.logo');
 x.save();x.beginPath();x.arc(102,83,54,0,7);x.closePath();x.fillStyle='#fff';x.fill();x.clip();if(lg&&lg.naturalWidth)x.drawImage(lg,48,29,108,108);x.restore();
 x.beginPath();x.arc(102,83,54,0,7);x.lineWidth=3;x.strokeStyle='#fff';x.stroke();
 x.fillStyle=GOLD;x.font='bold 15px '+F;pbSp(x,'TEST CENTRE',177,60,3.5);
 x.fillStyle='#fff';x.font='bold 29px '+F;x.textAlign='left';x.fillText('STEM Coaching Institute',177,92);
 x.fillStyle='#dfe5f5';x.font='16px '+F;x.fillText('Pragya Puram, Lakhpedabagh, Barabanki \u00b7 9236990414',177,117);
 if(cv.badge){x.font='bold 17px '+F;const bw=pbSpW(x,cv.badge.toUpperCase(),1.5)+44;pbRR(x,877-bw,67,bw,34,17);x.fillStyle='#fff';x.fill();x.fillStyle=NAVY;pbSp(x,cv.badge.toUpperCase(),877-bw/2,90,1.5,'center')}
 const words=String(T.title||'Test').toUpperCase().split(/\s+/),last=words.length>1?words.pop():'',first=words.join(' ');
 let fs=112;const fit=()=>{x.font='bold '+fs+'px "Arial Black", Arial, sans-serif';return x.measureText(first+(last?' ':'')+last).width};
 while(fit()>830&&fs>30)fs-=4;
 x.font='bold '+fs+'px "Arial Black", Arial, sans-serif';x.textAlign='left';x.fillStyle='#fff';x.fillText(first,47,247);
 if(last){x.fillStyle=GOLD;x.fillText(last,47+x.measureText(first+' ').width,247)}
 const ser=(cv.series||(PN[T.pat]||'')).toString().toUpperCase().replace(/\s*\((OFFLINE AT CENTRE|ONLINE)\)/i,''),sub=cv.sub||(T.cls?'Class '+T.cls:'');
 let sx=47;
 if(ser){x.font='bold 22px '+F;const w=pbSpW(x,ser,3)+54;pbRR(x,47,274,w,53,7);x.fillStyle=GOLD;x.fill();x.fillStyle=NAVY;pbSp(x,ser,47+w/2,309,3,'center');sx=47+w+17}
 if(sub){x.fillStyle='#e6ebf7';x.font='19px '+F;x.textAlign='left';x.fillText(sub,sx,307)}
 let y=385;
 const units=cv.units||[];
 if(units.length){
  x.fillStyle=NAVY;x.font='bold 15px '+F;pbSp(x,'SYLLABUS COVERED',47,y,3);y+=21;
  for(let i=0;i<units.length;i+=2){
   [0,1].forEach(j=>{const u=units[i+j];if(!u)return;const X=j?472:47;pbRR(x,X,y,405,87,18);x.fillStyle='#fff';x.fill();x.lineWidth=3;x.strokeStyle=NAVY;x.stroke();
    x.fillStyle='#8a6a14';x.font='bold 15px '+F;pbSp(x,String(u.u||'').toUpperCase(),X+21,y+34,2.5);
    let f=24;do{x.font='bold '+f+'px '+F;f--}while(x.measureText(u.t||'').width>365&&f>13);x.fillStyle='#111';x.textAlign='left';x.fillText(u.t||'',X+21,y+65)});
   y+=87+16}
  y+=2;
 }
 pbRR(x,47,y,830,91,14);x.fillStyle='#eeeadb';x.fill();
 const st=[[String(n),'Questions'],[String(n*pos),'Maximum Marks'],[(T.mins||'')+' min','Time Allowed'],['+'+pos+' / \u2212'+neg,'Marking Scheme']];
 st.forEach((s,i)=>{const cx=47+830/8*(2*i+1);if(i){x.fillStyle='#d6d0b8';x.fillRect(47+830/4*i,y+4,2,83)}x.fillStyle=NAVY;x.font='bold 32px '+F;x.textAlign='center';x.fillText(s[0],cx,y+44);x.fillStyle='#555';x.font='bold 16px '+F;x.fillText(s[1],cx,y+72)});
 y+=91+30;
 x.fillStyle=NAVY;x.font='bold 15px '+F;pbSp(x,'INSTRUCTIONS TO CANDIDATES',47,y,3);y+=26;
 const subj=secs.length&&!(secs.length===1&&secs[0]==='General')?' in '+(secs.length>1?secs.slice(0,-1).join(', ')+' and '+secs[secs.length-1]:secs[0]):'';
 const hasNum=T.qs.some(q=>q.t==='num');
 const ins=['This test has '+n+' questions'+subj+'. '+(hasNum?'Multiple-choice questions have four options, of which only ONE is correct.':'Each question has four options, of which only ONE is correct.'),
  'Each correct answer carries +'+pos+' marks. Each incorrect answer carries \u2212'+neg+' mark.'+(hasNum?(T.nn?' Numerical questions also carry \u2212'+T.nn+' mark for a wrong answer.':' Numerical questions have no negative marking.'):'')+' Unattempted questions carry no marks.',
  'Mark only one option for each question on the OMR sheet.','Use only a blue or black ball point pen to darken the circle completely. Pencil must not be used.','Erasing, overwriting, whitener or blade on the OMR sheet is not allowed.','Do all rough work only in the space given in the booklet, never on the OMR sheet.','Mobile phones, smart watches, calculators and any electronic device are not allowed in the exam hall.','Fill in your details on this page and the OMR sheet before starting. Do not fold or tear the OMR sheet, and hand it to the invigilator at the end.'];
 x.font='16.5px '+F;
 ins.forEach((t,i)=>{x.fillStyle='#1b1f2a';x.textAlign='left';x.font='16.5px '+F;x.fillText((i+1)+'.',52,y);pbWrap(x,t,800).forEach((l,k)=>{x.fillText(l,74,y);y+=24});y+=3});
 y+=14;
 pbRR(x,47,y,830,215,20);x.fillStyle='#fff';x.fill();x.lineWidth=3;x.strokeStyle=NAVY;x.stroke();
 x.fillStyle=NAVY;x.font='bold 15px '+F;pbSp(x,'STUDENT DETAILS',70,y+36,3);
 const fld=(l,x1,x2,yy)=>{x.fillStyle='#444';x.font='bold 16px '+F;x.textAlign='left';x.fillText(l,x1,yy);x.fillStyle='#222';x.fillRect(x1,yy+13,x2-x1,2)};
 fld('Name of Student',70,577,y+84);fld('Roll No.',600,854,y+84);
 fld('Batch',70,316,y+137);fld('Date',339,585,y+137);fld('Test No.',608,854,y+137);
 fld('Student\u2019s Signature',70,450,y+190);fld('Invigilator\u2019s Signature',474,854,y+190);
 x.fillStyle=NAVY;x.fillRect(0,1267,924,41);
 x.fillStyle='#cdd6ee';x.font='bold 15px '+F;pbSp(x,[String(T.title||'Test'),ser,'BEST OF LUCK'].filter(Boolean).join(' \u00b7 ').toUpperCase(),462,1293,3,'center');
 return c;
}
function pbWrapR(x,txt,w,px,ff){
 const FF=' '+(ff||'Arial, Helvetica, sans-serif'),sp=Math.round(px*.7),mw=(t,m)=>{x.font=(m?sp:px)+'px'+FF;return x.measureText(t).width},out=[];
 String(txt).split('\n').forEach(par=>{
  const words=[];let cur=[];
  mkSeg(par).forEach(g=>{
   if(g.m){cur.push(g);return}
   g.t.split(/( )/).forEach(tok=>{if(tok===' '){if(cur.length)words.push(cur);cur=[]}else if(tok)cur.push({t:tok,m:0})})});
  if(cur.length)words.push(cur);
  let ln=[],lw=0;const sw=mw(' ',0);
  words.forEach(wd=>{const ww=wd.reduce((a,g)=>a+mw(g.t,g.m),0),add=ln.length?sw+ww:ww;
   if(ln.length&&lw+add>w){out.push(ln);ln=[...wd];lw=ww}else{if(ln.length)ln.push({t:' ',m:0});ln.push(...wd);lw+=add}});
  out.push(ln)});
 return out}
function pbDrawR(x,line,X,Y,px,ff){
 const FF=' '+(ff||'Arial, Helvetica, sans-serif'),sp=Math.round(px*.7),base=Y+Math.round(px*.9);let cx=X;
 x.textBaseline='alphabetic';x.textAlign='left';
 line.forEach(g=>{x.font=(g.m?sp:px)+'px'+FF;const yy=g.m===1?base+Math.round(px*.2):g.m===2?base-Math.round(px*.36):base;x.fillText(g.t,cx,yy);cx+=x.measureText(g.t).width});
 x.textBaseline='top'}
async function pbQuestion(q,i,head,ff){
 const FAM=ff||'Arial, Helvetica, sans-serif',PW=720,F='26px '+FAM,LH=35,c=document.createElement('canvas');c.width=PW;let x=c.getContext('2d');
 x.font=F;
 const qt=String(q.q).replace(new RegExp('^\\s*'+(i+1)+'[.)]\\s+'),''),ql=pbWrapR(x,qt,PW-64,26,FAM);
 let im=null;if(q.img&&IMG[q.img])im=await new Promise(ok=>{const m=new Image();m.onload=()=>ok(m);m.onerror=()=>ok(null);m.src=IMG[q.img]});
 let iw=0,ih=0;if(im){const kk=Math.min(1,(PW-64)/im.naturalWidth,520/im.naturalHeight);iw=im.naturalWidth*kk;ih=im.naturalHeight*kk}
 const ol=(q.o||[]).map(o=>pbWrapR(x,o,PW-126,26,FAM)),hh=head?46:0;
 const h=hh+ql.length*LH+(im?ih+14:0)+ol.reduce((a,l)=>a+l.length*LH+4,0)+26;
 c.height=Math.ceil(h);x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,PW,c.height);x.fillStyle='#000';x.textBaseline='top';
 let y=4;
 if(head){x.font='bold 27px Arial, sans-serif';x.fillStyle=PB.NAVY;x.fillText(head.toUpperCase(),0,y+4);x.fillRect(0,y+38,PW,2);y+=hh;x.fillStyle='#000'}
 x.font='bold '+F;x.fillText('Q'+(i+1)+'.',0,y);x.font=F;
 ql.forEach(l=>{pbDrawR(x,l,64,y,26,FAM);y+=LH});
 if(im){x.drawImage(im,64,y+6,iw,ih);y+=ih+14}
 ol.forEach((l,j)=>{x.fillText('('+(j+1)+')',20,y);l.forEach(t=>{pbDrawR(x,t,76,y,26,FAM);y+=LH});y+=4});
 return c;
}
function pbLine(txt,px,bold,al,color){
 const W=1600,c=document.createElement('canvas');c.width=W;c.height=Math.round(px*1.5);const x=c.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,W,c.height);x.fillStyle=color||'#000';x.textBaseline='middle';x.font=(bold?'bold ':'')+px+'px Arial, Helvetica, sans-serif';x.textAlign=al==='center'?'center':al==='right'?'right':'left';
 x.fillText(txt,al==='center'?W/2:al==='right'?W:0,c.height/2);return c;
}
/* ---------- bilingual paper layout: Hindi on the LEFT half, English on the RIGHT half ---------- */
const PB_HI="'Noto Sans Devanagari','Nirmala UI','Mangal','Kohinoor Devanagari','Lohit Devanagari',Arial,sans-serif";
function pbHasHi(qs){return qs.some(q=>q.qh||(q.oh&&q.oh.length))}
function pbHiQ(q){return {...q,q:q.qh||q.q,o:q.o?((q.oh&&q.oh.length===q.o.length)?q.oh:q.o):q.o}}
async function pbFlow(doc,qs,bil){
 const W=210,H=297,M=12,GAP=8,CW=(W-2*M-GAP)/2,TOP=bil?23:22,BOT=H-16,secs=[...new Set(qs.map(q=>q.s||'General'))];
 let col=0,y=TOP,qp=1,sec=null;
 const add=(c,x,yy)=>{const h=c.height*CW/c.width;doc.addImage(c.toDataURL('image/jpeg',0.88),'JPEG',x,yy,CW,h);return h};
 for(let i=0;i<qs.length;i++){
  const q=qs[i],s=q.s||'General',head=secs.length>1&&s!==sec?'Section: '+s:'';sec=s;
  if(bil){
   const cl=await pbQuestion(pbHiQ(q),i,head,PB_HI),cr=await pbQuestion(q,i,head),h=Math.max(cl.height*CW/cl.width,cr.height*CW/cr.width);
   if(y+h>BOT&&y>TOP){doc.addPage();y=TOP;qp++}
   add(cl,M,y);add(cr,M+CW+GAP,y);y+=h;
  }else{
   const c=await pbQuestion(q,i,head),h=c.height*CW/c.width;
   if(y+h>BOT&&y>TOP){if(col===0){col=1;y=TOP}else{doc.addPage();col=0;y=TOP;qp++}}
   add(c,M+col*(CW+GAP),y);y+=h;
  }
 }
 return qp;
}
function pbPages(doc,ttl,sub,qp,bil,from){
 const W=210,H=297,M=12,GAP=8,CW=(W-2*M-GAP)/2,TOP=bil?23:22,BOT=H-16,f0=from||2;
 for(let p=f0;p<=qp+f0-1;p++){
  doc.setPage(p);
  const hl=pbLine(ttl,40,true,'left',PB.NAVY),hr=pbLine(sub||'STEM Coaching Institute',32,false,'right','#444');
  doc.addImage(hl.toDataURL('image/jpeg',0.9),'JPEG',M,6,W-2*M,(W-2*M)*hl.height/hl.width);
  doc.addImage(hr.toDataURL('image/jpeg',0.9),'JPEG',M,6,W-2*M,(W-2*M)*hr.height/hr.width);
  doc.setDrawColor(224,174,74);doc.setLineWidth(0.7);doc.line(M,16,W-M,16);
  doc.setDrawColor(190,190,190);doc.setLineWidth(0.2);doc.line(W/2,TOP-2,W/2,BOT);
  if(bil){const lb=(t,x0)=>{const c=pbLine(t,58,true,'center',PB.NAVY);doc.addImage(c.toDataURL('image/jpeg',0.9),'JPEG',x0,17,CW,CW*c.height/c.width)};lb('\u0939\u093f\u0928\u094d\u0926\u0940',M);lb('English',M+CW+GAP)}
  const f=pbLine(ttl+'  |  Page '+(p-f0+1)+' of '+qp,28,false,'center','#444');
  doc.addImage(f.toDataURL('image/jpeg',0.9),'JPEG',M,H-12,W-2*M,(W-2*M)*f.height/f.width);
 }
}
async function pdfPaper(id,btn){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const old=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent='Preparing PDF…'}
 try{
  const [t,qb]=await Promise.all([db.collection('tests').doc(id).get(),db.collection('qbank').doc(id).get()]);
  const T=t.data();T.qs=T.qs||qb.data().qs;await loadImgs(T);
  const doc=new window.jspdf.jsPDF('p','mm','a4'),W=210,H=297,M=12,GAP=8,CW=(W-2*M-GAP)/2,TOP=22,BOT=H-16,n=T.qs.length,pos=T.pos??4,neg=T.neg??1;
  const secs=[...new Set(T.qs.map(q=>q.s||'General'))];
  const cov=pbCover(T,n,pos,neg,secs);doc.addImage(cov.toDataURL('image/jpeg',0.93),'JPEG',0,0,W,H);
  doc.addPage();
  const ttl=(T.title||'Test'),bil=pbHasHi(T.qs),qp=await pbFlow(doc,T.qs,bil);
  pbPages(doc,ttl,(T.cv&&T.cv.sub)||'',qp,bil,2);
  /* LAST PAGE (toppers + test series), same on every question paper: image file endpage.jpg in the website folder */
  try{
   const er=await fetch('endpage.jpg?v=1',{cache:'no-cache'});
   if(er.ok){
    const eb=await er.blob();
    const ed=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(eb)});
    doc.addPage();doc.addImage(ed,'JPEG',0,0,W,H);
    doc.__nowm=[doc.getNumberOfPages()];
   }else console.warn('endpage.jpg not found on the website');
  }catch(ee){console.warn('End page could not be added',ee)}
  doc.save('STEM_QuestionPaper_'+R_name(ttl)+'.pdf');
 }catch(e){alert('Could not make the PDF: '+e.message)}
 if(btn){btn.disabled=false;btn.textContent=old}
}
/* ---------- STUDENT ID CARD (85.6 x 54 mm) ---------- */
function idSession(){const t=new Date(),y=t.getMonth()>=3?t.getFullYear():t.getFullYear()-1;return{s:y+'-'+String((y+1)%100).padStart(2,'0'),v:'31 Mar '+(y+1)}}
const idImg=src=>new Promise(ok=>{if(!src)return ok(null);const m=new Image();m.onload=()=>ok(m);m.onerror=()=>ok(null);m.src=src});
function idCanvas(){const c=document.createElement('canvas'),k=856/1012;c.width=856;c.height=540;const x=c.getContext('2d');x.scale(k,k);x.textBaseline='alphabetic';return[c,x]}
async function idFront(st,phSrc){
 const [c,x]=idCanvas(),{NAVY,GOLD,F}=PB,ses=idSession(),ph=await idImg(phSrc);
 x.fillStyle='#fff';x.fillRect(0,0,1012,638);
 x.fillStyle=NAVY;x.fillRect(0,0,1012,150);x.fillStyle=GOLD;x.fillRect(0,150,1012,12);
 const lg=document.querySelector('header img.logo');
 x.save();x.beginPath();x.arc(88,76,56,0,7);x.fillStyle='#fff';x.fill();x.clip();if(lg&&lg.naturalWidth)x.drawImage(lg,32,20,112,112);x.restore();
 x.beginPath();x.arc(88,76,56,0,7);x.lineWidth=4;x.strokeStyle=GOLD;x.stroke();
 x.fillStyle='#fff';x.font='bold 46px '+F;x.textAlign='left';x.fillText('STEM Coaching Institute',168,76);
 x.fillStyle=GOLD;x.font='bold 22px '+F;pbSp(x,'NEET \u00b7 BOARD \u00b7 MEDICAL \u00b7 FOUNDATION',168,112,2);
 x.fillStyle=NAVY;x.font='bold 24px '+F;pbSp(x,'STUDENT IDENTITY CARD',330,205,4);
 // photo
 pbRR(x,40,185,250,330,16);x.save();x.clip();x.fillStyle='#e9ecf4';x.fillRect(40,185,250,330);
 if(ph){const k=Math.max(250/ph.naturalWidth,330/ph.naturalHeight),w=ph.naturalWidth*k,h=ph.naturalHeight*k;x.drawImage(ph,40+(250-w)/2,185+(330-h)/2,w,h)}
 else{x.fillStyle='#9aa3bd';x.font='bold 130px '+F;x.textAlign='center';x.fillText(String(st.name||'?').charAt(0).toUpperCase(),165,395)}
 x.restore();pbRR(x,40,185,250,330,16);x.lineWidth=6;x.strokeStyle=GOLD;x.stroke();
 // details
 x.textAlign='left';let f=44;do{x.font='bold '+f+'px '+F;f-=2}while(x.measureText(st.name||'').width>650&&f>22);
 x.fillStyle='#111';x.fillText(String(st.name||''),330,262);
 const fld=(l,v,X,Y,w)=>{x.fillStyle='#6b7390';x.font='bold 19px '+F;x.fillText(l.toUpperCase(),X,Y);x.fillStyle='#111';let g=29;do{x.font='bold '+g+'px '+F;g--}while(x.measureText(v).width>w&&g>16);x.fillText(v,X,Y+34)};
 fld('Roll no.',String(st.roll||'-'),330,318,200);fld('Class',String(st.cls||'-'),560,318,150);
 fld("Father's name",String(st.father||'-'),330,398,650);
 fld('Date of birth',st.dob?dmy(st.dob):'-',330,478,200);fld('Mobile',String(st.mobile||st.roll||'-'),560,478,400);
 x.fillStyle=NAVY;x.fillRect(0,560,1012,78);
 x.fillStyle=GOLD;x.font='bold 28px '+F;x.textAlign='left';x.fillText('SESSION '+ses.s,40,610);
 x.fillStyle='#fff';x.font='24px '+F;x.textAlign='right';x.fillText('Valid till '+ses.v,972,609);
 return c;
}
function idBack(st){
 const [c,x]=idCanvas(),{NAVY,GOLD,CREAM,F}=PB;
 x.fillStyle=CREAM;x.fillRect(0,0,1012,638);
 x.fillStyle=NAVY;x.fillRect(0,0,1012,70);x.fillStyle=GOLD;x.fillRect(0,70,1012,8);
 x.fillStyle='#fff';x.font='bold 26px '+F;pbSp(x,'IF FOUND, PLEASE RETURN TO',506,46,3,'center');
 x.textAlign='left';x.fillStyle=NAVY;x.font='bold 32px '+F;x.fillText('STEM Coaching Institute',50,130);
 x.fillStyle='#222';x.font='24px '+F;x.fillText('Pragya Puram, Lakhpedabagh, Barabanki',50,166);x.fillText('Phone: 9236990414',50,198);
 if(st.addr){x.fillStyle='#6b7390';x.font='bold 19px '+F;x.fillText('STUDENT ADDRESS',50,243);x.fillStyle='#111';x.font='22px '+F;pbWrap(x,st.addr,910).slice(0,2).forEach((l,i)=>x.fillText(l,50,274+i*28))}
 x.fillStyle=NAVY;x.font='bold 19px '+F;pbSp(x,'INSTRUCTIONS',50,350,3);
 x.fillStyle='#222';x.font='21px '+F;
 ['Carry this card to the institute every day.','Show the card whenever asked by the staff.','Report a lost card at the office immediately.','This card is not transferable.'].forEach((t,i)=>x.fillText((i+1)+'.  '+t,50,386+i*30));
 x.fillStyle='#222';x.fillRect(50,545,330,2);x.fillRect(632,545,330,2);
 x.fillStyle='#555';x.font='bold 18px '+F;x.textAlign='left';x.fillText("Student\u2019s signature",50,572);x.textAlign='right';x.fillText('Authorised signatory',962,572);
 x.fillStyle=NAVY;x.fillRect(0,600,1012,38);x.fillStyle=GOLD;x.font='bold 18px '+F;pbSp(x,'NEET \u00b7 BOARD \u00b7 MEDICAL \u00b7 FOUNDATION',506,626,3,'center');
 return c;
}
async function idLoad(uid){
 const [sd,pd]=await Promise.all([db.collection('students').doc(uid).get(),db.collection('photos').doc(uid).get().catch(()=>null)]);
 return{st:sd.data()||{},ph:pd&&pd.exists&&String(pd.data().d).startsWith('data:image/')?pd.data().d:null};
}
async function idPdf(uids,btn){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const old=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent='Preparing…'}
 try{
  const doc=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:[54,85.6]});let nm='';
  for(let i=0;i<uids.length;i++){
   const {st,ph}=await idLoad(uids[i]);if(i===0)nm=st.name||'Student';
   if(i)doc.addPage();doc.addImage((await idFront(st,ph)).toDataURL('image/jpeg',0.9),'JPEG',0,0,85.6,54);
   doc.addPage();doc.addImage(idBack(st).toDataURL('image/jpeg',0.9),'JPEG',0,0,85.6,54);
  }
  doc.save('STEM_ID_Card_'+R_name(uids.length>1?'Students':nm)+'.pdf');
 }catch(e){alert('Could not make the ID card: '+e.message)}
 if(btn){btn.disabled=false;btn.textContent=old}
}
let LSL=[];
async function idSheet(btn){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 if(!LSL.length)return alert('No students in this list.');
 const old=btn.textContent;btn.disabled=true;
 try{
  const doc=new window.jspdf.jsPDF('p','mm','a4'),CWm=85.6,CHm=54,GX=4,GY=3,X0=(210-2*CWm-GX)/2,Y0=(297-5*CHm-4*GY)/2;
  const cards=[];
  for(let i=0;i<LSL.length;i++){btn.textContent='Preparing '+(i+1)+' of '+LSL.length+'…';const {st,ph}=await idLoad(LSL[i]);cards.push({f:(await idFront(st,ph)).toDataURL('image/jpeg',0.88),b:idBack(st).toDataURL('image/jpeg',0.88)})}
  for(let p=0;p<cards.length;p+=10){
   const grp=cards.slice(p,p+10);
   [0,1].forEach(side=>{
    if(p>0||side)doc.addPage();
    doc.setDrawColor(170);doc.setLineWidth(0.15);
    grp.forEach((c,k)=>{const col=side?1-(k%2):k%2,row=Math.floor(k/2),X=X0+col*(CWm+GX),Y=Y0+row*(CHm+GY);doc.addImage(side?c.b:c.f,'JPEG',X,Y,CWm,CHm);doc.rect(X,Y,CWm,CHm)});
    doc.setFontSize(7);doc.setTextColor(120);doc.text(side?'Back (print on the reverse of the front page, flip on the long edge)':'Front',105,6,{align:'center'});
   });
  }
  doc.save('STEM_ID_Cards_'+(LSF?'Class_'+R_name(LSF):'All')+'.pdf');
 }catch(e){alert('Could not make the ID cards: '+e.message)}
 btn.disabled=false;btn.textContent=old;
}
async function pdfKey(id){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 try{
  const [t,qb,k]=await Promise.all([db.collection('tests').doc(id).get(),db.collection('qbank').doc(id).get(),db.collection('keys').doc(id).get()]);
  const T=t.data(),qs=T.qs||qb.data().qs,K=k.data().ans,n=qs.length,per=Math.ceil(n/3);
  const a=i=>{const q=qs[i];return q.t==='num'||!q.o?String(K[i]):String(K[i]+1)};
  const doc=new window.jspdf.jsPDF(),W=doc.internal.pageSize.getWidth();
  doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('STEM COACHING INSTITUTE',W/2,14,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('NEET / Board / Medical / Foundation | Pargyapuram, Lakhpedabagh, Barabanki | 9236990414',W/2,20,{align:'center'});
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Answer Key: '+(T.title||'Test'),W/2,29,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('Total questions: '+n+'   Correct: +'+(T.pos??4)+'   Wrong: -'+(T.neg??1),W/2,35,{align:'center'});
  const body=[];for(let i=0;i<per;i++){const r=[];for(let c=0;c<3;c++){const q=i+c*per;r.push(q<n?q+1:'',q<n?a(q):'')}body.push(r)}
  doc.autoTable({startY:40,styles:{fontSize:9,cellPadding:1.6,halign:'center'},headStyles:{fillColor:[23,48,107]},head:[['Q','Ans','Q','Ans','Q','Ans']],body});
  doc.save('STEM_AnswerKey_'+R_name(T.title||'Test')+'.pdf');
 }catch(e){alert('Could not make the PDF: '+e.message)}
}
const PN={neet:'Full NEET',bio:'Biology only',phy:'Physics only',chem:'Chemistry only'};
function canSee(t,st){
 if(st.notests)return false;
 if(t.cls&&t.cls!==st.cls)return false;
 const p=t.pat||'custom',pl=st.plans||[];
 return p==='custom'||pl.includes(p)||(pl.includes('neet')&&['neet','bio','phy','chem'].includes(p));
}

/* ---------- test-series picker: filter drop-down, then series drop-down ---------- */
const SP={};
function serPickerHtml(id,sel){SP[id]=[...sel];return '<small>Filter</small><select id="spf'+id+'" onchange="serFill(\''+id+'\')"><option value="">All test series</option><option value="NEET">NEET</option><option value="JEE">JEE</option><option value="BOARDS">Boards / school / other</option></select><small>Test series (choose one, then tap Add)</small><select id="sps'+id+'"></select><button type="button" class="s" onclick="serAdd(\''+id+'\')">+ Add this series</button><div id="spc'+id+'"></div>'}
function serFill(id){const f=$('spf'+id).value,o=Object.entries(PN).filter(([k])=>!SP[id].includes(k)&&(!f||(f==='BOARDS'?sexOf(k)==='':sexOf(k)===f)));$('sps'+id).innerHTML=o.length?o.map(([k,v])=>`<option value="${esc(k)}">${esc(v)}</option>`).join(''):'<option value="">No more series under this filter</option>'}
function serChips(id){$('spc'+id).innerHTML=SP[id].length?SP[id].map(k=>`<span class="chip" style="cursor:pointer" onclick="serDel('${id}','${esc(k)}')">${esc(PN[k]||k)} &#10005;</span>`).join(' '):'<small>No series added yet.</small>'}
function serAdd(id){const v=$('sps'+id).value;if(v&&!SP[id].includes(v))SP[id].push(v);serFill(id);serChips(id)}
function serDel(id,k){SP[id]=SP[id].filter(z=>z!==k);serFill(id);serChips(id)}
async function editP(uid){
 const sx=(await db.collection('students').doc(uid).get()).data()||{},cur=sx.plans||[];
 $('pe'+uid).innerHTML=`<label class="opt"><input type="checkbox" id="nt${uid}" ${sx.notests?'checked':''}>No tests (profile and attendance only)</label>`+serPickerHtml(uid,cur)+`<button onclick="saveP('${uid}')">Save</button>`;serFill(uid);serChips(uid);
}
async function saveP(uid){
 const nt=$('nt'+uid).checked,pl=nt?[]:[...(SP[uid]||[])];
 try{await db.collection('students').doc(uid).update({plans:pl,notests:nt});listStudents()}catch(e){alert(e.message)}
}
let LSF='',LSS='';
let LSQ='',LSX='',LSO=false,LSD=[];
const EXAMOPT=v=>'<option value="">Boards / school / other (not NEET or JEE)</option><option value="NEET"'+(v==='NEET'?' selected':'')+'>NEET</option><option value="JEE"'+(v==='JEE'?' selected':'')+'>JEE</option>';
const examOf=x=>x.exam||(/jee/i.test((x.title||'')+' '+(x.k||''))?'JEE':(/neet/i.test(x.title||'')||/^(neet|bio|phy|chem)(off)?$/.test(x.k||''))?'NEET':'');
const SEX={};const sexOf=k=>SEX[k]!==undefined?SEX[k]:examOf({k});
async function listStudents(cf){
 const el=$('sl');if(!el)return;
 if(typeof cf==='string')LSF=cf;
 el.innerHTML='Loading…';
 const s=await db.collection('students').get();LSD=s.docs;
 el.innerHTML='<div class="row" style="flex-wrap:nowrap"><input id="lsq" type="search" placeholder="Search name, roll number, mobile or class…" value="'+esc(LSQ)+'" autocomplete="off" style="flex:1 1 auto"><button type="button" id="lsb" style="flex:0 0 auto;width:auto;white-space:nowrap">&#9776; Filters<span id="lsn"></span></button></div>'+
  '<div id="lsp" class="card" style="display:'+(LSO?'block':'none')+'"><h3>Filters</h3><small>Class</small><select id="lsc"><option value="">All classes</option>'+CLS.map(c=>`<option${LSF===c?' selected':''}>${c}</option>`).join('')+'</select>'+
  '<small>Exam (batch)</small><select id="lsx"><option value="">NEET and JEE</option><option value="NEET"'+(LSX==='NEET'?' selected':'')+'>NEET batch</option><option value="JEE"'+(LSX==='JEE'?' selected':'')+'>JEE batch</option></select>'+
  '<small>Test series</small><select id="lss"><option value="">All test series</option>'+Object.entries(PN).map(([k,v])=>`<option value="${esc(k)}"${LSS===k?' selected':''}>${esc(v)}</option>`).join('')+`<option value="__none"${LSS==='__none'?' selected':''}>No test series</option></select>`+
  '<button type="button" class="s" id="lsr0">Reset filters</button></div><div id="slr"></div>';
 $('lsq').oninput=function(){LSQ=this.value;lsRender()};
 $('lsb').onclick=function(){LSO=!LSO;$('lsp').style.display=LSO?'block':'none'};
 $('lsc').onchange=function(){LSF=this.value;lsRender()};
 $('lsx').onchange=function(){LSX=this.value;lsRender()};
 $('lss').onchange=function(){LSS=this.value;lsRender()};
 $('lsr0').onclick=function(){LSF='';LSS='';LSX='';LSQ='';listStudents()};
 lsRender();regCard();
}
function lsRender(){
 const el=$('slr');if(!el)return;
 const q=LSQ.trim().toLowerCase();
 const docs=LSD.filter(d=>{const x=d.data(),p=x.plans||[];
  if(LSF&&String(x.cls||'')!==LSF)return false;
  if(LSS&&(LSS==='__none'?p.length:!p.includes(LSS)))return false;
  if(LSX&&!p.some(k=>sexOf(k)===LSX))return false;
  if(q&&![x.name,x.roll,x.mobile,x.cls,x.cls?'class '+x.cls:''].some(v=>String(v||'').toLowerCase().includes(q)))return false;
  return true}).sort((a,b)=>String(a.data().cls||'').localeCompare(String(b.data().cls||''),undefined,{numeric:true})||String(a.data().name||'').localeCompare(String(b.data().name||'')));
 LSL=docs.map(d=>d.id);
 const n=(LSF?1:0)+(LSS?1:0)+(LSX?1:0),bn=$('lsn');if(bn)bn.textContent=n?' ('+n+')':'';
 el.innerHTML='<h3>Students ('+docs.length+' of '+LSD.length+')</h3><button class="s" onclick="idSheet(this)">ID cards of this list (A4 print sheet)</button>'+docs.map(d=>{const x=d.data();return `<div class="card">${esc(x.name)} (${esc(x.roll)})${LSD.filter(z=>z.data().roll===x.roll).length>1?' <span class="bad">same number as another student</span>':''}, Class ${esc(x.cls||'-')}${x.mobile?'<br><small>Mobile: '+esc(x.mobile)+'</small>':''}${x.cls==='Dropper'?'<br><small><b>Dropper - attendance '+(regular(x)?'on':'off')+'</b></small>':regular(x)?'':'<br><small><b>Test series only - no attendance</b></small>'}<br><small>Tests: ${x.notests?'None (profile and attendance only)':(x.plans||[]).map(k=>PN[k]).join(', ')||'Custom tests only'}</small><div class="btns"><button class="s" onclick="editD('${d.id}')">Details and photo</button><button class="s" onclick="editP('${d.id}')">Change tests</button><button class="s" onclick="idPdf(['${d.id}'],this)">ID card</button></div>${me.email===TEACHER?`<button class="s" onclick="delS('${d.id}')">Delete student</button>`:''}<div id="pd${d.id}"></div><div id="pe${d.id}"></div></div>`}).join('')+(docs.length?'':'<p>No students match this search or filter.</p>');
}
async function delS(uid){
 if(me.email!==TEACHER)return alert('Only the teacher can delete a student.');
 if(!confirm('Delete this student and all their test results? Saved marks and attendance stay in the database. They will no longer be able to open any test.'))return;
 try{
  const r=await db.collection('results').where('uid','==',uid).get();
  for(const d of r.docs)await d.ref.delete();
  try{const oi=await db.collection('omrimg').where('uid','==',uid).get();for(const d of oi.docs)await d.ref.delete()}catch(e){}
  try{await db.collection('photos').doc(uid).delete()}catch(e){}
  await db.collection('students').doc(uid).delete();listStudents();
 }catch(e){alert(e.message)}
}
async function delT(id){
 if(!confirm('Delete this test and all its results? Marks already saved for students stay. This cannot be undone.'))return;
 try{
  const r=await db.collection('results').where('testId','==',id).get();
  for(const d of r.docs)await d.ref.delete();
  try{const oi=await db.collection('omrimg').where('testId','==',id).get();for(const d of oi.docs)await d.ref.delete()}catch(e){}
  try{for(const d of (await db.collection('demos').where('testId','==',id).get()).docs)await d.ref.delete()}catch(e){}
  for(const c of ['qbank','keys','tests'])await db.collection(c).doc(id).delete();
  testsView();
 }catch(e){alert(e.message)}
}
let RP={},RF={s:'',u:'',q:''};
async function results(){
 $('tv').innerHTML='Loading…';
 const [ts,ks,st,rs,qb]=await Promise.all(['tests','keys','students','results','qbank'].map(c=>db.collection(c).get()));const Q={};qb.forEach(d=>Q[d.id]=d.data().qs);
 const K={},S={};ks.forEach(d=>K[d.id]=d.data().ans);st.forEach(d=>S[d.id]=d.data());
 RP={};const MK=[];
 ts.docs.forEach(d=>{
  const t={...d.data()};t.qs=t.qs||Q[d.id]||[];const max=t.qs.length*(t.pos??4);
  const rows=rs.docs.filter(r=>r.data().testId===d.id).map(r=>{
   const x=r.data(),s=S[x.uid]||{},z=score(t,K[d.id]||[],x.a);return{n:s.name||'?',roll:s.roll||'',sc:z.sc,ok:z.ok,bad:z.bad,un:z.un,sec:z.sec,id:r.id,uid:x.uid,at:x.at,vio:x.vio||0}}).sort((a,b)=>b.sc-a.sc);
  rows.forEach((r,i)=>{r.rank=(i>0&&r.sc===rows[i-1].sc)?rows[i-1].rank:i+1});
  RP[d.id]={title:t.title||'Test',max,rows,pat:t.pat||'custom',cnt:t.qs.length};
  const t0=t.start&&t.start.toMillis?t.start.toMillis():0;rows.forEach(r=>MK.push({id:r.id,uid:r.uid,testId:d.id,title:t.title||'Test',sc:r.sc,max,ok:r.ok,bad:r.bad,un:r.un,sec:r.sec,rank:r.rank,of:rows.length,t0:t0||(r.at&&r.at.toMillis?r.at.toMillis():0)}));
 });
 const pats=[...new Set(Object.values(RP).map(x=>x.pat))],order=[...Object.keys(PN),'custom'];
 pats.sort((a,b)=>{const x=order.indexOf(a),y=order.indexOf(b);return(x<0?99:x)-(y<0?99:y)});
 const nm=p=>p==='custom'?'Custom tests':(PN[p]||p),stu={};
 Object.values(RP).forEach(R=>R.rows.forEach(r=>stu[r.uid]={n:r.n,roll:r.roll}));
 const sl=Object.entries(stu).sort((a,b)=>a[1].n.localeCompare(b[1].n));
 if(RF.s&&!pats.includes(RF.s))RF.s='';if(RF.u&&!stu[RF.u])RF.u='';
 const any=Object.values(RP).some(R=>R.rows.length);
 $('tv').innerHTML=`<div class="card"><h3>Filter results</h3><select id="rfs"><option value="">All test series</option>${pats.map(p=>`<option value="${p}"${RF.s===p?' selected':''}>${esc(nm(p))}</option>`).join('')}</select><select id="rfu"><option value="">All students</option>${sl.map(([u,s])=>`<option value="${u}"${RF.u===u?' selected':''}>${esc(s.n)} (${esc(s.roll)})</option>`).join('')}</select><input id="rfq" placeholder="Search student name or roll no." value="${esc(RF.q)}"></div>`+
  (any?`<details class="card"><summary><b>Download PDF</b> (choose test series)</summary><small>Test-wise: ranks of all students in each test. Student-wise: one page per student with every test of the series${'(the student selected above only, if you chose one)'}.</small>`+pats.filter(p=>Object.values(RP).some(R=>R.pat===p&&R.rows.length)).map(p=>`<div style="margin-top:8px"><b>${esc(nm(p))}</b><div class="row"><button class="s" onclick="pdfTest(null,'${p}')">Test-wise PDF</button><button class="s" onclick="pdfStudents('${p}')">Student-wise PDF</button></div></div>`).join('')+`<button style="margin-top:10px" onclick="pdfTest()">All tests in one PDF</button></details>`:'')+
  '<p id="mkst"></p><div id="rlist"></div>';
 $('rfs').onchange=()=>{RF.s=$('rfs').value;resShow()};$('rfu').onchange=()=>{RF.u=$('rfu').value;resShow()};$('rfq').oninput=()=>{RF.q=$('rfq').value.trim();resShow()};
 resShow();syncMarks(MK);
}
function resShow(){
 const q=RF.q.toLowerCase(),ids=Object.keys(RP).filter(k=>!RF.s||RP[k].pat===RF.s).sort((a,b)=>RP[a].title.localeCompare(RP[b].title,undefined,{numeric:true}));
 const h=ids.map(k=>{const R=RP[k],rows=R.rows.filter(r=>(!RF.u||r.uid===RF.u)&&(!q||(r.n+' '+r.roll).toLowerCase().includes(q)));
  if(!rows.length&&(RF.u||q))return '';
  return `<div class="card"><b>${esc(R.title)}</b> (${R.cnt} questions)<br>`+(rows.map(r=>`${r.rank}. ${esc(r.n)} (${esc(r.roll)}): <b>${r.sc}</b>${r.vio?' <span class="bad">⚠ '+r.vio+' warning'+(r.vio>1?'s':'')+'</span>':''} <a href="#" onclick="allow('${r.id}');return false">allow retake</a><br>`).join('')||'No attempts yet.')+(R.rows.length?`<div class="btns"><button class="s" onclick="pdfTest('${k}')">Download PDF</button></div>`:'')+'</div>'}).join('');
 $('rlist').innerHTML=h||'<p>No results match.</p>';
}
function pdfStudents(pat){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const ids=Object.keys(RP).filter(k=>RP[k].pat===pat&&RP[k].rows.length);
 const S={};ids.forEach(k=>RP[k].rows.forEach(r=>{(S[r.uid]=S[r.uid]||{n:r.n,roll:r.roll,t:[]}).t.push({title:RP[k].title,max:RP[k].max,...r})}));
 let L=Object.entries(S).filter(([u])=>!RF.u||u===RF.u).sort((a,b)=>a[1].n.localeCompare(b[1].n));
 if(!L.length)return alert('No results to download for this selection.');
 const nm=pat==='custom'?'Custom tests':(PN[pat]||pat),doc=new window.jspdf.jsPDF(),W=doc.internal.pageSize.getWidth();
 L.forEach(([u,s],n)=>{
  if(n>0)doc.addPage();
  doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('STEM COACHING INSTITUTE',W/2,14,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('NEET / Board / Medical / Foundation | Pargyapuram, Lakhpedabagh, Barabanki | 9236990414',W/2,20,{align:'center'});
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Student result: '+s.n+' ('+s.roll+')',W/2,29,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('Test series: '+nm+'   Date: '+new Date().toLocaleDateString('en-GB'),W/2,35,{align:'center'});
  const tot=s.t.reduce((a,x)=>a+x.sc,0),mx=s.t.reduce((a,x)=>a+x.max,0);
  doc.autoTable({startY:40,styles:{fontSize:8,cellPadding:1.6},headStyles:{fillColor:[23,48,107]},head:[['Test','Marks','Maximum','%','Rank','Correct','Wrong','Not attempted']],
   body:[...s.t.map(x=>[x.title,x.sc,x.max,x.max?(x.sc/x.max*100).toFixed(1):'0',x.rank+' of '+RP[ids.find(k=>RP[k].title===x.title)].rows.length,x.ok,x.bad,x.un]),['Total',tot,mx,mx?(tot/mx*100).toFixed(1):'0','','','','']]});
 });
 const pc=doc.getNumberOfPages();for(let i=1;i<=pc;i++){doc.setPage(i);doc.setFontSize(8);doc.text('Page '+i+' of '+pc,W/2,doc.internal.pageSize.getHeight()-6,{align:'center'})}
 doc.save('STEM_StudentWise_'+R_name(nm)+(RF.u&&L.length===1?'_'+R_name(L[0][1].n):'')+'.pdf');
}
function pdfTest(id,pat){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const ids=id?[id]:Object.keys(RP).filter(k=>RP[k].rows.length&&(!pat||RP[k].pat===pat));
 if(!ids.length){alert('No results to download yet.');return}
 const doc=new window.jspdf.jsPDF(),W=doc.internal.pageSize.getWidth();
 const today=new Date().toLocaleDateString('en-GB');
 ids.forEach((k,n)=>{
  const R=RP[k];if(n>0)doc.addPage();
  const secs=[...new Set(R.rows.flatMap(r=>Object.keys(r.sec)))];
  doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('STEM COACHING INSTITUTE',W/2,14,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('NEET / Board / Medical / Foundation | Pargyapuram, Lakhpedabagh, Barabanki | 9236990414',W/2,20,{align:'center'});
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Result: '+R.title,W/2,29,{align:'center'});
  const sc=R.rows.map(r=>r.sc),avg=(sc.reduce((a,b)=>a+b,0)/sc.length).toFixed(1);
  doc.setFont('helvetica','normal');doc.setFontSize(9);
  doc.text('Date: '+today+'   Students: '+R.rows.length+'   Maximum marks: '+R.max+'   Highest: '+Math.max(...sc)+'   Average: '+avg,W/2,35,{align:'center'});
  doc.autoTable({startY:40,styles:{fontSize:8,cellPadding:1.6},headStyles:{fillColor:[23,48,107]},
   head:[['Rank','Name',...secs,'Correct','Wrong','Not attempted','Total','%']],
   body:R.rows.map(r=>[r.rank,r.n,...secs.map(s=>r.sec[s]??0),r.ok,r.bad,r.un,r.sc,R.max?(r.sc/R.max*100).toFixed(1):'0'])});
 });
 const pc=doc.getNumberOfPages();
 for(let i=1;i<=pc;i++){doc.setPage(i);doc.setFontSize(8);doc.text('Page '+i+' of '+pc,W/2,doc.internal.pageSize.getHeight()-6,{align:'center'})}
 doc.save('STEM_Results_'+(id?R_name(RP[id].title):pat?R_name(pat==='custom'?'Custom':(PN[pat]||pat)):'All_Tests')+'.pdf');
}
const R_name=s=>String(s).replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'')||'Test';

/* ---------- PAYMENTS AND RECEIPTS ---------- */
let PAYS=[];
const payMs=p=>p.date&&p.date.toMillis?p.date.toMillis():0;
const payDt=p=>p.date&&p.date.toDate?p.date.toDate().toLocaleDateString('en-GB'):'';
function rupWords(n){
 n=Math.round(n);
 const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
 const two=x=>x<20?a[x]:b[x/10|0]+(x%10?' '+a[x%10]:'');
 const three=x=>(x>=100?a[x/100|0]+' Hundred'+(x%100?' ':''):'')+(x%100?two(x%100):'');
 let r='';const c=n/10000000|0,l=(n/100000|0)%100,t=(n/1000|0)%100,h=n%1000;
 if(c)r+=two(c)+' Crore ';if(l)r+=two(l)+' Lakh ';if(t)r+=two(t)+' Thousand ';if(h)r+=three(h);
 return (r.trim()||'Zero')+' Rupees Only';
}
function receiptPdf(id){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const p=PAYS.find(x=>x.id===id);if(!p)return;
 const doc=new window.jspdf.jsPDF({format:'a5'}),W=doc.internal.pageSize.getWidth();
 doc.setDrawColor(23,48,107);doc.setLineWidth(0.6);doc.rect(6,6,W-12,doc.internal.pageSize.getHeight()-12);
 doc.setFont('helvetica','bold');doc.setFontSize(16);doc.setTextColor(23,48,107);doc.text('STEM COACHING INSTITUTE',W/2,18,{align:'center'});
 doc.setTextColor(0);doc.setFont('helvetica','normal');doc.setFontSize(9);
 doc.text('NEET / Board / Medical / Foundation',W/2,24,{align:'center'});
 doc.text('Pargyapuram, Lakhpedabagh, Barabanki | 9236990414',W/2,29,{align:'center'});
 doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('FEE RECEIPT',W/2,40,{align:'center'});
 const rows=[['Receipt No.',p.no||''],['Date',payDt(p)],['Received from',p.name||''],['Roll No.',p.roll||''],['Class',p.cls||''],['Towards',p.seriesTitle||p.series||''],['Amount','Rs. '+p.amount+'/-'],['In words',rupWords(p.amount)],['Payment mode',p.method||'']];
 if(p.note)rows.push(['Note',p.note]);
 doc.autoTable({startY:46,theme:'grid',body:rows,styles:{fontSize:10,cellPadding:2.2,lineColor:[150,150,150]},columnStyles:{0:{fontStyle:'bold',cellWidth:34,fillColor:[238,241,248]}},margin:{left:12,right:12}});
 const y=doc.lastAutoTable.finalY+10;
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('Received with thanks. Fee once paid is not refundable.',12,y);
 doc.text('Authorised Signatory',W-12,y+22,{align:'right'});
 doc.save('Receipt_'+String(p.no||'STEM').replace(/[^A-Za-z0-9]+/g,'_')+'.pdf');
}
const payCard=(p,t)=>`<div class="card"><b>${esc(p.no||'')}</b> | ${esc(payDt(p))}<br>${t?esc(p.name||'')+' ('+esc(p.roll||'')+')<br>':''}${esc(p.seriesTitle||p.series||'')}<br>Rs. <b>${esc(p.amount)}</b> by ${esc(p.method||'')}${p.note?' | '+esc(p.note):''}<div class="btns"><button class="s" onclick="receiptPdf('${p.id}')">Receipt PDF</button>${t&&me.email===TEACHER?`<button class="s" onclick="delPay('${p.id}')">Delete</button>`:''}</div></div>`;
async function myReceipts(){
 app.innerHTML='Loading…';
 try{
  const [r,sd,ss]=await Promise.all([db.collection('payments').where('uid','==',me.uid).get(),db.collection('students').doc(me.uid).get(),db.collection('series').get()]);
  PAYS=r.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>payMs(b)-payMs(a));
  const st=sd.data()||{},SR={};ss.forEach(d=>SR[d.id]=d.data());
  const pend=(st.plans||[]).filter(k=>!PAYS.some(p=>p.series===k)).map(k=>{const x=SR[k]||{};return `<b>${esc(x.title||PN[k]||k)}</b>${x.price>0?' - Fee Rs. '+x.price:''}`});
  app.innerHTML=`${sNav('f')}<h3>My fees</h3>`+
   (pend.length?`<div class="card bad"><b>Fee pending</b><br>${pend.join('<br>')}<br><small>If you have already paid, please show your payment to the institute: <a href="tel:9236990414">9236990414</a>.</small></div>`:'<div class="card"><b class="ok">No fee pending.</b></div>')+
   '<div id="pfb"></div>';payFilterUI('pfb',false);
 }catch(e){app.innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
/* ---------- BILL FILTER BY DATE + DOWNLOAD (CSV and PDF) ---------- */
let PF={from:'',to:''};
const payInRange=p=>{const ms=payMs(p);if(PF.from&&ms<new Date(PF.from+'T00:00:00').getTime())return false;if(PF.to&&ms>new Date(PF.to+'T23:59:59').getTime())return false;return true};
const payPeriod=()=>PF.from||PF.to?(PF.from?dmy(PF.from):'start')+' to '+(PF.to?dmy(PF.to):'today'):'All dates';
function payCsv(L,t){
 const rows=[t?['Receipt No.','Date','Student','Roll No.','Class','Series','Mode','Note','Amount (Rs.)']:['Receipt No.','Date','Series','Mode','Note','Amount (Rs.)']];
 L.forEach(p=>rows.push(t?[p.no||'',payDt(p),p.name||'',p.roll||'',p.cls||'',p.seriesTitle||p.series||'',p.method||'',p.note||'',p.amount]:[p.no||'',payDt(p),p.seriesTitle||p.series||'',p.method||'',p.note||'',p.amount]));
 const tot=L.reduce((a,p)=>a+(+p.amount||0),0);
 rows.push(t?['','','','','','','','Total',tot]:['','','','','Total',tot]);
 dl('STEM_bills_'+isoToday()+'.csv',toCsv(rows),'text/csv;charset=utf-8');
}
function payStatementPdf(L,t){
 if(!window.jspdf){pdfLoad().then(function(){alert('PDF tool is ready. Please tap the button again.')},function(){alert('PDF tool could not load. Check your internet and try again.')});return}
 const doc=new window.jspdf.jsPDF({format:'a4'}),W=doc.internal.pageSize.getWidth();
 doc.setFont('helvetica','bold');doc.setFontSize(16);doc.setTextColor(23,48,107);doc.text('STEM COACHING INSTITUTE',W/2,16,{align:'center'});
 doc.setTextColor(0);doc.setFont('helvetica','normal');doc.setFontSize(9);
 doc.text('Pargyapuram, Lakhpedabagh, Barabanki | 9236990414',W/2,22,{align:'center'});
 doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('FEE STATEMENT',W/2,31,{align:'center'});
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('Period: '+payPeriod()+'   |   Bills: '+L.length,W/2,37,{align:'center'});
 const tot=L.reduce((a,p)=>a+(+p.amount||0),0);
 const head=t?[['Receipt No.','Date','Student','Series','Mode','Amount (Rs.)']]:[['Receipt No.','Date','Series','Mode','Amount (Rs.)']];
 const body=L.map(p=>t?[p.no||'',payDt(p),(p.name||'')+(p.roll?' ('+p.roll+')':''),p.seriesTitle||p.series||'',p.method||'',String(p.amount)]:[p.no||'',payDt(p),p.seriesTitle||p.series||'',p.method||'',String(p.amount)]);
 const foot=[t?['','','','','Total',String(tot)]:['','','','Total',String(tot)]];
 doc.autoTable({startY:42,theme:'grid',head,body,foot,showFoot:'lastPage',styles:{fontSize:9,cellPadding:2},headStyles:{fillColor:[23,48,107],textColor:255},footStyles:{fillColor:[238,241,248],textColor:0,fontStyle:'bold'},columnStyles:{[t?5:4]:{halign:'right'}},margin:{left:12,right:12}});
 doc.save('STEM_fee_statement_'+isoToday()+'.pdf');
}
function payFilterUI(id,t){
 const box=$(id);if(!box)return;
 const L=PAYS.filter(payInRange),tot=L.reduce((a,p)=>a+(+p.amount||0),0);
 box.innerHTML=`<div class="card"><h3>Filter bills by date</h3><div class="row"><div style="flex:1"><small>From</small><input id="pf1" type="date" value="${esc(PF.from)}"></div><div style="flex:1"><small>To</small><input id="pf2" type="date" value="${esc(PF.to)}"></div></div><div class="btns"><button id="pfa">Show</button><button class="s" id="pfc">Clear</button></div><div class="btns"><button class="s" id="pfv">Download CSV</button><button class="s" id="pfp">Download PDF</button></div></div><div class="sm"><span>Bills ${L.length}</span><span class="ok">Total Rs. ${tot}</span></div><h3>${t?'Payments':'My receipts'} (${L.length})</h3>`+(L.map(p=>payCard(p,t)).join('')||'<p>No bills found for '+esc(payPeriod())+'.</p>');
 $('pfa').onclick=()=>{const a=$('pf1').value,b=$('pf2').value;if(a&&b&&a>b)return alert('The From date must be before the To date.');PF={from:a,to:b};payFilterUI(id,t)};
 $('pfc').onclick=()=>{PF={from:'',to:''};payFilterUI(id,t)};
 $('pfv').onclick=()=>{if(!L.length)return alert('No bills to download for this period.');payCsv(L,t)};
 $('pfp').onclick=()=>{if(!L.length)return alert('No bills to download for this period.');payStatementPdf(L,t)};
}
async function payView(){
 $('tv').innerHTML='Loading…';
 try{
  const [st,ss,ps]=await Promise.all(['students','series','payments'].map(c=>db.collection(c).get()));
  const S=st.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  const SR=ss.docs.map(d=>({k:d.id,...d.data()})).sort((a,b)=>(a.o??99)-(b.o??99));
  PAYS=ps.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>payMs(b)-payMs(a));
  const today=new Date(),iso=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  const due=[];S.forEach(s=>(s.plans||[]).forEach(k=>{if(!PAYS.some(p=>p.uid===s.id&&p.series===k)){const x=SR.find(z=>z.k===k)||{};due.push(`${esc(s.name||'?')} (${esc(s.roll||'')}): ${esc(x.title||PN[k]||k)}${x.price>0?' - Rs. '+x.price:''}`)}}));
  $('tv').innerHTML=`<div class="card"><h3>Record a payment</h3><select id="fu"><option value="">Choose student</option>${S.map(s=>`<option value="${s.id}">${esc(s.name||'?')} (${esc(s.roll||'')})</option>`).join('')}</select><select id="fk"><option value="">Choose series</option>${SR.map(x=>`<option value="${x.k}" data-p="${x.price||0}">${esc(x.title)}${x.price>0?' - Rs. '+x.price:''}</option>`).join('')}</select><input id="fa" type="number" placeholder="Amount received (Rs.)"><select id="fmth"><option>Cash</option><option>UPI</option><option>Bank transfer</option></select><input id="fd" type="date" value="${iso}"><input id="fn" placeholder="Note (optional, for example coupon used)"><small>Full payment at once. Saving also gives the student access to this series.</small><button id="fs">Save payment</button><p id="fm"></p></div>`+
   `<details class="card"><summary><b>Fees due (${due.length})</b></summary>${due.join('<br>')||'No dues.'}<br><small>Lists students who have a series but no payment recorded for it. Students added before this feature appear here until you record their payment.</small></details>`+
   `<div id="pfb"></div>`;
  payFilterUI('pfb',true);
  $('fk').onchange=()=>{const o=$('fk').selectedOptions[0];if(o&&+o.dataset.p>0)$('fa').value=o.dataset.p};
  $('fs').onclick=async()=>{
   const m=$('fm'),uid=$('fu').value,k=$('fk').value,amt=+$('fa').value;
   if(!uid||!k)return m.textContent='Choose a student and a series.';
   if(!(amt>0))return m.textContent='Enter the amount received.';
   if(!$('fd').value)return m.textContent='Choose the date.';
   if(PAYS.some(p=>p.uid===uid&&p.series===k)&&!confirm('A payment for this student and series is already recorded. Save another one?'))return;
   const s=S.find(x=>x.id===uid),sr=SR.find(x=>x.k===k),d=new Date($('fd').value+'T12:00:00');
   const mx=PAYS.reduce((a,p)=>Math.max(a,parseInt(String(p.no||'').split('/').pop(),10)||0),0);
   const no='STEM/'+d.getFullYear()+'/'+String(mx+1).padStart(4,'0');
   try{
    await db.collection('payments').add({uid,name:s.name||'',roll:s.roll||'',cls:s.cls||'',series:k,seriesTitle:sr.title||k,amount:amt,method:$('fmth').value,note:$('fn').value.trim(),date:firebase.firestore.Timestamp.fromDate(d),no,at:firebase.firestore.FieldValue.serverTimestamp()});
    await db.collection('students').doc(uid).update({plans:firebase.firestore.FieldValue.arrayUnion(k),notests:false});
    await payView();alert('Payment saved. Receipt no. '+no+'. Tap Receipt PDF in the list to download it.');
   }catch(e){m.textContent=e.message}
  };
 }catch(e){$('tv').innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
async function delPay(id){
 if(!confirm('Delete this payment record? The student keeps access to the series; only the record and receipt are removed.'))return;
 try{await db.collection('payments').doc(id).delete();payView()}catch(e){alert(e.message)}
}

/* ---------- STUDENT PROFILE, ATTENDANCE, MARKS ---------- */
const CLS=['6','7','8','9','10','11','12','Dropper'];
const regular0=s=>s.testOnly!==undefined?!s.testOnly:!((s.plans||[]).length>0);
const regular=s=>s.cls==='Dropper'?!!s.attOn:regular0(s);
const clsOpt=v=>CLS.map(c=>`<option${String(v)===c?' selected':''}>${c}</option>`).join('');
const isoToday=()=>{const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')};
const dmy=v=>{const q=String(v||'').split('-');return q.length===3?q[2]+'/'+q[1]+'/'+q[0]:''};
const PHM={t:['&#128221;','My Tests','Mock tests and your test series','#1c6fe6,#0d3f9e'],s:['&#127919;','Test Series','Choose your series','#8a4cf5,#5025b8'],d:['&#128197;','Schedule','Dates and syllabus of tests','#1fa56a,#0e6b43'],f:['&#128179;','My Fees','Payments and receipts','#f59a23,#d9680b'],w:['&#128170;','My Strengths','Strong and weak topics','#14b8c4,#0e7c8a'],m:['&#128210;','Mistake Notebook','Learn from every wrong answer','#e5484d,#b3261e'],q:['&#9889;','Daily Quiz','Quick questions, build your streak','#f5b800,#d98e00'],k:['&#127942;','Topper Wall','This week\'s toppers','#f5b800,#d98e00'],r:['&#127873;','Refer &amp; Earn','Invite friends, earn rewards','#ec4899,#be185d']};
const sNav=a=>{const m=PHM[a];if(!m)return '';return `<div class="phero"><span class="phi" style="background:linear-gradient(135deg,${m[3]})">${m[0]}</span><div class="pht"><b>${m[1]}</b><small>${m[2]}</small></div><button type="button" class="phb" onclick="myProfile()">&#8249; Home</button></div>`};
const sNavOld=a=>`<div class="row tr snav">${[['p','My profile','myProfile'],['t','My tests','studentView'],['s','Test series','catalogue'],['d','Schedule','schedView'],['f','My fees','myReceipts'],['w','My strengths','myStrength'],['m','Mistakes','mistakesView'],['q','Daily quiz','quizView'],['k','Topper wall','wallView'],['r','Refer & earn','referView']].map(([k,l,fn])=>`<button class="${a===k?'':'s'}" onclick="${fn}()">${l}</button>`).join('')}</div>`;
function fileToData(file,mw,mh,q){return new Promise((ok,no)=>{const r=new FileReader();r.onerror=()=>no(new Error('Could not read the photo.'));r.onload=()=>{const im=new Image();im.onerror=()=>no(new Error('This file is not a valid photo.'));im.onload=()=>{const k=Math.min(1,mw/im.width,mh/im.height),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',q))};im.src=r.result};r.readAsDataURL(file)})}
let MYA={},MYM='';
function attHtml(ym){
 const d=MYA[ym]||{},y=+ym.slice(0,4),m=+ym.slice(4),n=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay();
 let P=0,A=0,L=0,H=0,cells='';
 for(let i=0;i<first;i++)cells+='<span></span>';
 for(let i=1;i<=n;i++){const v=d[String(i).padStart(2,'0')]||'';if(v==='P')P++;else if(v==='A')A++;else if(v==='L')L++;else if(v==='H')H++;cells+=`<span class="ad ${v}">${i}</span>`}
 const t=P+A+L,mn=['January','February','March','April','May','June','July','August','September','October','November','December'][m-1];
 let tp=0,tt=0;Object.values(MYA).forEach(o=>Object.values(o).forEach(v=>{if(v==='H')return;tt++;if(v==='P')tp++}));
 return `<div class="row"><button class="s" onclick="attGo(-1)">&lt; Previous</button><button class="s" onclick="attGo(1)">Next &gt;</button></div><h4 style="margin:8px 0">${mn} ${y}</h4><div class="sm"><span class="ok">Present ${P}</span><span class="bad">Absent ${A}</span><span>Leave ${L}</span>${H?`<span>Holiday ${H}</span>`:''}</div><div>${t?'This month: <b>'+Math.round(P/t*100)+'%</b>':'No attendance saved for this month.'}${tt?' | Overall: <b>'+Math.round(tp/tt*100)+'%</b>':''}</div><div class="ag" style="margin-top:8px">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(x=>'<b>'+x+'</b>').join('')}${cells}</div>`;
}
function attGo(k){
 let y=+MYM.slice(0,4),m=+MYM.slice(4)+k;if(m<1){m=12;y--}if(m>12){m=1;y++}
 MYM=y+String(m).padStart(2,'0');$('att').innerHTML=attHtml(MYM);
}
const WQ=[["The expert in anything was once a beginner.",""],["Dream is not that which you see while sleeping; it is that which does not let you sleep.",""],["Arise, awake, and stop not till the goal is reached.",""],["Success is the sum of small efforts, repeated day in and day out.",""],["Do not watch the clock; do what it does. Keep going.",""],["Today's hard work is tomorrow's rank.",""],["Don't stop when you are tired. Stop when you are done.",""],["Your only competition is the student you were yesterday.",""],["Discipline is the bridge between your goals and your results.",""],["One more chapter, one more test, one step closer to your dream.",""],["Mistakes are proof that you are trying. Learn from each one.",""],["Believe in yourself, and half the battle is already won.",""],["Great things never come from comfort zones.",""],["Small progress each day adds up to big results.",""],["Study with focus today so you can celebrate with pride tomorrow.",""],["Fall seven times, stand up eight.",""],["The harder you work for something, the greater you will feel when you achieve it.",""],["It always seems impossible until it is done.",""],["Your dream needs your sweat, not your excuses.",""],["Wake up with determination. Go to bed with satisfaction.",""]];

function welcomeCard(x){const h=new Date().getHours(),g=h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening',n=String((x&&x.name)||'').trim().split(/\s+/)[0]||'Student',q=WQ[Math.floor(Math.random()*WQ.length)];return `<div class="wb"><div class="wtop"><div class="wtx"><div class="g1">${g},</div><div class="g2">${esc(n)}!</div><div class="ul"></div><div class="g3">Welcome to STEM Coaching Institute</div></div><img class="wimg" alt="" src="${WIMG}"></div><div class="g4">${esc(q[0])}</div></div>`}
function tgCard(){return '<div class="tg"><span class="tgi">&#127942;</span><div><div class="t1">Together Towards</div><div class="t2">Excellence</div></div><span class="tgi">&#127891;</span></div>'}
function pTgl(id){document.querySelectorAll('.pp').forEach(e=>{e.hidden=e.id===id?!e.hidden:true})}
function profReads(uid){return Promise.all([db.collection('students').doc(uid).get(),db.collection('photos').doc(uid).get(),db.collection('attendance').where('uid','==',uid).get(),db.collection('marks').where('uid','==',uid).get(),db.collection('tests').get(),db.collection('results').where('uid','==',uid).get()])}
async function myProfile(){
 wmOff();app.innerHTML='Loading…';
 try{
  const pre=window.__pre;window.__pre=null;
  const [sd,ph,at,mk,tsn,rsn]=await (pre||profReads(me.uid));
  if(!sd.exists){app.innerHTML='<div class="card">Your account is not active. Please contact STEM Coaching Institute.</div>';return}
  const x=sd.data();MYA={};at.forEach(d=>{const o=d.data();MYA[o.ym]=o.d||{}});
  const t=new Date();MYM=t.getFullYear()+String(t.getMonth()+1).padStart(2,'0');
  const TS=new Set(tsn.docs.map(d=>d.id)),RS=new Set(rsn.docs.map(d=>d.data().testId));
  const M=mk.docs.map(d=>d.data()).filter(m=>m.classTest||!TS.has(m.testId)||RS.has(m.testId)).sort((a,b)=>(b.t0||0)-(a.t0||0)),L=M[0];
  const photo=ph.exists&&String(ph.data().d).startsWith('data:image/')?`<img class="ph" src="${ph.data().d}" alt="Photo">`:'<div class="ph" style="display:flex;align-items:center;justify-content:center;font-size:2.4rem;background:#8882">'+esc((x.name||'?').charAt(0).toUpperCase())+'</div>';
  const row=(l,v)=>v?`<div><small>${l}</small><br><b>${esc(v)}</b></div>`:'';
  const av=ph.exists&&String(ph.data().d).startsWith('data:image/')?`<span class="pav" style="background-image:url(${ph.data().d})"></span>`:`<span class="pav">${esc((x.name||'?').charAt(0).toUpperCase())}</span>`,hasAtt=!(x.cls==='Dropper'&&!regular(x)),tile=(id,c,ic,a,b)=>`<button type="button" class="tl ${c}" onclick="pTgl('${id}')"><span class="tic">${ic}</span><span>${a}<br>${b}</span></button>`;
  app.innerHTML=sNav('p')+`<button type="button" class="prw" onclick="pTgl('pp1')">${av}<span class="prt"><b>My Profile</b><small>(photo, name, roll number)</small></span><span class="tch">&#8250;</span></button><div class="tls">`+tile('pp2','tl-b','&#9998;','Edit Details','and ID Card')+tile('pp3','tl-p','&#128202;','Last Test','and Results')+(hasAtt?tile('pp4','tl-g','&#128197;','Attendance','this month'):'')+`</div>`+
   `<div class="pp" id="pp1" hidden><div class="card pf">${photo}<div><h3 style="margin:0 0 6px">${esc(x.name||'')}</h3>${row('Roll no.',x.roll)}${row('Class',x.cls)}${row("Father's name",x.father)}${row("Mother's name",x.mother)}${row('Date of birth',dmy(x.dob))}${row('Mobile',x.mobile)}${row('Address',x.addr)}</div></div></div>`+`<div class="pp" id="pp2" hidden><div class="card"><button class="s" onclick="editD('${me.uid}')">Edit my details / change photo</button><button class="s" onclick="idPdf(['${me.uid}'],this)">Download my ID card</button><div id="pd${me.uid}"></div></div></div>`+
   (hasAtt?`<div class="pp" id="pp4" hidden><div class="card mzx"><h3 style="margin-top:0">Attendance</h3><div id="att">${attHtml(MYM)}</div></div></div>`:'')+
   `<div class="pp" id="pp3" hidden><div class="card mzx"><h3 style="margin-top:0">Last test</h3>`+(L?`<b>${esc(L.title)}</b><div class="big">${L.sc} / ${L.max}</div>${L.classTest?'<small>Class test (marks given by teacher)</small>':`<div class="rst lt"><div class="t-ok"><b>${L.ok}</b>Correct</div><div class="t-bad"><b>${L.bad}</b>Wrong</div><div class="t-un"><b>${L.un}</b>Not attempted</div></div>`}<div class="rsec lt">`+Object.entries(L.sec||{}).map(([k,v])=>'<span>'+esc(k)+': <b>'+v+'</b></span>').join('')+'</div>'+(L.rank?`<p class="rk">Rank: <b>${L.rank}</b> of ${L.of}</p>`:''):'Your marks will appear here after your test is checked.')+(M.length>1?`<details><summary>Earlier tests (${M.length-1})</summary>${M.slice(1).map(m=>esc(m.title)+': <b>'+m.sc+' / '+m.max+'</b>'+(m.rank?' (Rank '+m.rank+' of '+m.of+')':'')).join('<br>')}</details>`:'')+'</div></div>'+welcomeCard(x)+tgCard();
 }catch(e){app.innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
async function editD(uid){
 const box=$('pd'+uid);box.innerHTML='Loading…';
 try{
  const [sd,pd]=await Promise.all([db.collection('students').doc(uid).get(),db.collection('photos').doc(uid).get()]);
  const x=sd.data()||{};
  box.innerHTML=`<input id="dn${uid}" value="${esc(x.name||'')}" placeholder="Student name"><select id="dc${uid}" onchange="var w=document.getElementById('dkw${uid}');if(w)w.style.display=this.value==='Dropper'?'':'none'">${clsOpt(x.cls)}</select><input id="df${uid}" value="${esc(x.father||'')}" placeholder="Father's name"><input id="dm${uid}" value="${esc(x.mother||'')}" placeholder="Mother's name"><label>Date of birth</label><input id="dd${uid}" type="date" value="${esc(x.dob||'')}"><input id="dp${uid}" type="tel" value="${esc(x.mobile||'')}" placeholder="Mobile number (10 digits)"><textarea id="da${uid}" rows="2" placeholder="Address">${esc(x.addr||'')}</textarea>${pd.exists&&String(pd.data().d).startsWith('data:image/')?`<img class="ph" src="${pd.data().d}" alt="Photo">`:''}<label>Photo (take a new one or choose from gallery)</label><input id="dh${uid}" type="file" accept="image/*">${me.email===TEACHER?`<label class="opt"><input type="checkbox" id="dt${uid}" ${regular0(x)?'':'checked'}>Test series only (no class attendance)</label><div id="dkw${uid}" style="display:${x.cls==='Dropper'?'':'none'}"><label class="opt"><input type="checkbox" id="dk${uid}" ${x.attOn?'checked':''}>Dropper: take class attendance (off by default)</label></div>`:''}<button onclick="saveD('${uid}')">Save details</button><p id="dx${uid}"></p>`;
 }catch(e){box.innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function saveD(uid){
 const m=$('dx'+uid),g=k=>$(k+uid).value.trim(),mob=g('dp');
 if(g('dn').length<2)return m.textContent='Enter the student name.';
 if(mob&&!/^[0-9]{10}$/.test(mob))return m.textContent='Mobile number must be 10 digits.';
 try{
  m.textContent='Saving…';
  const f=$('dh'+uid).files[0];
  if(f){const d=await fileToData(f,300,400,0.72);if(d.length>300000)throw new Error('The photo is too large. Please choose another photo.');await db.collection('photos').doc(uid).set({d,at:firebase.firestore.FieldValue.serverTimestamp()})}
  const u={name:g('dn'),cls:g('dc'),father:g('df'),mother:g('dm'),dob:g('dd'),mobile:mob,addr:g('da')};
  if(me.email===TEACHER&&$('dt'+uid))u.testOnly=$('dt'+uid).checked;
  if(me.email===TEACHER&&$('dk'+uid)&&(u.cls==='Dropper'||$('dk'+uid).checked))u.attOn=u.cls==='Dropper'&&$('dk'+uid).checked;
  await db.collection('students').doc(uid).update(u);
  m.textContent='Saved.';if(me.email!==TEACHER&&uid===me.uid)setTimeout(myProfile,600);
 }catch(e){m.textContent=e.message}
}

/* ---------- CLASS TESTS (offline, class 6 to 12): teacher gives marks ---------- */
let CTL=[];
async function ctView(){
 $('tv').innerHTML='Loading…';
 try{
  const [st,mk]=await Promise.all([db.collection('students').get(),db.collection('marks').get()]);
  CTL=st.docs.map(d=>({id:d.id,...d.data()}));
  const G={};mk.docs.filter(d=>d.data().classTest).forEach(d=>{const x=d.data();(G[x.testId]=G[x.testId]||{...x,n:0}).n++});
  const old=Object.values(G).sort((a,b)=>(b.t0||0)-(a.t0||0));
  $('tv').innerHTML=`<div class="card"><h3>Class test marks (offline)</h3><select id="kc"><option value="">Select class</option>${['6','7','8','9','10','11','12'].map(c=>`<option>${c}</option>`).join('')}</select><input id="kt" placeholder="Test name (for example Unit Test 1 Maths)"><label>Test date</label><input id="kd" type="date" value="${isoToday()}"><input id="kx" type="number" placeholder="Maximum marks"><button id="kl">Show students</button><small>Marks appear in each student's profile under Last test. Leave a box empty for an absent student. Saving again with the same class, test name and date updates the marks. Students who only joined a test series are not listed.</small></div><div id="klist"></div>`+
   (old.length?'<div class="card"><h3>Earlier class tests</h3>'+old.map(x=>`<div>${esc(x.title)} (Class ${esc(x.cls||'')}, ${x.t0?new Date(x.t0).toLocaleDateString('en-GB'):''}) - ${x.n} students <a href="#" onclick="ctDel('${x.testId}');return false">delete</a></div>`).join('')+'</div>':'');
  $('kl').onclick=ctLoad;
 }catch(e){$('tv').innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
async function ctLoad(){
 const c=$('kc').value,t=$('kt').value.trim(),d=$('kd').value,mx=+$('kx').value,b=$('klist');
 if(!c||!t||!d||!(mx>0))return b.innerHTML='<p class="bad">Select the class, type the test name, choose the date and enter the maximum marks.</p>';
 const tid='ct_'+d+'_'+c+'_'+R_name(t)+'_'+[...t].reduce((a,ch)=>(a*31+ch.charCodeAt(0))>>>0,7).toString(36);
 b.innerHTML='Loading…';
 try{
  const ex={};(await db.collection('marks').where('testId','==',tid).get()).forEach(x=>ex[x.data().uid]=x.data().sc);
  const L=CTL.filter(s=>String(s.cls||'')===c&&regular(s)).sort((a,z)=>String(a.name||'').localeCompare(String(z.name||'')));
  b.innerHTML=(L.map(s=>`<div class="card ar"><span>${esc(s.name||'?')} <small>(${esc(s.roll||'')})</small></span><input class="kin" type="number" step="any" id="km${s.id}" value="${ex[s.id]??''}" placeholder="/ ${mx}"></div>`).join('')||'<p>No students in this class.</p>')+(L.length?'<button id="ksv">Save marks</button><p id="kmsg"></p>':'');
  if(L.length)$('ksv').onclick=()=>ctSave(tid,c,t,d,mx,L);
 }catch(e){b.innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function ctSave(tid,c,t,d,mx,L){
 const m=$('kmsg'),E=[],A=[];m.className='';m.textContent='Saving…';
 for(const s of L){const v=$('km'+s.id).value.trim();if(v==='')A.push(s.id);else{const n=+v;if(!(n>=0&&n<=mx))return m.innerHTML='<span class="bad">Marks of '+esc(s.name)+' must be from 0 to '+mx+'.</span>';E.push({uid:s.id,sc:n})}}
 E.sort((a,b)=>b.sc-a.sc);E.forEach((r,i)=>r.rank=(i>0&&r.sc===E[i-1].sc)?E[i-1].rank:i+1);
 const t0=new Date(d+'T09:00:00').getTime(),ts=firebase.firestore.FieldValue.serverTimestamp();
 try{
  const b=db.batch();
  E.forEach(r=>b.set(db.collection('marks').doc(tid+'_'+r.uid),{uid:r.uid,testId:tid,title:t,sc:r.sc,max:mx,ok:0,bad:0,un:0,sec:{},rank:r.rank,of:E.length,t0,cls:c,classTest:true,saved:ts}));
  A.forEach(u=>b.delete(db.collection('marks').doc(tid+'_'+u)));
  await b.commit();m.className='ok';m.textContent='Saved marks of '+E.length+' students.';
 }catch(e){m.className='bad';m.textContent=e.message}
}
async function ctDel(tid){
 if(!confirm('Delete this class test and its marks for all students?'))return;
 try{const r=await db.collection('marks').where('testId','==',tid).get();const b=db.batch();r.forEach(x=>b.delete(x.ref));await b.commit();ctView()}catch(e){alert(e.message)}
}
/* attendance (teacher) */
let ATS=[],ATV={};
async function attView(){
 $('tv').innerHTML='Loading…';
 try{
  const st=await db.collection('students').get();
  ATS=st.docs.map(d=>({id:d.id,...d.data()})).filter(regular).sort((a,b)=>String(a.cls||'').localeCompare(String(b.cls||''),undefined,{numeric:true})||String(a.name||'').localeCompare(String(b.name||'')));
  $('tv').innerHTML=`<div class="card"><h3>Daily attendance</h3><input id="ad" type="date" value="${isoToday()}"><select id="ac"><option value="">All classes</option>${CLS.map(c=>'<option>'+c+'</option>').join('')}</select><select id="af" onchange="attDraw()"><option value="">Show: Present, Absent and Leave</option><option value="P">Show: Present only</option><option value="A">Show: Absent only</option><option value="L">Show: Leave only</option><option value="H">Show: Holiday only</option></select><input id="aq" placeholder="Search student name or roll no." oninput="attDraw()"><button id="al">Show students</button><small>Everyone starts as Present (P). Tap a name's button to change it: P = present, A = absent, L = leave, H = holiday (holidays are not counted in attendance percentage). Students who only joined a test series are not listed here. Dropper students are listed only if attendance is turned on for them (Admission of student, Details and photo).</small></div><div id="alist"></div>`;
  $('al').onclick=loadAtt;$('ad').onchange=loadAtt;$('ac').onchange=loadAtt;loadAtt();
 }catch(e){$('tv').innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
let ATL=[],ATSV={};
async function loadAtt(){
 const dv=$('ad').value,c=$('ac').value;
 if(!dv)return $('alist').innerHTML='<p class="bad">Choose the date.</p>';
 $('alist').innerHTML='Loading…';
 try{
  const ym=dv.slice(0,4)+dv.slice(5,7),dd=dv.slice(8,10),sv={};
  (await db.collection('attendance').where('ym','==',ym).get()).forEach(d=>{const o=d.data();if(o.d&&o.d[dd])sv[o.uid]=o.d[dd]});
  ATSV=sv;ATL=ATS.filter(s=>!c||String(s.cls||'')===c);ATV={};ATL.forEach(s=>ATV[s.id]=sv[s.id]||'P');
  attDraw();
 }catch(e){$('alist').innerHTML='<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
function attDraw(){
 const dv=$('ad').value,ym=dv.slice(0,4)+dv.slice(5,7),dd=dv.slice(8,10),f=$('af').value,q=$('aq').value.trim().toLowerCase();
 const L=ATL.filter(s=>(!f||ATV[s.id]===f)&&(!q||((s.name||'')+' '+(s.roll||'')).toLowerCase().includes(q)));
 $('alist').innerHTML=`<div class="sm" id="asum"></div>`+(L.map(s=>`<div class="card ar"><span>${esc(s.name||'?')} <small>(${esc(s.roll||'')}, Class ${esc(s.cls||'-')})</small></span><button id="ab${s.id}" class="at ${ATV[s.id]}" onclick="atTog('${s.id}')">${ATV[s.id]}</button></div>`).join('')||'<p>No students match.</p>')+(ATL.length?`<div class="row"><button class="s" id="ahd">Holiday for everyone in this list</button><button class="s" id="apr">Everyone present</button></div><button id="asv">Save attendance for ${dmy(dv)}</button><p id="amsg"><small>${Object.keys(ATSV).length?'Attendance already saved for this date is shown.':''} Saving stores all ${ATL.length} students of this list, not only the ones shown.</small></p>`:'');
 atSum();
 if(ATL.length){$('ahd').onclick=()=>{ATL.forEach(x=>ATV[x.id]='H');attDraw()};$('apr').onclick=()=>{ATL.forEach(x=>ATV[x.id]='P');attDraw()}}
 if(ATL.length)$('asv').onclick=async()=>{
  const m=$('amsg');m.textContent='Saving…';
  try{
   const ids=Object.keys(ATV);
   for(let i=0;i<ids.length;i+=400){const b=db.batch();ids.slice(i,i+400).forEach(u=>b.set(db.collection('attendance').doc(u+'_'+ym),{uid:u,ym,d:{[dd]:ATV[u]}},{merge:true}));await b.commit()}
   m.innerHTML='<b class="ok">Saved for '+ids.length+' students.</b>';
  }catch(e){m.innerHTML='<span class="bad">'+esc(e.message)+'</span>'}
 };
}
function atSum(){const v=Object.values(ATV),n=k=>v.filter(x=>x===k).length;const e=$('asum');if(e)e.innerHTML='<span class="ok">Present '+n('P')+'</span><span class="bad">Absent '+n('A')+'</span><span>Leave '+n('L')+'</span><span>Holiday '+n('H')+'</span>'}
function atTog(u){const n={P:'A',A:'L',L:'H',H:'P'}[ATV[u]]||'P';ATV[u]=n;const b=$('ab'+u);b.className='at '+n;b.textContent=n;atSum()}
/* saving marks for students (kept even if a test is deleted) */
async function syncMarks(MK){
 const el=()=>$('mkst');
 try{
  if(!MK.length)return;
  const ex=await db.collection('marks').get(),E={};ex.forEach(d=>E[d.id]=d.data());
  const ch=MK.filter(m=>{const e=E[m.id];return !e||['sc','max','ok','bad','un','rank','of','title','t0'].some(k=>e[k]!==m[k])});
  for(let i=0;i<ch.length;i+=400){const b=db.batch();ch.slice(i,i+400).forEach(m=>{const {id,...o}=m;b.set(db.collection('marks').doc(id),{...o,saved:firebase.firestore.FieldValue.serverTimestamp()})});await b.commit()}
  if(el())el().innerHTML='<small>Student marks saved: '+MK.length+' ('+ch.length+' new or changed). Students see their last test in My profile.</small>';
 }catch(e){if(el())el().innerHTML='<small class="bad">Could not save student marks: '+esc(e.message)+'</small>'}
}
/* backup */
const toCsv=rows=>'\ufeff'+rows.map(r=>r.map(v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')).join('\r\n');
const plain=o=>o&&typeof o==='object'?(typeof o.toDate==='function'?o.toDate().toISOString():Array.isArray(o)?o.map(plain):Object.fromEntries(Object.entries(o).map(([k,v])=>[k,plain(v)]))):o;
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function backupView(){
 $('tv').innerHTML=`<div class="card"><h3>Backup and downloads</h3><small>Your data stays in Firebase until someone deletes it, and saved student marks stay even if a test is deleted. Still, download a copy now and then and keep it safe (Google Drive or your phone).</small><button id="bj">Download full backup (JSON)</button><small>Includes students, results, marks, attendance, payments, tests, questions and answer keys. Photos and question pictures are not included.</small><button id="bm" class="s">Download all marks (Excel / CSV)</button><label>Attendance month</label><input id="bam" type="month" value="${isoToday().slice(0,7)}"><button id="ba" class="s">Download attendance of this month (CSV)</button><p id="bx"></p></div>`;
 const msg=t=>{$('bx').textContent=t};
 $('bj').onclick=async()=>{
  msg('Preparing backup…');
  try{
   const out={saved:new Date().toISOString()};
   for(const c of ['students','results','marks','attendance','payments','tests','qbank','keys','series','coupons']){const q=await db.collection(c).get();out[c]={};q.forEach(d=>out[c][d.id]=plain(d.data()))}
   dl('STEM_backup_'+isoToday()+'.json',JSON.stringify(out),'application/json');msg('Backup downloaded.');
  }catch(e){msg('Could not make the backup: '+e.message)}
 };
 $('bm').onclick=async()=>{
  msg('Preparing…');
  try{
   const [st,mk]=await Promise.all([db.collection('students').get(),db.collection('marks').get()]);const S={};st.forEach(d=>S[d.id]=d.data());
   const rows=mk.docs.map(d=>d.data()).sort((a,b)=>(b.t0||0)-(a.t0||0)||(a.rank||0)-(b.rank||0));
   dl('STEM_marks_'+isoToday()+'.csv',toCsv([['Test','Date','Student','Roll','Class','Score','Max','Correct','Wrong','Not attempted','Rank','Out of']].concat(rows.map(m=>{const s=S[m.uid]||{};return [m.title,m.t0?new Date(m.t0).toLocaleDateString('en-GB'):'',s.name||'(deleted)',s.roll||'',s.cls||'',m.sc,m.max,m.ok,m.bad,m.un,m.rank,m.of]}))),'text/csv');msg('Marks downloaded.');
  }catch(e){msg('Could not download: '+e.message)}
 };
 $('ba').onclick=async()=>{
  const v=$('bam').value;if(!v)return msg('Choose the month.');
  msg('Preparing…');
  try{
   const ym=v.slice(0,4)+v.slice(5,7),[st,at]=await Promise.all([db.collection('students').get(),db.collection('attendance').where('ym','==',ym).get()]);
   const A={};at.forEach(d=>{const o=d.data();A[o.uid]=o.d||{}});
   const rows=st.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.cls||'').localeCompare(String(b.cls||''),undefined,{numeric:true})||String(a.name||'').localeCompare(String(b.name||'')));
   const days=Array.from({length:31},(_,i)=>String(i+1).padStart(2,'0'));
   dl('STEM_attendance_'+v+'.csv',toCsv([['Student','Roll','Class',...days.map(Number),'Present','Absent','Leave','Holiday']].concat(rows.map(s=>{const o=A[s.id]||{},c=k=>days.filter(d=>o[d]===k).length;return [s.name||'',s.roll||'',s.cls||'',...days.map(d=>o[d]||''),c('P'),c('A'),c('L'),c('H')]}))),'text/csv');msg('Attendance downloaded.');
  }catch(e){msg('Could not download: '+e.message)}
 };
}
const MODEOPT=v=>`<option value="online"${v!=='offline'?' selected':''}>Online (tests on the website)</option><option value="offline"${v==='offline'?' selected':''}>Offline at centre</option>`;
async function seriesView(){
 $('tv').innerHTML='Loading…';
 try{
  const s=await db.collection('series').get(),rows=s.docs.map(d=>({k:d.id,...d.data()})).sort((a,b)=>(a.o??99)-(b.o??99));
  $('tv').innerHTML=`<div class="card"><h3>Add test series</h3><input id="vt" placeholder="Series name (for example Darpan)"><input id="vd" placeholder="Short description"><input id="vp" type="number" placeholder="Price in rupees"><input id="vc" placeholder="Class (leave blank for all)"><select id="vo">${MODEOPT('online')}</select><select id="vx">${EXAMOPT('')}</select><button id="vs">Add series</button><p id="vm"></p></div>`+
   `<div class="card"><button id="vz">${rows.length?'Reset the 10 standard series to default names and prices':'Create the 10 standard series'}</button><small>Darpan ₹6000 (Class 10) and Prabhutva ₹7000 (Class 12) are offline at the centre. Full NEET ₹1475, Biology only ₹700, Physics only ₹700 and Chemistry only ₹700, each as an online and an offline series.</small></div>`+
   rows.map(x=>`<div class="card"><b>${esc(x.title)}</b> <small>(${esc(x.k)})</small><br>${modeBadge(x)}${examOf(x)?'<span class="bo">'+examOf(x)+'</span>':''}<br>${esc(x.desc||'')}<br>Price: ${x.price>0?'₹'+x.price:'not set'} | Class: ${esc(x.cls||'all')} | <b>${x.active===false?'Hidden':'Visible'}</b><div class="btns"><button class="s" onclick="editV('${x.k}')">Edit</button><button class="s" onclick="togV('${x.k}')">${x.active===false?'Show to students':'Hide'}</button></div><button class="s" onclick="delV('${x.k}')">Delete series</button><div id="ve${x.k}"></div></div>`).join('');
  $('vs').onclick=async()=>{
   const t=$('vt').value.trim(),pr=+$('vp').value,mode=$('vo').value,k=(t.toLowerCase().replace(/[^a-z0-9]/g,''))+(mode==='offline'?'off':''),m=$('vm');
   if(!t||!k||k==='custom')return m.textContent='Please enter a series name.';
   if(!(pr>=0)||$('vp').value==='')return m.textContent='Please enter the price (0 or more).';
   try{
    if((await db.collection('series').doc(k).get()).exists)return m.textContent='A series with this name and type already exists.';
    await db.collection('series').doc(k).set({title:t,desc:$('vd').value.trim(),price:pr,cls:$('vc').value.trim(),mode,exam:$('vx').value,active:true,o:Date.now()});
    seriesView();
   }catch(e){m.textContent=e.message}
  };
  $('vz').onclick=async()=>{
   if(rows.length&&!confirm('This resets the names, descriptions, prices and visibility of the 10 standard series. Continue?'))return;
   const N='Physics 45, Chemistry 45 and Biology 90 questions',D=[
    ['darpan','Darpan','Class 10 UP Board test series: 10 tests each in Science, Maths and SST. Held OFFLINE AT CENTRE.',6000,'10','offline'],
    ['prabhutva','Prabhutva','Class 12 test series: 10 tests each in Physics, Chemistry and Maths/Bio. Held OFFLINE AT CENTRE.',7000,'12','offline'],
    ['neet','Full NEET (Physics + Chemistry + Biology)','Combo for all three subjects: '+N+'. Online tests (+4 / −1).',1475,'','online'],
    ['bio','Biology only','Biology-only online tests: 90 questions (+4 / −1).',700,'','online'],
    ['phy','Physics only','Physics-only online tests: 45 questions (+4 / −1).',700,'','online'],
    ['chem','Chemistry only','Chemistry-only online tests: 45 questions (+4 / −1).',700,'','online'],
    ['neetoff','Full NEET (Physics + Chemistry + Biology)','Combo for all three subjects: '+N+'. Held OFFLINE AT CENTRE.',1475,'','offline'],
    ['biooff','Biology only','Biology-only tests: 90 questions. Held OFFLINE AT CENTRE.',700,'','offline'],
    ['phyoff','Physics only','Physics-only tests: 45 questions. Held OFFLINE AT CENTRE.',700,'','offline'],
    ['chemoff','Chemistry only','Chemistry-only tests: 45 questions. Held OFFLINE AT CENTRE.',700,'','offline']];
   try{const b=db.batch();D.forEach((x,i)=>b.set(db.collection('series').doc(x[0]),{title:x[1],desc:x[2],price:x[3],cls:x[4],mode:x[5],active:true,o:i+1}));await b.commit();seriesView()}catch(e){alert(e.message)}
  };
 }catch(e){$('tv').innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function editV(k){
 const x=(await db.collection('series').doc(k).get()).data()||{};
 $('ve'+k).innerHTML=`<input id="et${k}" value="${esc(x.title||'')}" placeholder="Series name"><input id="ed${k}" value="${esc(x.desc||'')}" placeholder="Description"><input id="ep${k}" type="number" value="${x.price??''}" placeholder="Price in rupees"><input id="ec${k}" value="${esc(x.cls||'')}" placeholder="Class (blank for all)"><select id="eo${k}">${MODEOPT(x.mode)}</select><select id="ex${k}">${EXAMOPT(examOf({k,...x}))}</select><button onclick="saveV('${k}')">Save changes</button><p id="em${k}" class="bad"></p>`;
}
async function saveV(k){
 const t=$('et'+k).value.trim(),pr=+$('ep'+k).value;
 if(!t||$('ep'+k).value===''||!(pr>=0))return $('em'+k).textContent='Please enter the name and the price.';
 try{await db.collection('series').doc(k).update({title:t,desc:$('ed'+k).value.trim(),price:pr,cls:$('ec'+k).value.trim(),mode:$('eo'+k).value,exam:$('ex'+k).value});seriesView()}catch(e){$('em'+k).textContent=e.message}
}
let CPD={},CPR=[];
async function couponsView(){
 $('tv').innerHTML='Loading…';
 try{
  const q=await db.collection('coupons').get(),rows=q.docs.map(d=>({k:d.id,...d.data()})).sort((a,b)=>String(a.k).localeCompare(String(b.k)));
  CPD={};rows.forEach(x=>CPD[x.k]=x);
  const now=Date.now(),st=x=>x.active===false?'Off':(x.exp&&now>x.exp)?'Expired':(x.max>0&&(x.used||0)>=x.max)?'Limit reached':'Live';
  $('tv').innerHTML=`<div class="card"><h3>Add coupon code</h3><input id="gc" placeholder="Coupon code (letters and numbers, for example DIWALI25)" autocapitalize="characters"><input id="gp" type="number" placeholder="Discount percent (1 to 100)"><label>Last valid date (leave blank for no expiry)</label><input id="ge" type="date"><input id="gl" type="number" placeholder="Usage limit: how many times it can be used (blank = unlimited)"><input id="gn" placeholder="Institute / partner name (optional)"><input id="gk" type="number" placeholder="Partner commission percent (optional)"><button id="gs">Add coupon</button><p id="gm"></p></div>`+
   (rows.length?'':'<div class="card">No coupons yet.<button id="gz">Create standard coupons STEM20, STEM30, STEM40, STEM50</button></div>')+
   rows.map(x=>`<div class="card"><b>${esc(x.k)}</b> <small>${x.pct}% off | <b>${st(x)}</b></small><div><small>Used ${x.used||0}${x.max>0?' of '+x.max:' (no limit)'} | ${x.exp?'valid till '+dmy(x.expd||new Date(x.exp+19800000).toISOString().slice(0,10)):'no expiry'}${x.partner?' | '+esc(x.partner):''}${x.comm>0?' | commission '+x.comm+'%':''} | works on every series</small></div><details><summary>Edit limits and partner</summary><label>Last valid date</label><input id="ced${x.k}" type="date" value="${esc(x.expd||'')}"><input id="clm${x.k}" type="number" placeholder="Usage limit (blank = unlimited)" value="${x.max>0?x.max:''}"><input id="cpn${x.k}" placeholder="Institute / partner name" value="${esc(x.partner||'')}"><input id="ccm${x.k}" type="number" placeholder="Commission percent" value="${x.comm>0?x.comm:''}"><button onclick="saveC('${x.k}')">Save changes</button></details><div class="btns"><button class="s" onclick="togC('${x.k}')">${x.active===false?'Turn on':'Turn off'}</button><button class="s" onclick="delC('${x.k}')">Delete</button></div></div>`).join('')+
   `<div class="card"><h3>Coupon sales report</h3><select id="rc"><option value="">All coupons</option>${rows.map(x=>`<option value="${x.k}">${esc(x.k)}${x.partner?' ('+esc(x.partner)+')':''}</option>`).join('')}</select><div class="row"><input id="rf" type="date"><input id="rt" type="date"></div><small>From date and to date are optional. Shows every online payment made with a coupon: fee, discount given and the amount the student was billed.</small><button id="rb">Show report</button><button class="s" id="rd">Download CSV</button><div id="rr"></div></div>`;
  $('gs').onclick=async()=>{
   const c=$('gc').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),pc=+$('gp').value,m=$('gm'),ed=$('ge').value,lm=Math.floor(+$('gl').value||0),cm=+$('gk').value||0;
   if(c.length<3)return m.textContent='The code needs at least 3 letters or numbers.';
   if(!(pc>=1&&pc<=100))return m.textContent='Discount must be between 1 and 100.';
   if(cm<0||cm>100)return m.textContent='Commission must be between 0 and 100.';
   if(ed&&ed<isoToday())return m.textContent='The last valid date is already over.';
   try{
    if((await db.collection('coupons').doc(c).get()).exists)return m.textContent='This code already exists.';
    await db.collection('coupons').doc(c).set({pct:pc,active:true,exp:ed?new Date(ed+'T23:59:59+05:30').getTime():0,expd:ed||'',max:lm>0?lm:0,used:0,partner:$('gn').value.trim(),comm:cm>0?cm:0});couponsView();
   }catch(e){m.textContent=e.message}
  };
  if($('gz'))$('gz').onclick=async()=>{try{const b=db.batch();[20,30,40,50].forEach(n=>b.set(db.collection('coupons').doc('STEM'+n),{pct:n,active:true,exp:0,expd:'',max:0,used:0,partner:'',comm:0}));await b.commit();couponsView()}catch(e){alert(e.message)}};
  $('rb').onclick=cpLoad;
  $('rd').onclick=async()=>{if(!CPR.length)await cpLoad();if(!CPR.length)return;dl('STEM_coupon_report_'+isoToday()+'.csv',toCsv([['Date','Student','Roll','Series','Coupon','Receipt','Fee','Discount given','Billed amount']].concat(CPR.map(r=>[dmy(r.iso),r.name,r.roll,r.series,r.c,r.no,r.list,r.disc,r.billed]))),'text/csv')};
 }catch(e){$('tv').innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function saveC(k){
 const ed=$('ced'+k).value,lm=Math.floor(+$('clm'+k).value||0),cm=+$('ccm'+k).value||0;
 if(cm<0||cm>100)return alert('Commission must be between 0 and 100.');
 try{await db.collection('coupons').doc(k).update({exp:ed?new Date(ed+'T23:59:59+05:30').getTime():0,expd:ed||'',max:lm>0?lm:0,partner:$('cpn'+k).value.trim(),comm:cm>0?cm:0});couponsView()}catch(e){alert(e.message)}
}
async function cpLoad(){
 const rc=$('rc').value,f=$('rf').value,t=$('rt').value,box=$('rr');
 box.innerHTML='Loading…';
 try{
  const ps=await db.collection('payments').get(),L=[];
  ps.forEach(d=>{const p=d.data(),m=/coupon\s+([A-Z0-9]+)/i.exec(p.note||''),c=String(p.coupon||(m?m[1]:'')).toUpperCase();if(!c)return;
   const cx=CPD[c]||{},billed=+p.amount||0,pct=+p.pct||+cx.pct||0,list=p.listPrice!=null?+p.listPrice:(pct>0&&pct<100?Math.round(billed*100/(100-pct)):billed),disc=p.discount!=null?+p.discount:Math.max(0,list-billed),ms=p.date&&p.date.toMillis?p.date.toMillis():0,iso=ms?new Date(ms+19800000).toISOString().slice(0,10):'';
   if(rc&&c!==rc)return;if(f&&iso<f)return;if(t&&iso>t)return;
   L.push({c,iso,name:p.name||'',roll:p.roll||'',series:p.seriesTitle||p.series||'',list,disc,billed,no:p.no||''})});
  L.sort((a,b)=>b.iso.localeCompare(a.iso));CPR=L;
  if(!L.length){box.innerHTML='<p>No payments with a coupon found.</p>';return}
  const S={};L.forEach(r=>{const o=S[r.c]=S[r.c]||{n:0,list:0,disc:0,billed:0};o.n++;o.list+=r.list;o.disc+=r.disc;o.billed+=r.billed});
  const T=Object.values(S).reduce((a,o)=>({n:a.n+o.n,list:a.list+o.list,disc:a.disc+o.disc,billed:a.billed+o.billed}),{n:0,list:0,disc:0,billed:0});
  const cm=c=>{const x=CPD[c]||{};return x.comm>0?Math.round(S[c].billed*x.comm/100):0},tc=Object.keys(S).reduce((a,c)=>a+cm(c),0),R=v=>'₹'+v.toLocaleString('en-IN');
  box.innerHTML=`<div class="sm"><span>Sales ${T.n}</span><span>Discount given ${R(T.disc)}</span><span class="ok">Billed ${R(T.billed)}</span>${tc?`<span>Commission ${R(tc)}</span>`:''}</div>`+
   `<div style="overflow-x:auto"><table class="rt"><tr><th>Coupon</th><th>Partner</th><th class="n">Sales</th><th class="n">Fee</th><th class="n">Discount</th><th class="n">Billed</th><th class="n">Commission</th></tr>${Object.keys(S).sort().map(c=>`<tr><td><b>${esc(c)}</b></td><td>${esc((CPD[c]||{}).partner||'')}</td><td class="n">${S[c].n}</td><td class="n">${R(S[c].list)}</td><td class="n">${R(S[c].disc)}</td><td class="n">${R(S[c].billed)}</td><td class="n">${cm(c)?R(cm(c)):'-'}</td></tr>`).join('')}</table></div>`+
   `<div style="overflow-x:auto;margin-top:10px"><table class="rt"><tr><th>Date</th><th>Student</th><th>Series</th><th>Coupon</th><th class="n">Fee</th><th class="n">Discount</th><th class="n">Billed</th><th>Receipt</th></tr>${L.map(r=>`<tr><td>${dmy(r.iso)}</td><td>${esc(r.name)}<br><small>${esc(r.roll)}</small></td><td>${esc(r.series)}</td><td>${esc(r.c)}</td><td class="n">${R(r.list)}</td><td class="n">${R(r.disc)}</td><td class="n">${R(r.billed)}</td><td>${esc(r.no)}</td></tr>`).join('')}</table></div>`;
 }catch(e){box.innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function togC(k){try{const x=(await db.collection('coupons').doc(k).get()).data()||{};await db.collection('coupons').doc(k).update({active:x.active===false});couponsView()}catch(e){alert(e.message)}}
async function delC(k){if(!confirm('Delete coupon '+k+'?'))return;try{await db.collection('coupons').doc(k).delete();couponsView()}catch(e){alert(e.message)}}
async function togV(k){
 try{
  const x=(await db.collection('series').doc(k).get()).data()||{},show=x.active===false;
  if(show&&!(x.price>0))return alert('Please set a price first (tap Edit), then show it.');
  await db.collection('series').doc(k).update({active:show});seriesView();
 }catch(e){alert(e.message)}
}
async function delV(k){
 if(!confirm('Delete this series? Tests and students are not deleted, but students will no longer see it in Test series.'))return;
 try{await db.collection('series').doc(k).delete();try{await db.collection('schedules').doc(k).delete()}catch(e2){}seriesView()}catch(e){alert(e.message)}
}
async function resetReqs(){
  $('tv').innerHTML='Loading…';
  try{
   const r=await db.collection('resetRequests').orderBy('at','desc').get();
   $('tv').innerHTML='<h3>Password reset requests ('+r.size+')</h3>'+(r.docs.map(d=>{const x=d.data();
    return `<div class="card"><b>${esc(x.name)}</b><br>Mobile / roll no: ${esc(x.roll)}<br><small>${x.at?x.at.toDate().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):''}</small><div class="row"><button onclick="setPw('${d.id}','${esc(x.roll)}')">Set new password</button><button class="s" onclick="dismissReq('${d.id}')">Dismiss</button></div></div>`}).join('')||'<p>No requests.</p>');
  }catch(e){$('tv').innerHTML='<p class="bad">'+esc(e.message)+'</p>'}
}
async function dismissReq(id){try{await db.collection('resetRequests').doc(id).delete();resetReqs()}catch(e){alert(e.message)}}
async function setPw(id,roll){
  const np=prompt('Type a new password for this student (at least 6 characters):');if(!np)return;
  if(np.length<6)return alert('Password must be at least 6 characters.');
  try{
   const s=await db.collection('students').where('roll','==',roll).get();
   if(s.empty)return alert('No student found with this mobile / roll number.');
   await api('resetpw',{uid:s.docs[0].id,password:np});
   await db.collection('resetRequests').doc(id).delete();
   alert('Done. New password for '+roll+': '+np+'\nPlease tell the student, and ask them to change it after login.');resetReqs();
  }catch(e){alert('Could not set the password: '+(e.message||e.code))}
}
async function allow(id){
 if(!confirm('Allow this student to retake the test? The old result and marks will be removed everywhere (My tests, My strengths, rank and scanned OMR). A backup copy is kept for you.'))return;
 try{
  const rd=await db.collection('results').doc(id).get();
  if(!rd.exists)return results();
  const x=rd.data(),uid=x.uid,tid=x.testId;
  try{await db.collection('retakeLog').add({resultId:id,uid,testId:tid,a:x.a||null,tm:x.tm||null,omr:!!x.omr,by:me.uid,at:firebase.firestore.FieldValue.serverTimestamp()})}
  catch(e){if(!confirm('The backup copy could not be saved (Firestore rules need the retakeLog collection). Continue without a backup?'))return}
  await db.collection('results').doc(id).delete();
  const bad=[];
  try{await db.collection('marks').doc(id).delete()}catch(e){bad.push(e.message)}
  try{const mk=await db.collection('marks').where('uid','==',uid).where('testId','==',tid).get();for(const d of mk.docs){try{await d.ref.delete()}catch(e){bad.push(e.message)}}}catch(e){}
  try{await db.collection('omrimg').doc(id).delete()}catch(e){}
  let still=false;try{still=(await db.collection('results').doc(id).get()).exists}catch(e){}
  if(still)alert('The result could not be removed. Please try again.');
  else if(bad.length)alert('The result was removed, but the saved marks could not be deleted: '+bad[0]);
  results();
 }catch(e){alert(e.message)}
}
/* ===== OMR READER (reads the STEM 180-question sheet from a grey image) ===== */
const OMRG={
 sq:[[86,86],[1566.5,86],[86,2259],[826,2259],[1566.5,2259]],
 colx:[227.86,290.61,353.66,416.72,578.19,641.03,704.03,767.14,928.12,991.01,1054.08,1117.12,1279.14,1342.1,1405.3,1468.32],
 rowy:[759.94,792.25,825.31,857.81,891.12,923.44,957.38,990.56,1024.12,1056.88,1090.12,1123.0,1156.25,1189.5,1222.94,1255.25,1288.31,1320.56,1354.12,1386.56,1420.44,1453.94,1486.88,1519.88,1553.19,1586.0,1619.12,1652.25,1685.94,1718.31,1751.5,1784.0,1817.06,1849.88,1883.25,1917.0,1949.88,1983.0,2016.12,2049.0,2082.0,2115.44,2148.12,2181.81,2214.75],
 rx:[1007.6,1061.9,1117.1,1172.4,1227.9,1282.8,1337.9,1392.9,1448.2,1503.5],
 ry:[322.5,355.4,388.4,420.9,454.1,487.2,520.9,553.7,587.1,620.0],
 cx:[408.5,479.5,548.5,621.5],cy:598.0,LONG:2339,T:0.45
};
function omrOtsu(g){const h=new Int32Array(256);for(let i=0;i<g.length;i+=3)h[g[i]]++;let tot=0,sm=0;for(let i=0;i<256;i++){tot+=h[i];sm+=i*h[i]}let wb=0,sb=0,best=0,th=128;for(let i=0;i<256;i++){wb+=h[i];if(!wb)continue;const wf=tot-wb;if(!wf)break;sb+=i*h[i];const mb=sb/wb,mf=(sm-sb)/wf,v=wb*wf*(mb-mf)*(mb-mf);if(v>best){best=v;th=i}}return th}
function omrSquares(g,W,H){
 const th=Math.min(omrOtsu(g),150),lab=new Int32Array(W*H),st=[],out=[];let n=0;
 for(let s=0;s<W*H;s++){
  if(lab[s]||g[s]>=th)continue;
  n++;let x0=W,x1=0,y0=H,y1=0,a=0,sx=0,sy=0;st.length=0;st.push(s);lab[s]=n;
  while(st.length){const p=st.pop(),y=(p/W)|0,x=p-y*W;a++;sx+=x;sy+=y;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
   if(x>0&&!lab[p-1]&&g[p-1]<th){lab[p-1]=n;st.push(p-1)}if(x<W-1&&!lab[p+1]&&g[p+1]<th){lab[p+1]=n;st.push(p+1)}
   if(y>0&&!lab[p-W]&&g[p-W]<th){lab[p-W]=n;st.push(p-W)}if(y<H-1&&!lab[p+W]&&g[p+W]<th){lab[p+W]=n;st.push(p+W)}}
  const w=x1-x0+1,h=y1-y0+1;
  if(w>=36&&w<=75&&h>=36&&h<=75&&Math.abs(w-h)<=0.2*Math.max(w,h)&&a>=0.8*w*h)out.push({x:sx/a,y:sy/a,w,h,a});
 }
 return out;
}
function omrSolve(A,b){const n=b.length;for(let i=0;i<n;i++){let m=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[m][i]))m=r;[A[i],A[m]]=[A[m],A[i]];[b[i],b[m]]=[b[m],b[i]];if(Math.abs(A[i][i])<1e-12)return null;for(let r=i+1;r<n;r++){const f=A[r][i]/A[i][i];for(let c=i;c<n;c++)A[r][c]-=f*A[i][c];b[r]-=f*b[i]}}const x=new Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=b[i];for(let c=i+1;c<n;c++)s-=A[i][c]*x[c];x[i]=s/A[i][i]}return x}
function omrHomog(src,dst){ /* template(src) -> image(dst) */
 const A=Array.from({length:8},()=>new Array(8).fill(0)),b=new Array(8).fill(0);
 for(let i=0;i<src.length;i++){const[x,y]=src[i],[u,v]=dst[i];
  for(const[r,t]of[[[x,y,1,0,0,0,-u*x,-u*y],u],[[0,0,0,x,y,1,-v*x,-v*y],v]]){for(let p=0;p<8;p++){for(let q=0;q<8;q++)A[p][q]+=r[p]*r[q];b[p]+=r[p]*t}}}
 return omrSolve(A,b);
}
const omrMap=(h,x,y)=>{const d=h[6]*x+h[7]*y+1;return[(h[0]*x+h[1]*y+h[2])/d,(h[3]*x+h[4]*y+h[5])/d]};
function omrOrder(sq5){ /* returns image points in template order TL,TR,BL,BM,BR or null */
 let best=null;
 for(let m=0;m<5;m++)for(let a=0;a<5;a++)for(let b=a+1;b<5;b++){
  if(a===m||b===m)continue;
  const mid=[(sq5[a].x+sq5[b].x)/2,(sq5[a].y+sq5[b].y)/2],dist=Math.hypot(sq5[a].x-sq5[b].x,sq5[a].y-sq5[b].y),e=Math.hypot(sq5[m].x-mid[0],sq5[m].y-mid[1])/dist;
  if(!best||e<best.e)best={m,a,b,e};
 }
 if(!best||best.e>0.05)return null;
 const rest=[0,1,2,3,4].filter(i=>i!==best.m&&i!==best.a&&i!==best.b),P=i=>[sq5[i].x,sq5[i].y];
 let BL=best.a,BR=best.b;const cx=(sq5[rest[0]].x+sq5[rest[1]].x)/2-sq5[best.m].x,cy=(sq5[rest[0]].y+sq5[rest[1]].y)/2-sq5[best.m].y;
 const vx=sq5[BR].x-sq5[BL].x,vy=sq5[BR].y-sq5[BL].y;
 if(vx*cy-vy*cx>0)[BL,BR]=[BR,BL];
 const d=(i,j)=>Math.hypot(sq5[i].x-sq5[j].x,sq5[i].y-sq5[j].y);
 let TL=rest[0],TR=rest[1];if(d(TL,BL)>d(TR,BL))[TL,TR]=[TR,TL];
 return[P(TL),P(TR),P(BL),P(best.m),P(BR)];
}
function omrRead(g,W,H){
 let cand=omrSquares(g,W,H);
 if(cand.length<5)return{ok:false,err:'The 5 black squares were not found. Scan the full sheet, flat and upright.'};
 if(cand.length>5){cand.sort((a,b)=>b.a-a.a);cand=cand.slice(0,5)}
 const pts=omrOrder(cand);if(!pts)return{ok:false,err:'The black squares do not match the sheet layout.'};
 const h=omrHomog(OMRG.sq,pts);if(!h)return{ok:false,err:'Could not straighten the scan.'};
 const sc=Math.hypot(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1])/(OMRG.sq[1][0]-OMRG.sq[0][0]);
 const R=Math.max(4,Math.round(9*sc)),pix=[];
 for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++)if(dx*dx+dy*dy<=R*R)pix.push([dx,dy]);
 const mean=(tx,ty)=>{const[u,v]=omrMap(h,tx,ty),cx=Math.round(u),cy=Math.round(v);let s=0,c=0;for(const[dx,dy]of pix){const x=cx+dx,y=cy+dy;if(x>=0&&y>=0&&x<W&&y<H){s+=g[y*W+x];c++}}return c?s/c:255};
 const M={q:[],r:[],c:[]},all=[];
 for(let q=0;q<180;q++){const blk=(q/45)|0,row=q%45,arr=[];for(let o=0;o<4;o++){const m=mean(OMRG.colx[blk*4+o],OMRG.rowy[row]);arr.push(m);all.push(m)}M.q.push(arr)}
 for(let c=0;c<10;c++){const arr=[];for(let d=0;d<10;d++){const m=mean(OMRG.rx[c],OMRG.ry[d]);arr.push(m);all.push(m)}M.r.push(arr)}
 for(let i=0;i<4;i++){const m=mean(OMRG.cx[i],OMRG.cy);M.c.push(m);all.push(m)}
 const srt=[...all].sort((a,b)=>a-b),white=srt[(srt.length*0.5)|0];
 let bs=0,bc=0;for(const p of pts){const m=mean(OMRG.sq[pts.indexOf(p)][0],OMRG.sq[pts.indexOf(p)][1]);bs+=m;bc++}
 const black=Math.min(bs/bc,white-60),span=Math.max(30,white-black),T=OMRG.T,dk=m=>Math.max(0,Math.min(1,(white-m)/span));
 const ans=[];let faint=0,blank=0,dbl=[];
 for(let q=0;q<180;q++){const f=[];M.q[q].forEach((m,o)=>{const d=dk(m);if(d>=T)f.push(o);else if(d>=0.2)faint++});
  if(f.length===1)ans.push(f[0]);else if(!f.length){ans.push(-1);blank++}else{ans.push(9);dbl.push(q+1)}}
 let roll='',rollOk=true;for(let c=0;c<10;c++){const f=[];M.r[c].forEach((m,d)=>{if(dk(m)>=T)f.push(d)});if(f.length===1)roll+=f[0];else{roll+=f.length?'*':'?';rollOk=false}}
 const code=[];M.c.forEach((m,i)=>{if(dk(m)>=T)code.push('ABCD'[i])});
 return{ok:true,ans,roll,rollOk,code:code.join(''),faint,blank,dbl,scale:sc};
}

/* ---------- OMR: CHECK SCANNED SHEETS ---------- */
const OMR_START={neetoff:1,phyoff:1,chemoff:46,biooff:91,neet:1,phy:1,chem:46,bio:91};
let OM={tests:[],rows:[]};
async function omrView(){
 $('tv').innerHTML='Loading…';
 let ts,off=new Set(),SN={};try{ts=await db.collection('tests').get();(await db.collection('series').get()).forEach(d=>{SN[d.id]=d.data().title||d.id;if(d.data().mode==='offline')off.add(d.id)})}catch(e){$('tv').innerHTML='<p class="bad">'+esc(e.message)+'</p>';return}
 OM={tests:ts.docs.map(d=>({id:d.id,...d.data()})).filter(t=>off.has(t.pat)||/off$/.test(t.pat||'')).sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''))),rows:[]};
 if(!OM.tests.length){$('tv').innerHTML='<div class="card"><h3>Check OMR sheets</h3>No offline test found. Create a test under an offline series (Series tab, mode Offline at centre) and it will appear here.</div>';return}
 $('tv').innerHTML='<div class="card"><h3>Check OMR sheets</h3>'+
  '<label>Test series</label><select id="osr" onchange="omrSer()">'+[...new Set(OM.tests.map(t=>t.pat||''))].sort((a,b)=>omrSN(a).localeCompare(omrSN(b))).map(k=>'<option value="'+esc(k)+'">'+esc(omrSN(k))+'</option>').join('')+'</select><label>Test</label><select id="ot" onchange="omrPick()"></select>'+
  '<small>First question of this test on the OMR sheet (1 for Physics or full NEET, 46 for Chemistry, 91 for Biology):</small>'+
  '<input id="os" type="number" min="1" max="180" value="1">'+
  '<small>Select all scanned sheets of this test (JPG or PNG, one image per sheet).</small>'+
  '<input id="of" type="file" accept="image/*" multiple>'+
  '<button id="ob">Read sheets</button><p id="om"></p></div><div id="or"></div>';
 OM.sn=SN;omrSer();$('ob').onclick=omrRun;
}
function omrSN(k){return (OM.sn&&OM.sn[k])||(typeof PN!=='undefined'&&PN[k])||k||'Other tests'}
function omrSer(){const k=$('osr').value;$('ot').innerHTML=OM.tests.filter(t=>(t.pat||'')===k).map(t=>'<option value="'+t.id+'">'+esc(t.title||'Test')+' ('+(t.qs?t.qs.length:(t.n||'?'))+' questions)</option>').join('');omrPick()}
function omrPick(){const t=OM.tests.find(x=>x.id===$('ot').value);if(t&&$('os'))$('os').value=OMR_START[t.pat]||1}
function omrGray(file){return new Promise((ok,no)=>{
 const u=URL.createObjectURL(file),im=new Image();
 im.onerror=()=>{URL.revokeObjectURL(u);no(new Error('This file is not a valid image.'))};
 im.onload=()=>{try{
  const L=OMRG.LONG,s=L/Math.max(im.naturalWidth,im.naturalHeight),w=Math.max(1,Math.round(im.naturalWidth*s)),h=Math.max(1,Math.round(im.naturalHeight*s));
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});
  x.fillStyle='#fff';x.fillRect(0,0,w,h);x.imageSmoothingQuality='high';x.drawImage(im,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data,g=new Uint8Array(w*h);
  for(let i=0,j=0;j<g.length;i+=4,j++)g[j]=(d[i]*299+d[i+1]*587+d[i+2]*114)/1000;
  let q=0.6,mw=1300,out='';
  for(let k=0;k<5;k++){
   const k2=Math.min(1,mw/Math.max(w,h)),c2=document.createElement('canvas');c2.width=Math.round(w*k2);c2.height=Math.round(h*k2);
   const y=c2.getContext('2d');y.fillStyle='#fff';y.fillRect(0,0,c2.width,c2.height);y.imageSmoothingQuality='high';y.drawImage(c,0,0,c2.width,c2.height);
   out=c2.toDataURL('image/jpeg',q);if(out.length<780000)break;q-=0.08;mw=Math.round(mw*0.85);
  }
  URL.revokeObjectURL(u);ok({g,w,h,img:out});
 }catch(e){URL.revokeObjectURL(u);no(e)}};
 im.src=u})}
async function omrRun(){
 const m=$('om'),tid=$('ot')&&$('ot').value,fl=[...($('of').files||[])],st0=parseInt($('os').value,10);
 if(!tid)return m.textContent='Please select a test.';
 if(!fl.length)return m.textContent='Please select the scanned sheets.';
 if(!(st0>=1&&st0<=180))return m.textContent='The first question number must be between 1 and 180.';
 $('ob').disabled=true;m.className='';m.textContent='Loading the test…';$('or').innerHTML='';
 try{
  const t=OM.tests.find(x=>x.id===tid),T={...t};
  if(!T.qs)T.qs=(await db.collection('qbank').doc(tid).get()).data().qs;
  const K=(await db.collection('keys').doc(tid).get()).data().ans,n=T.qs.length;
  if(T.qs.some(x=>x.t==='num'))throw new Error('OMR checking works for multiple-choice tests only.');
  if(st0+n-1>180)throw new Error('This test has '+n+' questions, so it cannot start at question '+st0+' of the sheet.');
  const [ss,rs]=await Promise.all([db.collection('students').get(),db.collection('results').where('testId','==',tid).get()]);
  const byRoll={},had={},dup={};ss.forEach(d=>{const x=d.data();if(x.roll){const k=String(x.roll);if(byRoll[k])dup[k]=1;byRoll[k]={uid:d.id,name:x.name||'',cls:x.cls||''}}});rs.forEach(d=>had[d.data().uid]=1);
  OM.stu=ss.docs.map(d=>({uid:d.id,name:d.data().name||'',roll:d.data().roll||''})).sort((a,b)=>a.name.localeCompare(b.name));
  OM.byRoll=byRoll;OM.dup=dup;OM.tid=tid;OM.T=T;OM.K=K;OM.max=n*(T.pos??4);OM.had=had;OM.rows=[];
  for(let i=0;i<fl.length;i++){
   m.textContent='Reading sheet '+(i+1)+' of '+fl.length+'…';await new Promise(r=>setTimeout(r,30));
   const row={file:fl[i].name};
   try{
    const im=await omrGray(fl[i]),r=omrRead(im.g,im.w,im.h);
    if(!r.ok)row.err=r.err;
    else{
     const A=r.ans.slice(st0-1,st0-1+n),R=score(T,K,A),s=r.rollOk&&!dup[r.roll]?byRoll[r.roll]:null;
     Object.assign(row,{roll:r.roll,rollOk:r.rollOk,dup:!!(r.rollOk&&dup[r.roll]),A,R,img:im.img,dbl:r.dbl.filter(q=>q>=st0&&q<st0+n).length,faint:r.faint,uid:s?s.uid:'',name:s?s.name:''});
    }
   }catch(e){row.err=e.message||'Could not read this image.'}
   OM.rows.push(row);
  }
  m.textContent='';omrShow();
 }catch(e){m.className='bad';m.textContent=e.message||String(e)}
 $('ob').disabled=false;
}
function omrShow(){
 const cnt={};OM.rows.forEach(r=>{if(r.uid)cnt[r.uid]=(cnt[r.uid]||0)+1});
 const opt=OM.stu.map(s=>'<option value="'+s.uid+'">'+esc(s.name)+' ('+esc(s.roll)+')</option>').join('');
 const html=OM.rows.map((r,i)=>{
  if(r.err)return '<div class="card"><b>'+esc(r.file)+'</b><br><span class="bad">'+esc(r.err)+'</span></div>';
  const h='<div class="card"><small>'+esc(r.file)+'</small><br>';
  let who;
  if(r.uid){const sx=OM.stu.find(x=>x.uid===r.uid);who='<b>'+esc(r.name)+'</b> ('+esc(sx?sx.roll:r.roll)+')'+(r.man?' <small>(roll number changed by you; sheet showed '+esc(r.roll)+')</small>':'')}
  else who='<span class="bad">Number read: '+esc(r.roll)+(r.rollOk?(r.dup?' (two students have this number)':' (no student has this number)'):' (not fully filled)')+'</span><br><select onchange="omrAssign('+i+',this.value)"><option value="">Choose the student for this sheet</option>'+opt+'</select>';
  const sc='<br>Score <b>'+r.R.sc+' / '+OM.max+'</b> | Correct '+r.R.ok+' | Wrong '+r.R.bad+' | Not attempted '+r.R.un+(r.dbl?' | <span class="bad">Two options marked: '+r.dbl+' (counted wrong)</span>':'');
  const w=(r.uid&&OM.had[r.uid]?'<br><small class="bad">This student already has a result for this test. Saving will replace it.</small>':'')+(r.uid&&cnt[r.uid]>1?'<br><small class="bad">More than one sheet has this number. The last one will be saved.</small>':'');
  const ov='<br><small>Roll number wrong? Type the correct roll number and press Enter:</small><input value="'+esc(r.man||'')+'" placeholder="Correct roll number" onchange="omrRoll('+i+',this.value)">';
  return h+who+ov+sc+w+'</div>';
 }).join('');
 const ok=OM.rows.filter(r=>r.uid).length;
 $('or').innerHTML='<div class="card"><b>'+OM.rows.length+' sheets read, '+ok+' ready to save</b></div>'+html+(ok?'<button id="osv" onclick="omrSave()">Save '+ok+' results</button><p id="osm"></p>':'');
}
function omrRoll(i,v){
 v=String(v).trim().toLowerCase();const r=OM.rows[i];
 if(!v){r.man='';const s=r.rollOk&&!OM.dup[r.roll]?OM.byRoll[r.roll]:null;r.uid=s?s.uid:'';r.name=s?s.name:'';return omrShow()}
 const hit=OM.stu.filter(s=>String(s.roll).toLowerCase()===v);
 if(hit.length!==1){alert(hit.length?'More than one student has this roll number. Choose the student from the list instead.':'No student has the roll number '+v+'.');return omrShow()}
 r.man=v;r.uid=hit[0].uid;r.name=hit[0].name;omrShow();
}
function omrAssign(i,uid){const s=OM.stu.find(x=>x.uid===uid);OM.rows[i].man=s?String(s.roll):'';OM.rows[i].uid=uid;OM.rows[i].name=s?s.name:'';omrShow()}
async function omrSave(){
 const b=$('osv'),m=$('osm');b.disabled=true;let done=0,noimg=0;const fail=[];
 const rows=OM.rows.filter(r=>r.uid),last={};rows.forEach(r=>last[r.uid]=r);
 for(const r of Object.values(last)){
  m.textContent='Saving '+(done+1)+' of '+Object.keys(last).length+'…';
  try{
   await db.collection('results').doc(r.uid+'_'+OM.tid).set({uid:r.uid,testId:OM.tid,a:r.A,omr:true,at:firebase.firestore.FieldValue.serverTimestamp()});
   try{await db.collection('omrimg').doc(r.uid+'_'+OM.tid).set({uid:r.uid,testId:OM.tid,d:r.img,at:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){noimg++}
   done++;
  }catch(e){fail.push(r.name+': '+(e.code==='permission-denied'?'Firestore rules do not allow this yet. Publish the new firestore.rules file in Firebase, then try again.':(e.message||e.code)))}
 }
 m.className=fail.length?'bad':'ok';
 m.innerHTML='Saved '+done+' results. Students can see them now.'+(noimg?'<br>The scanned image could not be saved for '+noimg+' sheets. Publish the updated Firestore rules, then upload these sheets again.':'')+(fail.length?'<br>Not saved:<br>'+fail.map(esc).join('<br>'):'');
 if(!fail.length&&!noimg)b.style.display='none';else b.disabled=false;
}

/* ---------- TOPIC-WISE STRENGTH AND WEAKNESS ---------- */
function topicStats(tp,K,A,M){
 M=M||{};
 (tp||[]).forEach((nm,i)=>{
  if(!nm)return;
  const m=M[nm]=M[nm]||{ok:0,bad:0,un:0},a=A?A[i]:null,k=K?K[i]:null;
  if(a==null||a===-1){m.un++;return}
  Math.abs(a-k)<0.01?m.ok++:m.bad++;
 });
 return M;
}
function topicCard(M,title,note){
 const rows=Object.entries(M).map(([nm,m])=>{const tot=m.ok+m.bad+m.un;return{nm,...m,tot,pc:tot?Math.round(m.ok/tot*100):0}}).filter(r=>r.tot).sort((a,b)=>a.pc-b.pc||b.tot-a.tot);
 if(!rows.length)return '';
 const lab=p=>p>=70?['Strong','#147a52']:p>=40?['Needs practice','#c98a0b']:['Weak','#bd3540'];
 const weak=rows.filter(r=>r.pc<40).slice(0,3).map(r=>esc(r.nm)),sg=rows.filter(r=>r.pc>=70).length;
 return '<div class="card an-card"><h3>'+esc(title)+'</h3>'+(note?'<small>'+esc(note)+'</small>':'')+
  '<div class="an-pills"><span class="an-pill" style="--c:#147a52"><b>'+sg+'</b>Strong</span><span class="an-pill" style="--c:#c98a0b"><b>'+rows.filter(r=>r.pc>=40&&r.pc<70).length+'</b>Needs practice</span><span class="an-pill" style="--c:#bd3540"><b>'+rows.filter(r=>r.pc<40).length+'</b>Weak</span></div>'+
  (weak.length?'<div class="an-focus"><b>Focus first on:</b> '+weak.join(' &bull; ')+'</div>':'<div class="an-focus ok2"><b>No weak topic here.</b> Keep revising and practising.</div>')+
  rows.map(r=>{const l=lab(r.pc);return '<div class="an-tp"><div class="an-th"><b>'+esc(r.nm)+'</b><span class="an-chip" style="background:'+l[1]+'">'+l[0]+' &middot; '+r.pc+'%</span></div>'+
   '<div class="an-stack"><i style="width:'+(r.ok*100/r.tot)+'%;background:#147a52"></i><i style="width:'+(r.bad*100/r.tot)+'%;background:#bd3540"></i><i style="width:'+(r.un*100/r.tot)+'%;background:#a7b3c6"></i></div>'+
   '<small>Correct '+r.ok+' of '+r.tot+' &nbsp;|&nbsp; Wrong '+r.bad+' &nbsp;|&nbsp; Not attempted '+r.un+'</small></div>'}).join('')+
  '<small>Strong = 70% or more correct. Needs practice = 40% to 69%. Weak = below 40%. Blank questions count as not correct.</small></div>';
}
async function myStrength(){
 wmOff();app.innerHTML='Loading…';
 try{
  const [ts,rs]=await Promise.all([db.collection('tests').get(),db.collection('results').where('uid','==',me.uid).get()]);
  const T={};ts.forEach(d=>T[d.id]=d.data());
  const use=rs.docs.map(d=>d.data()).filter(r=>T[r.testId]&&(T[r.testId].tp||[]).some(Boolean));
  const ks=await Promise.all(use.map(r=>db.collection('keys').doc(r.testId).get().catch(()=>null)));
  const M={};let n=0;
  use.forEach((r,i)=>{const k=ks[i];if(!k||!k.exists)return;n++;topicStats(T[r.testId].tp,k.data().ans,r.a,M)});
  app.innerHTML=sNav('w')+'<h3>My strengths and weaknesses</h3>'+(n?topicCard(M,'All your tests together','Based on '+n+' test'+(n==1?'':'s')+' that have topic details.'):'<div class="card">Topic-wise analysis will appear here after you take a test that has topic details.</div>');
 }catch(e){app.innerHTML=sNav('w')+'<div class="card bad">Could not load: '+esc(e.message)+'</div>'}
}
function rangeStr(v){
 const o=[];let a=v[0],b=v[0];
 for(let i=1;i<=v.length;i++){if(v[i]===b+1){b=v[i];continue}o.push(a===b?''+a:a+'-'+b);a=v[i];b=v[i]}
 return o.join(', ');
}
async function topicsEdit(id){
 const box=$('tp'+id);if(!box)return;if(box.innerHTML){box.innerHTML='';return}
 box.innerHTML='Loading…';
 try{
  const t=(await db.collection('tests').doc(id).get()).data()||{},n=t.qs?t.qs.length:(t.n||0),G={};
  (t.tp||[]).forEach((x,i)=>{if(x)(G[x]=G[x]||[]).push(i+1)});
  const txt=Object.entries(G).map(([k,v])=>k+': '+rangeStr(v)).join('\n');
  box.innerHTML='<small>Write one topic per line, like <b>Kinematics: 1-10, 15</b>. The questions of this test are numbered 1 to '+n+'. Students then see their strong and weak topics.</small>'+
   '<textarea id="tx'+id+'" rows="8" placeholder="Kinematics: 1-10, 15&#10;Laws of Motion: 11-14, 16-20">'+esc(txt)+'</textarea>'+
   '<button onclick="topicsSave(\''+id+'\','+n+')">Save topics</button><p id="tm'+id+'"></p>';
 }catch(e){box.innerHTML='<span class="bad">'+esc(e.message)+'</span>'}
}
async function topicsSave(id,n){
 const m=$('tm'+id),lines=$('tx'+id).value.split('\n').map(x=>x.trim()).filter(Boolean),tp=Array(n).fill('');
 m.className='bad';
 for(const ln of lines){
  const c=ln.lastIndexOf(':'),nm=c>0?ln.slice(0,c).trim():'';
  if(!nm)return m.textContent='Write each line like  Topic name: 1-10, 15   (problem in: '+ln+')';
  for(const part of ln.slice(c+1).split(',').map(x=>x.trim()).filter(Boolean)){
   const r=part.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
   if(!r)return m.textContent='Cannot read "'+part+'" in the line for '+nm+'. Use numbers like 1-10, 15.';
   const a=+r[1],b=r[2]?+r[2]:a;
   if(a<1||b>n||b<a)return m.textContent='"'+part+'" is outside the questions 1 to '+n+' (topic '+nm+').';
   for(let q=a;q<=b;q++){if(tp[q-1]&&tp[q-1]!==nm)return m.textContent='Question '+q+' is in two topics: '+tp[q-1]+' and '+nm+'.';tp[q-1]=nm}
  }
 }
 try{
  await db.collection('tests').doc(id).update({tp});
  const k=tp.filter(Boolean).length;m.className=k===n?'ok':'';
  m.textContent='Saved. '+k+' of '+n+' questions have a topic.'+(k<n?' The others are left out of the topic analysis.':'');
 }catch(e){m.textContent='Could not save: '+(e.message||e.code)}
}

/* ---------- TIME SPENT ON EACH QUESTION + RESULT TABS ---------- */
function tmAdd(){if(!X||!X.tm||X.cq==null)return;const now=Date.now();X.tm[X.cq]+=(now-X.t0)/1000;X.t0=now}
function tmFlush(){if(!X||!X.tm)return;if(document.hidden)X.t0=Date.now();else tmAdd()}
document.addEventListener('visibilitychange',()=>{if(X&&X.tm&&!X.sub){if(document.hidden)tmAdd();else X.t0=Date.now()}});
async function saveResult(){
 const ref=db.collection('results').doc(me.uid+'_'+X.id),base={uid:me.uid,testId:X.id,a:X.a},at=firebase.firestore.FieldValue.serverTimestamp(),tm=X.tm.map(v=>Math.round(v));
 try{await ref.set({...base,tm,vio:X.vio||0,at})}catch(e){if(e.code!=='permission-denied')throw e;await ref.set({...base,at})}
}
function revTabs(o){return '<div class="row rtabs"><button id="rt1" onclick="revTab(1)">Result</button>'+(o?'<button id="rt3" class="s" onclick="revTab(3)">OMR sheet</button>':'')+'<button id="rt2" class="s" onclick="revTab(2)">Analysis</button></div>'}
function revTab(k){[1,2,3].forEach(i=>{const v=$('rv'+i),b=$('rt'+i);if(!v||!b)return;v.style.display=i===k?'':'none';b.className=i===k?'':'s'});window.scrollTo(0,0)}
function omrTab(T,K,A,om){
 const im=om&&om.exists&&om.data().d?'<img src="'+om.data().d+'" alt="Your OMR sheet" style="width:100%;border-radius:6px;margin-top:6px">':'<br><small>The scanned image of your sheet is not available.</small>';
 const L=v=>v==null||v===-1?'-':v===9?'2 marked':'ABCD'[v]||v;
 const rows=T.qs.map((_,i)=>{const q=qs_(T,i),a=A[i],un=unans(a,q.t),ok=!un&&(q.t==='num'?Math.abs(a-K[i])<0.01:a===K[i]),c=un?'un':ok?'ok':'bad';
  return '<tr class="om-'+c+'"><td>'+(i+1)+'</td><td>'+(q.t==='num'?(un?'-':a):L(a))+'</td><td>'+(q.t==='num'?K[i]:L(K[i]))+'</td><td>'+(un?'Not attempted':ok?'Correct':'Incorrect')+'</td></tr>'});
 return '<div class="card"><b>Your scanned OMR sheet</b>'+im+'</div><div class="card"><b>What you marked and the correct answer</b><div style="overflow-x:auto"><table class="omt"><tr><th>Q</th><th>You marked</th><th>Correct</th><th>Result</th></tr>'+rows.join('')+'</table></div></div>';
}
const AC={ok:'#147a52',bad:'#bd3540',skip:'#a7b3c6',un:'#a7b3c6'};
function fmtT(s){s=Math.round(s||0);if(s<60)return s+' sec';const m=Math.floor(s/60),r=s%60;if(m<60)return m+' min'+(r?' '+r+' sec':'');const h=Math.floor(m/60);return h+' hr '+(m%60)+' min'}
const clk=s=>{s=Math.round(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const isOk=(q,a,k)=>q.t==='num'?Math.abs(a-k)<0.01:a===k;
function anaDonut(parts,mid,sub){
 const r=50,C=2*Math.PI*r,tot=parts.reduce((a,p)=>a+p.v,0)||1;let off=0;
 const arcs=parts.filter(p=>p.v>0).map(p=>{const l=p.v/tot*C,s='<circle cx="70" cy="70" r="'+r+'" fill="none" stroke="'+p.c+'" stroke-width="17" stroke-dasharray="'+l.toFixed(2)+' '+(C-l).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 70 70)"/>';off+=l;return s}).join('');
 return '<svg viewBox="0 0 140 140" class="an-dn" role="img"><circle cx="70" cy="70" r="'+r+'" fill="none" stroke="rgba(130,145,170,.22)" stroke-width="17"/>'+arcs+'<text x="70" y="72" text-anchor="middle" class="an-dv">'+mid+'</text><text x="70" y="90" text-anchor="middle" class="an-ds">'+sub+'</text></svg>';
}
function anaCard(T,K,A,R){
 const n=T.qs.length,pos=T.pos??4,neg=T.neg??1,att=R.ok+R.bad,acc=att?Math.round(R.ok*100/att):0,mx=n*pos,pct=mx?Math.round(R.sc*100/mx):0;
 const S={};let lost=0;
 T.qs.forEach((_,i)=>{const q=qs_(T,i),a=A[i],o=S[q.s]=S[q.s]||{ok:0,bad:0,un:0,n:0};o.n++;
  if(unans(a,q.t))o.un++;else if(isOk(q,a,K[i]))o.ok++;else{o.bad++;lost+=q.t==='num'?(T.nn||0):neg}});
 const names=Object.keys(S),tile=(v,l,c)=>'<div class="an-tile" style="--c:'+c+'"><b>'+v+'</b><span>'+l+'</span></div>';
 const withAcc=names.map(k=>({k,acc:(S[k].ok+S[k].bad)?S[k].ok/(S[k].ok+S[k].bad):0,att:S[k].ok+S[k].bad})).filter(x=>x.att>0).sort((a,b)=>b.acc-a.acc);
 const tips=[];
 if(att&&acc<50&&att/n>.7)tips.push(['\u26a0\ufe0f','You attempted most questions but fewer than half were correct. Answer only when you are fairly sure, because wrong answers cost marks.']);
 if(R.un>n*.3)tips.push(['\u270d\ufe0f',R.un+' questions were left blank. Try to attempt every question you can eliminate at least two options for.']);
 if(lost>0)tips.push(['\u2796','Wrong answers cost you '+lost+' marks in this test.']);
 if(withAcc.length>1){tips.push(['\ud83c\udfc6','Best subject: <b>'+esc(withAcc[0].k)+'</b> ('+Math.round(withAcc[0].acc*100)+'% accuracy).']);const w=withAcc[withAcc.length-1];if(w.acc<withAcc[0].acc)tips.push(['\ud83c\udfaf','Needs most work: <b>'+esc(w.k)+'</b> ('+Math.round(w.acc*100)+'% accuracy).'])}
 return '<div class="card an-card"><h3>Performance at a glance</h3><div class="an-top">'+
  anaDonut([{v:R.ok,c:AC.ok},{v:R.bad,c:AC.bad},{v:R.un,c:AC.un}],R.sc,'of '+mx+' marks')+
  '<div class="an-leg2"><div><i style="background:'+AC.ok+'"></i>Correct <b>'+R.ok+'</b></div><div><i style="background:'+AC.bad+'"></i>Wrong <b>'+R.bad+'</b></div><div><i style="background:'+AC.un+'"></i>Not attempted <b>'+R.un+'</b></div></div></div>'+
  '<div class="an-tiles">'+tile(acc+'%','Accuracy','#147a52')+tile(att+'/'+n,'Attempted','#2f6fb5')+tile(Math.max(0,pct)+'%','Score','#7a4fc2')+tile(lost?'\u2212'+lost:'0','Marks lost','#bd3540')+'</div>'+
  (tips.length?'<div class="an-tips">'+tips.map(t=>'<div><span>'+t[0]+'</span><p>'+t[1]+'</p></div>').join('')+'</div>':'')+'</div>'+
  (names.length>1?'<div class="card an-card"><h3>Subject-wise result</h3>'+names.map(k=>{const o=S[k],a2=(o.ok+o.bad)?Math.round(o.ok*100/(o.ok+o.bad)):0;
   return '<div class="an-sec"><div class="an-th"><b>'+esc(k)+'</b><span class="an-chip" style="background:#17306b">'+R.sec[k]+' marks</span></div><div class="an-stack"><i style="width:'+(o.ok*100/o.n)+'%;background:'+AC.ok+'"></i><i style="width:'+(o.bad*100/o.n)+'%;background:'+AC.bad+'"></i><i style="width:'+(o.un*100/o.n)+'%;background:'+AC.un+'"></i></div><small><span style="color:'+AC.ok+'">\u25cf</span> '+o.ok+' correct &nbsp; <span style="color:'+AC.bad+'">\u25cf</span> '+o.bad+' wrong &nbsp; <span style="color:#8c99ad">\u25cf</span> '+o.un+' blank &nbsp;|&nbsp; '+a2+'% accuracy</small></div>'}).join('')+'</div>':'');
}
function timeCard(T,K,A,tm){
 if(!Array.isArray(tm)||!tm.some(v=>v>0))return '<div class="card an-card"><h3>Time analysis</h3>Not available for this test. Time is recorded only when a test is taken online.</div>';
 const n=T.qs.length;
 const rows=T.qs.map((_,i)=>{const q=qs_(T,i),a=A[i],un=unans(a,q.t);return{i,t:tm[i]||0,s:q.s,st:un?'skip':isOk(q,a,K[i])?'ok':'bad'}});
 const tot=rows.reduce((x,r)=>x+r.t,0),avg=tot/n,allow=(T.mins||0)*60,use=allow?Math.min(100,tot*100/allow):0;
 const gav=k=>{const g=rows.filter(r=>r.st===k);return g.length?fmtT(g.reduce((x,r)=>x+r.t,0)/g.length):'-'};
 const secs={};rows.forEach(r=>{const o=secs[r.s]=secs[r.s]||{n:0,t:0,ok:0};o.n++;o.t+=r.t;if(r.st==='ok')o.ok++});
 const slow=[...rows].sort((a,b)=>b.t-a.t).filter(r=>r.t>0).slice(0,5);
 const fast=rows.filter(r=>r.st==='bad'&&r.t>0&&r.t<10).length,long=rows.filter(r=>r.t>2*avg&&r.t>30).length;
 const tips=[];
 if(fast)tips.push(['\u26a1',fast+' wrong answer'+(fast==1?'':'s')+' took less than 10 seconds. Read the whole question and all four options before marking.']);
 if(long)tips.push(['\ud83d\udc22',long+' question'+(long==1?'':'s')+' took more than twice your average time. In the exam, skip such questions first and come back to them.']);
 if(allow&&tot<allow*.6)tips.push(['\u23f1\ufe0f','You used only '+Math.round(tot*100/allow)+'% of the time. Use the spare time to re-check marked questions.']);
 /* question timeline chart */
 const W=640,H=160,PB=26,PT=16,ch=H-PB-PT,mxT=Math.max(...rows.map(r=>r.t),1),bw=W/n;
 const bars=rows.map(r=>{const h=r.t>0?Math.max(2,r.t/mxT*ch):0;return '<rect x="'+(r.i*bw+bw*.14).toFixed(2)+'" y="'+(PT+ch-h).toFixed(2)+'" width="'+Math.max(1,bw*.72).toFixed(2)+'" height="'+h.toFixed(2)+'" rx="1.5" fill="'+AC[r.st]+'"/>'}).join('');
 const ay=(PT+ch-avg/mxT*ch).toFixed(2);
 let lab='',sx=0;rows.forEach((r,i)=>{if(i===n-1||rows[i+1].s!==r.s){const x0=sx*bw,x1=(i+1)*bw;if(sx>0)lab+='<line x1="'+x0+'" y1="'+PT+'" x2="'+x0+'" y2="'+(H-PB+4)+'" stroke="rgba(130,145,170,.5)" stroke-dasharray="3 3"/>';lab+='<text x="'+((x0+x1)/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" class="an-ax">'+esc(r.s)+'</text>';sx=i+1}});
 const chart='<svg viewBox="0 0 '+W+' '+H+'" class="an-ch" role="img"><line x1="0" y1="'+(PT+ch)+'" x2="'+W+'" y2="'+(PT+ch)+'" stroke="rgba(130,145,170,.5)"/>'+bars+'<line x1="0" y1="'+ay+'" x2="'+W+'" y2="'+ay+'" stroke="#e8a317" stroke-width="1.6" stroke-dasharray="6 4"/><text x="4" y="11" class="an-ax">Longest: '+fmtT(mxT)+'</text>'+lab+'</svg>';
 /* speed vs accuracy */
 const B=[['Quick','under 30 sec',r=>r.t<30],['Normal','30 sec to 2 min',r=>r.t>=30&&r.t<120],['Long','over 2 min',r=>r.t>=120]].map(([nm,d,f])=>{const g=rows.filter(r=>f(r)&&r.st!=='skip'),ok=g.filter(r=>r.st==='ok').length;return '<div class="an-tile" style="--c:#2f6fb5"><b>'+(g.length?Math.round(ok*100/g.length)+'%':'-')+'</b><span>'+nm+' ('+d+')<br>'+g.length+' answered</span></div>'}).join('');
 const sm=Object.entries(secs),mxS=Math.max(...sm.map(([,o])=>o.t),1);
 return '<div class="card an-card"><h3>Time analysis</h3>'+
  '<div class="an-time"><div><b>'+fmtT(tot)+'</b><span>total time used'+(allow?' of '+fmtT(allow):'')+'</span></div><div><b>'+fmtT(avg)+'</b><span>average per question</span></div></div>'+
  (allow?'<div class="an-stack" style="height:12px"><i style="width:'+use+'%;background:linear-gradient(90deg,#2f6fb5,#7a4fc2)"></i></div>':'')+
  '<div class="an-avg"><span class="n"><span style="color:'+AC.ok+'">\u25cf</span> Correct: <b>'+gav('ok')+'</b></span><span class="n"><span style="color:'+AC.bad+'">\u25cf</span> Wrong: <b>'+gav('bad')+'</b></span><span class="n"><span style="color:#8c99ad">\u25cf</span> Not attempted: <b>'+gav('skip')+'</b></span></div><small>Average time per question, by result.</small></div>'+
  '<div class="card an-card"><h3>Time on every question</h3><small>Each bar is one question. A taller bar means more time. The dashed line is your average.</small>'+chart+
  '<div class="an-key"><span><i style="background:'+AC.ok+'"></i>Correct</span><span><i style="background:'+AC.bad+'"></i>Wrong</span><span><i style="background:'+AC.skip+'"></i>Not attempted</span><span><i style="background:none;border-top:2px dashed #e8a317;height:0;border-radius:0;vertical-align:middle"></i>Average '+fmtT(avg)+'</span></div></div>'+
  '<div class="card an-card"><h3>Time by subject</h3>'+sm.map(([k,o])=>'<div class="an-sec"><div class="an-th"><b>'+esc(k)+'</b><span>'+fmtT(o.t)+'</span></div><div class="an-stack"><i style="width:'+(o.t*100/mxS)+'%;background:linear-gradient(90deg,#2f6fb5,#5a9be0)"></i></div><small>Average '+fmtT(o.t/o.n)+' per question &nbsp;|&nbsp; '+o.ok+' of '+o.n+' correct</small></div>').join('')+'</div>'+
  '<div class="card an-card"><h3>Does speed help your accuracy?</h3><small>Share of answered questions you got right, by the time you spent.</small><div class="an-tiles t3">'+B+'</div>'+
  (slow.length?'<h4>Questions that took the longest</h4><div class="an-slow">'+slow.map(r=>'<span style="border-color:'+AC[r.st]+'"><b>Q'+(r.i+1)+'</b> '+fmtT(r.t)+'</span>').join('')+'</div>':'')+
  (tips.length?'<div class="an-tips">'+tips.map(t=>'<div><span>'+t[0]+'</span><p>'+esc(t[1])+'</p></div>').join('')+'</div>':'')+'</div>'+
  '<div class="card an-card"><h3>Every question (minutes:seconds)</h3><div class="an-grid">'+rows.map(r=>'<div style="border-color:'+AC[r.st]+';background:'+AC[r.st]+'1a"><b>Q'+(r.i+1)+'</b>'+clk(r.t)+'</div>').join('')+'</div></div>';
}

/* Back button history for student pages */
['myProfile','studentView','catalogue','schedView','myReceipts','myStrength','review','pwView'].forEach(n=>{
 const f=window[n];if(typeof f!=='function')return;
 window[n]=function(...a){
  if(CUR&&!(CUR.n===n&&JSON.stringify(CUR.a)===JSON.stringify(a))){NAV.push(CUR);if(NAV.length>30)NAV.shift()}
  CUR={n,a};const r=f.apply(this,a);updBack();return r;
 };
});

/* ---- Back button: never leave the website ---- */
var SUBV=false;
(function(){
 ['loginView','signupView','forgotUserView','forgotPwView','demoView'].forEach(n=>{
  const f=window[n];if(typeof f!=='function')return;
  window[n]=function(...a){SUBV=n!=='loginView';return f.apply(this,a)};
 });
 const st=()=>history.state&&typeof history.state.stem==='number'?history.state.stem:-1;
 try{if(st()<0)history.replaceState({stem:0},'',location.href)}catch(e){}
 /* A guard page is added on the first tap, because browsers only keep history pages that follow a user action. */
 const arm=()=>{try{if(st()===0)history.pushState({stem:1},'',location.href)}catch(e){}};
 ['pointerdown','touchstart','keydown','click'].forEach(ev=>window.addEventListener(ev,arm,{passive:true,capture:true}));
 function backAction(){
  if(typeof X!=='undefined'&&X&&X.id&&!X.sub&&app.classList.contains('nt')){alert('Your test is running. Use the Submit test button when you finish.');return}
  if(NAV.length){goBack();return}
  if(!auth.currentUser){if(SUBV)loginView();return}
 }
 window.addEventListener('popstate',e=>{
  if(typeof X!=='undefined'&&X&&X.id&&!X.sub&&app.classList.contains('nt')){
   try{history.pushState({stem:1},'',location.href)}catch(x){}
   stemToast('Test is running. Use the Submit test button when you finish.',true);
   return;
  }
  if(!e.state||e.state.stem!==0)return;
  if(window.__holdRev&&Date.now()<window.__holdRev)return;
  backAction();
  setTimeout(()=>{try{history.forward()}catch(x){}},0);
 });
})();
