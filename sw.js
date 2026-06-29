/* 離線快取：裝到主畫面後沒有網路也能玩 */
const CACHE = "opa-chinese-v4";
const CORE = [
  "./", "./index.html", "./recorder.html", "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-180.png", "./images/avatar.png",
  "./music/song1.m4a", "./music/song2.m4a", "./music/song3.m4a",
  "./music/song4.m4a", "./music/song5.m4a", "./music/song6.m4a", "./music/song7.m4a"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* cache-first：先用快取，沒有再連網並順手存起來（含爺爺的錄音檔） */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      }).catch(() => hit)
    )
  );
});
