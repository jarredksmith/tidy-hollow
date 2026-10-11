const CACHE='tidy-hollow-v2';
const FILES=['./','./index.html','./style.css','./app.js','./core.js','./room.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tidy-hollow-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Only cache our static app shell. Never intercept or cache AI requests or camera frames.
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin)return;
 const known=FILES.some(f=>new URL(f,self.registration.scope).href===u.href);if(!known)return;
 event.respondWith(fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));}return r;}).catch(()=>caches.match(event.request)));
});
