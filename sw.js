const CACHE="detetive-qr-v1";
const FILES=["./","./index.html","./app.js","./manifest.json"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener("fetch",event=>event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request))));