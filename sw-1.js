/* STEM Coaching app: opens the saved copy of the site instantly, and quietly downloads the newest copy in the background
   (the newest copy shows the next time the site is opened). Works offline with the last saved page.
   Logins, tests, payments and all other requests go straight to the network (never cached).
   When you upload a new index.html, change the number in the name below (v6 -> v7) so everyone gets it on the very next open.
   NEW: also shows phone notifications (test reminders and notices) sent from the notification server. */
var C='stem-app-v6';
self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var r=e.request;
 if(r.method!=='GET'||r.mode!=='navigate')return;
 e.respondWith(caches.open(C).then(function(cache){
  return cache.match(r,{ignoreSearch:true}).then(function(hit){
   var net=fetch(r,{cache:'no-cache'}).then(function(res){
    if(res&&res.ok)cache.put(r,res.clone());
    return res;
   });
   if(hit){e.waitUntil(net.catch(function(){}));return hit}
   return net.catch(function(){return cache.match('/')});
  });
 }));
});

/* Phone notifications. The server sends data-only messages: {title, body, url, tag}. */
self.addEventListener('push',function(e){
 var d={};
 try{d=e.data?e.data.json():{}}catch(x){}
 var n=d.notification||{};
 var x=d.data||{};
 var title=x.title||n.title||'STEM Coaching';
 var opt={
  body:x.body||n.body||'',
  icon:'/icon-192.png',
  badge:'/icon-192.png',
  data:{url:x.url||'/'}
 };
 if(x.tag)opt.tag=x.tag;
 e.waitUntil(self.registration.showNotification(title,opt));
});
self.addEventListener('notificationclick',function(e){
 e.notification.close();
 var u=(e.notification.data&&e.notification.data.url)||'/';
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
  for(var i=0;i<list.length;i++){
   if('focus' in list[i])return list[i].focus();
  }
  return clients.openWindow(u);
 }));
});
