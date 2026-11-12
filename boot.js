
/* The "NEET, Board, Medical and Foundation Coaching in Barabanki" text block shows only on the homepage (login page). */
(function(){
 var app=document.getElementById('app'),box=document.getElementById('about-stem');
 if(!app||!box)return;
 function sync(){
  var loading=!app.children.length;
  box.style.display=(loading||app.querySelector('.home'))?'':'none';
 }
 new MutationObserver(sync).observe(app,{childList:true,subtree:true});
 sync();
})();

;

/* app: lets the website install on the phone like an app */
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}

;

/* "Install app" banner: shows on the phone when the website can be installed (not inside a test, hidden for 3 days after "Not now") */
(function(){
 var ev=null,box=null,KEY='stemInstallNo';
 function no(){try{return Date.now()-(+localStorage.getItem(KEY)||0)<3*864e5}catch(e){return false}}
 function inTest(){var a=document.getElementById('app');return !!(a&&a.classList.contains('nt'))}
 function sync(){if(box)box.style.display=(ev&&!no()&&!inTest())?'flex':'none'}
 function build(){
  if(box)return;
  box=document.createElement('div');box.id='inst';
  box.setAttribute('style','position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:90;display:none;align-items:center;gap:10px;padding:10px 12px;background:#17306b;color:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.3);font-size:.9rem');
  box.innerHTML='<img src="/icon-192.png" alt="" style="width:40px;height:40px;border-radius:10px;background:#fff;flex:0 0 auto"><div style="flex:1;min-width:0;line-height:1.25"><b>Install STEM Coaching app</b><br><span style="opacity:.85;font-size:.8rem">Open faster, like an app</span></div><button type="button" id="instgo" style="width:auto;min-height:0;margin:0;padding:8px 14px;background:#fff;color:#17306b;border-radius:10px;border:0;font-weight:700">Install</button><button type="button" id="instno" aria-label="Not now" style="width:auto;min-height:0;margin:0;padding:6px 10px;background:transparent;color:#fff;border:0;font-size:1.1rem;box-shadow:none">&#10005;</button>';
  document.body.appendChild(box);
  document.getElementById('instgo').onclick=function(){
   if(!ev)return;var e=ev;ev=null;sync();
   try{e.prompt();e.userChoice.then(function(c){if(c&&c.outcome!=='accepted'){try{localStorage.setItem(KEY,String(Date.now()))}catch(x){}}})}catch(x){}
  };
  document.getElementById('instno').onclick=function(){try{localStorage.setItem(KEY,String(Date.now()))}catch(x){}sync()};
 }
 window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();ev=e;build();sync()});
 window.addEventListener('appinstalled',function(){ev=null;sync()});
 var a=document.getElementById('app');
 if(a)new MutationObserver(sync).observe(a,{attributes:true,attributeFilter:['class']});
})();

;

/* Logo watermark on every PDF made by this website (faint, in the middle of every page) */
function wmApply(){
 try{
  var J=window.jspdf&&window.jspdf.jsPDF;if(!J)return;
  var LOGO=window.STEM_LOGO_PNG;
  function stamp(doc){
   if(doc.__wm)return;doc.__wm=1;
   var n=doc.getNumberOfPages(),cur=n;
   try{cur=doc.internal.getCurrentPageInfo().pageNumber}catch(e){}
   for(var p=1;p<=n;p++){
    if(doc.__nowm&&doc.__nowm.indexOf(p)>-1)continue;
    doc.setPage(p);
    var W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),s=Math.min(W,H)*0.6;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({opacity:0.09}));
    doc.addImage(LOGO,'PNG',(W-s)/2,(H-s)/2,s,s,'stemwm');
    doc.restoreGraphicsState();
   }
   doc.setPage(cur);
  }
  function Wrapped(){
   var d=new (Function.prototype.bind.apply(J,[null].concat([].slice.call(arguments))))();
   var sv=d.save;
   d.save=function(){try{stamp(d)}catch(e){}return sv.apply(d,arguments)};
   return d;
  }
  Wrapped.prototype=J.prototype;Wrapped.API=J.API;Wrapped.version=J.version;Wrapped.GState=J.GState;
  try{window.jspdf.jsPDF=Wrapped}catch(e){}
  if(window.jspdf.jsPDF!==Wrapped){try{Object.defineProperty(window.jspdf,'jsPDF',{value:Wrapped,configurable:true,writable:true})}catch(e){}}
 }catch(e){}
}
/* PDF libraries load in the background after the page is ready (they are not needed to show the homepage or log in) */
var __pdfP=null;
function pdfLoad(){
 if(__pdfP)return __pdfP;
 function ld(u){return new Promise(function(ok,no){var t=document.createElement('script');t.src=u;t.onload=ok;t.onerror=function(){no(new Error('load'))};document.head.appendChild(t)})}
 __pdfP=ld('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(function(){return ld('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')}).then(function(){wmApply()}).catch(function(e){__pdfP=null;throw e});
 return __pdfP;
}
window.addEventListener('load',function(){setTimeout(function(){pdfLoad().catch(function(){})},4000)});
