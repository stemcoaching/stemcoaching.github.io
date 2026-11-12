
/* minimize / expand for every card and panel (not during a test) */
(function(){
 var app=document.getElementById('app');
 function titleOf(c){var k=[].filter.call(c.children,function(x){return !x.classList.contains('mz')});
  for(var i=0;i<Math.min(2,k.length);i++){var t=k[i].tagName;if(/^(H[1-6]|SUMMARY)$/.test(t)||(/^(B|STRONG)$/.test(t)&&k.length>=5))return {t:k[i],n:k.length}}return null}
 function deco(){
  if(app.classList.contains('nt'))return;
  [].forEach.call(app.querySelectorAll('.card'),function(c){
   if(c.tagName==='DETAILS'||c.querySelector(':scope>.mz')||/(^|\s)(rq|rhero|shero|ar|sch|tc|mzx)(\s|$)/.test(c.className)||c.querySelector(':scope>.sch'))return;
   var d=getComputedStyle(c).display;if(d==='flex'||d==='grid'||d==='inline-flex')return;
   var r=titleOf(c);if(!r||r.n<4)return;
   r.t.classList.add('mt');c.classList.add('mzc');
   var b=document.createElement('button');b.type='button';b.className='mz';b.textContent='\u2212';b.title='Minimize';
   b.onclick=function(e){e.stopPropagation();var m=c.classList.toggle('mini');b.textContent=m?'+':'\u2212';b.title=m?'Expand':'Minimize';fab()};
   c.insertBefore(b,c.firstChild);
  });
  fab();
 }
 function fab(){
  var f=document.getElementById('mzf'),bs=[].slice.call(app.querySelectorAll('.card>.mz'));
  if(bs.length<3||app.classList.contains('nt')){if(f)f.style.display='none';return}
  var open=bs.some(function(b){return !b.parentNode.classList.contains('mini')});
  if(!f){f=document.createElement('button');f.id='mzf';f.type='button';
   f.onclick=function(){var all=[].slice.call(app.querySelectorAll('.card>.mz')),o=all.some(function(b){return !b.parentNode.classList.contains('mini')});
    all.forEach(function(b){b.parentNode.classList.toggle('mini',o);b.textContent=o?'+':'\u2212'});fab()};
   document.body.appendChild(f)}
  f.textContent=open?'Minimize all':'Expand all';f.style.display='';
 }
 var tm=0;new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(deco,60)}).observe(app,{childList:true,subtree:true});
})();

;

/* side menu: three-line button at the top shows every tab */
(function(){
 var tb=document.createElement('div');tb.id='tb';
 tb.innerHTML='<button id="hbg" type="button" aria-label="Open menu"><span></span><span></span><span></span></button><b>STEM Coaching Institute</b>';
 var ov=document.createElement('div');ov.id='dov';
 var dr=document.createElement('nav');dr.id='drw';dr.setAttribute('aria-label','Menu');
 var hd=document.querySelector('header');hd.parentNode.insertBefore(tb,hd.nextSibling);
 document.body.appendChild(ov);document.body.appendChild(dr);
 var STU=[['Study',[['My tests','studentView'],['Schedule','schedView'],['Daily quiz','quizView'],['Mistakes','mistakesView'],['My strengths','myStrength'],['Topper wall','wallView']]],['Tests and fees',[['Test series','catalogue'],['Choose NEET / JEE','examPick'],['My fees','myReceipts'],['Refer & earn','referView']]]];
 function isTeacher(){return (typeof TEACHER!=='undefined'&&me&&me.email===TEACHER)||(typeof STAFF!=='undefined'&&!!STAFF)}
 function groups(){
  if(typeof me==='undefined'||!me){var L=function(u){return function(){location.href=u}};return [['Welcome',[['Login',function(){loginView()}],['Free demo test',function(){demoView()}],['Create account',function(){signupView()}],['Forgot password?',function(){forgotPwView()}]]],['About the institute',[['About us',L('about.html')],['Pricing',L('pricing.html')],['Contact us',L('contact.html')],['Terms',L('terms.html')],['Privacy',L('privacy.html')],['Refund policy',L('refund.html')]]]]}
  if(isTeacher()){
   return TGROUPS.map(function(g){return [g[0],g[1].filter(function(t){return tabOk(t[0])}).map(function(t){return [t[1],function(){teacherView(t[0])}]})]}).filter(function(g){return g[1].length});
  }
  if(isParent())return [['Parent',[["Parent's Dashboard",function(){parentView()}]]]];
  return STU.map(function(g){return [g[0],g[1].map(function(t){return [t[0],function(){window[t[1]]()}]})]});
 }
 function item(label,fn){var b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=function(){close();try{fn()}catch(e){alert(e.message||e)}};return b}
 function lab(t){var d=document.createElement('div');d.className='dl';d.textContent=t;return d}
 function build(){
  dr.innerHTML='<div class="dh"><span>Menu</span><button type="button" class="dx" aria-label="Close menu">\u2715</button></div>';
  dr.querySelector('.dx').onclick=close;
  var sb=document.createElement('input');sb.type='search';sb.className='ds';sb.placeholder='Search the menu\u2026';sb.setAttribute('aria-label','Search the menu');sb.autocomplete='off';dr.appendChild(sb);
  var nm=document.createElement('div');nm.className='dn';nm.textContent='Nothing found.';
  groups().forEach(function(g){dr.appendChild(lab(g[0]));g[1].forEach(function(t){dr.appendChild(item(t[0],t[1]))})});
  if(typeof me!=='undefined'&&me){dr.appendChild(lab('Account'));
  if(!isTeacher()&&!isParent())dr.appendChild(item('My profile',function(){myProfile()}));
  if(!isParent())dr.appendChild(item('Change password',function(){pwView()}));
  dr.appendChild(item('Logout',function(){auth.signOut()}))}
  dr.appendChild(nm);
  function filt(){
   var q=sb.value.trim().toLowerCase(),any=false,kids=[].slice.call(dr.children).filter(function(x){return x!==sb&&x!==nm&&!x.classList.contains('dh')}),cur=null,curShown=false;
   kids.forEach(function(x){
    if(x.classList.contains('dl')){cur=x;curShown=false;x.style.display=q?'none':'';return}
    var ok=!q||x.textContent.toLowerCase().indexOf(q)>=0;
    x.style.display=ok?'':'none';
    if(ok){any=true;if(q&&cur)cur.style.display=''}
   });
   nm.style.display=(q&&!any)?'block':'none';
  }
  sb.oninput=filt;
  sb.onkeydown=function(e){if(e.key==='Enter'){var f=[].slice.call(dr.querySelectorAll('button:not(.dx)')).filter(function(b){return b.style.display!=='none'})[0];if(f)f.click()}};
 }
 window.stemGroups=groups;
 function open(){build();document.body.classList.add('dopen')}
 function close(){document.body.classList.remove('dopen')}
 tb.querySelector('#hbg').onclick=open;ov.onclick=close;
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
 var bar=document.getElementById('bar');
 function sync(){var show=bar.innerHTML.trim()!==''||(typeof me!=='undefined'&&!me);tb.style.display=show?'flex':'none';if(!show)close()}
 new MutationObserver(sync).observe(bar,{childList:true,subtree:true});new MutationObserver(sync).observe(document.getElementById('app'),{childList:true});sync();
})();

