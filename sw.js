/* STEM Coaching app: always loads the newest site when online; shows the last saved page when offline.
   Logins, tests, payments and all other requests go straight to the network (never cached). */
var C='stem-app-v1';
self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var r=e.request;
 if(r.method!=='GET'||r.mode!=='navigate')return;
 e.respondWith(fetch(r).then(function(res){
  var c=res.clone();caches.open(C).then(function(x){x.put(r,c)});return res;
 }).catch(function(){return caches.match(r).then(function(m){return m||caches.match('/')})}));
});
