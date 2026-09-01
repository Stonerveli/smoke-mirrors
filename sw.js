/* Smoke & Mirrors service worker.
   IMPORTANT: /smoke-mirrors/victorylap/ is a SEPARATE installed app with its
   own service worker. This worker must never answer for that path, or the two
   apps fight over the same scope and overwrite each other on install. */
var CACHE="smokemirrors-v3";
var SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-192.png","./icon-maskable-512.png"];
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){
  return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){});}));
 }).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(k){
  return Promise.all(k.filter(function(x){return x.indexOf("smokemirrors")===0&&x!==CACHE;}).map(function(x){return caches.delete(x);}));
 }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
 if(e.request.method!=="GET")return;
 var u=new URL(e.request.url);
 if(u.origin!==self.location.origin)return;
 /* hands off VictoryLap entirely */
 if(u.pathname.indexOf("/smoke-mirrors/victorylap/")===0)return;
 e.respondWith(fetch(e.request).then(function(r){
  var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);}).catch(function(){});return r;
 }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match("./index.html");});}));
});