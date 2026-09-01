/* VictoryLap service worker. Scope is this folder only, so it never
   collides with the Smoke & Mirrors worker one level up.
   Campaign data lives in localStorage (shared per-origin) and is never cached. */
var CACHE="victorylap-v1";
var SHELL=["./","./index.html","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable.png"];
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
 if(e.request.method!=="GET")return;
 e.respondWith(fetch(e.request).then(function(r){
  var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);}).catch(function(){});return r;
 }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match("./index.html");});}));
});