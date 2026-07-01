/* 離線快取：裝到主畫面後沒有網路也能玩 */
const CACHE = "opa-chinese-v9";
const CORE = [
  "./", "./index.html", "./recorder.html", "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-180.png", "./images/avatar.png",
  "./music/song1.m4a", "./music/song2.m4a", "./music/song3.m4a",
  "./music/song4.m4a", "./music/song5.m4a", "./music/song6.m4a", "./music/song7.m4a",
  "./music/song8.m4a", "./music/song9.m4a", "./music/song10.m4a", "./music/song11.m4a"
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

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const req = e.request;
  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // 網頁(HTML)用 network-first：永遠先抓最新,離線才用快取 → 更新不會卡舊版
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // 其他靜態資源(音檔/圖/音樂)用 cache-first：快、省流量,離線可用
  e.respondWith(
    caches.match(req).then(hit =>
      hit || fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => hit)
    )
  );
});
