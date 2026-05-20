const CACHE_VERSION = "ffo-static-v1";
const STATIC_CACHE = `${CACHE_VERSION}-assets`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/contacto",
  "/guias",
  "/noticias",
  "/manifest.webmanifest",
  "/apple-icon",
  "/icon-192",
  "/icon-512",
  OFFLINE_URL
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, PAGE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isCacheablePublicPage(url) {
  return ["/", "/contacto", "/guias", "/noticias", "/offline"].some((path) =>
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );
}

function isStaticAsset(url, request) {
  return (
    url.origin === self.location.origin &&
    (
      url.pathname.startsWith("/_next/static/") ||
      url.pathname === "/manifest.webmanifest" ||
      url.pathname === "/apple-icon" ||
      url.pathname.startsWith("/icon-") ||
      request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "font" ||
      request.destination === "image"
    )
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/portal") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/_next/image")
  ) {
    return;
  }

  if (request.mode === "navigate" && isCacheablePublicPage(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;

          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  if (isStaticAsset(url, request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
  }
});
