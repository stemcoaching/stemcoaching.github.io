/* STEM Coaching app: opens the saved copy of the site instantly, and quietly downloads the newest copy in the background
   (the newest copy shows the next time the site is opened). Works offline with the last saved page.
   Logins, tests, payments and all other requests go straight to the network (never cached).
   When you upload a new index.html, change the number in the name below (v3 -> v4) so everyone gets it on the very next open. */
var C='stem-app-v4';
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
     const FILES = [
  '/', '/index.html', '/style.css', '/boot.js',
  '/assets.js', '/app.js', '/ui.js', '/search.js',
  '/logo.webp'
];
  });
 }));
});