;

/* tap the header to return to the home screen shown after login */
(function(){var h=document.querySelector('header');if(!h)return;h.title='Home';
h.addEventListener('click',function(){
 try{var app=document.getElementById('app');if(app&&app.classList.contains('nt'))return;
  if(typeof me==='undefined'||!me){loginView();return}
  if((typeof TEACHER!=='undefined'&&me.email===TEACHER)||(typeof STAFF!=='undefined'&&STAFF)){teacherView();return}
  myProfile();window.scrollTo(0,0)}catch(e){}
});})();

;

/* every student page ends with the Together Towards Excellence banner */
(function(){var app=document.getElementById('app'),t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){if(app.querySelector('.phero')&&!app.querySelector('.tg')&&!app.classList.contains('nt')){app.insertAdjacentHTML('beforeend',tgCard())}},80)}).observe(app,{childList:true});})();

;

/* browser Back goes one page back; Reload keeps the same page */
(function(){
 var NAMES=['myProfile','studentView','catalogue','schedView','quizView','mistakesView','myStrength','wallView','myReceipts','referView','pwView','teacherView'];
 var restoring=false,last=null,boot=false,KEY='stemview';
 function rd(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
 function wr(st){try{sessionStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
 function same(a,b){return a&&b&&a.n===b.n&&JSON.stringify(a.a)===JSON.stringify(b.a)}
 NAMES.forEach(function(n){var f=window[n];if(typeof f!=='function')return;
  window[n]=function(){
   var args=[].slice.call(arguments),s=args.filter(function(x){return typeof x==='string'})[0];
   if(typeof me!=='undefined'&&me&&!restoring){
    var st={n:n,a:s===undefined?[]:[s],u:me.uid};
    if(!boot){boot=true;var sv=rd();
     if(sv&&sv.u===me.uid&&typeof window[sv.n]==='function'&&!s&&(sv.n!==n||sv.a.length)){
      restoring=true;last=sv;history.replaceState(sv,'');
      try{return window[sv.n].apply(null,sv.a)}finally{restoring=false}}
     history.replaceState(st,'');last=st;wr(st);return f.apply(this,args)}
    if(same(last,st))history.replaceState(st,'');else history.pushState(st,'');
    last=st;wr(st);
   }
   return f.apply(this,args)}});
 var lv=window.loginView;
 if(typeof lv==='function')window.loginView=function(){try{sessionStorage.removeItem(KEY)}catch(e){}last=null;boot=false;return lv.apply(this,arguments)};
 window.addEventListener('popstate',function(e){
  var st=e.state;if(!st||typeof me==='undefined'||!me||st.u!==me.uid)return;
  if(window.__holdRev&&Date.now()<window.__holdRev)return;
  var app=document.getElementById('app');
  if(app&&app.classList.contains('nt')){if(last)history.pushState(last,'');return}
  restoring=true;last=st;wr(st);
  try{window.scrollTo(0,0);window[st.n].apply(null,st.a)}finally{restoring=false}
 });
})();

;

/* new look on every page except test-taking screens */
(function(){var app=document.getElementById('app');function nx(){document.body.classList.toggle('nx',!app.classList.contains('nt')&&!app.querySelector('.ins,.th,#rv1'))}
new MutationObserver(nx).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});nx();})();
