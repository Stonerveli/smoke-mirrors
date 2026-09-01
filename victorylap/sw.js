/* VictoryLap service worker. Scope is /smoke-mirrors/victorylap/ ONLY.
   It must never answer for Smoke & Mirrors. Campaign data lives in
   localStorage shared with S&M (same origin) and is never cached. */
var CACHE="victorylap-v2";
var SHELL=["./","./index.html","./manifest.webmanifest","./vl-icon.svg","./vl-icon-192.png","./vl-icon-512.png","./vl-icon-maskable.png"];
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(k){
  return Promise.all(k.filter(function(x){return x.indexOf("victorylap")===0&&x!==CACHE;}).map(function(x){return caches.delete(x);}));
 }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
 if(e.request.method!=="GET")return;
 var u=new URL(e.request.url);
 /* hard guard: only ever handle requests inside our own folder */
 if(u.origin!==self.location.origin||u.pathname.indexOf("/smoke-mirrors/victorylap/")!==0)return;
 e.respondWith(fetch(e.request).then(function(r){
  var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);}).catch(function(){});return r;
 }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match("./index.html");});}));
});