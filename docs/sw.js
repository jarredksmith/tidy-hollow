const CACHE='tidy-hollow-v0.2.1';
const FILES=['./','./index.html','./style.css?v=0.2.1','./app.js?v=0.2.1','./core.js?v=0.2.1','./room.js?v=0.2.1','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
// Revalidate the shell during installation; a previous HTTP cache must not seed a new release.
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(new URL(f,self.registration.scope),{cache:'reload'}))))));
// Do not forcibly replace an active cleaning session. New workers activate when old clients close.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tidy-hollow-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||u.origin!==scope.origin)return;
 const home=event.request.mode==='navigate'&&(u.pathname===scope.pathname||u.pathname===new URL('index.html',scope).pathname);
 const known=FILES.some(f=>new URL(f,scope).href===u.href);
 if(!home&&!known)return; // Never handle AI calls, credentials or camera images.
 const key=home?new URL('./index.html',scope).href:event.request;
 event.respondWith(fetch(new Request(event.request,{cache:'no-store'})).then(r=>{
  if(r.ok){const copy=r.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(key,copy)));}
  return r;
 }).catch(async()=>await caches.match(key)||new Response('Open Tidy Hollow online once to prepare offline access.',{status:503,headers:{'Content-Type':'text/plain'}})));
});
