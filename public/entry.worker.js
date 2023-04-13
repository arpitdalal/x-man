// app/entry.worker.ts
var DATA_CACHE = "data-cache";
var DOCUMENT_CACHE = "document-cache";
function debug(...messages) {
  console.log(...messages);
}
async function handleInstall(event) {
  debug("Service worker installed");
}
async function handleActivate(event) {
  debug("Service worker activated");
}
async function handleMessage(event) {
  const cachePromises = /* @__PURE__ */ new Map();
  if (event.data.type === "REMIX_NAVIGATION") {
    const { isMount, location, matches, manifest } = event.data;
    const documentUrl = location.pathname + location.search + location.hash;
    const [dataCache, documentCache, existingDocument] = await Promise.all([
      caches.open(DATA_CACHE),
      caches.open(DOCUMENT_CACHE),
      caches.match(documentUrl)
    ]);
    if (!existingDocument || !isMount) {
      debug("Caching document for", documentUrl);
      cachePromises.set(
        documentUrl,
        documentCache.add(documentUrl).catch((error) => {
          debug(`Failed to cache document for ${documentUrl}:`, error);
        })
      );
    }
    if (isMount) {
      for (const match of matches) {
        if (manifest.routes[match.id].hasLoader) {
          const params = new URLSearchParams(location.search);
          params.set("_data", match.id);
          let search = params.toString();
          search = search ? `?${search}` : "";
          const url = location.pathname + search + location.hash;
          if (!cachePromises.has(url)) {
            debug("Caching data for", url);
            cachePromises.set(
              url,
              dataCache.add(url).catch((error) => {
                debug(`Failed to cache data for ${url}:`, error);
              })
            );
          }
        }
      }
    }
  }
  await Promise.all(cachePromises.values());
}
var handlePush = async (event) => {
  const data = JSON.parse(event == null ? void 0 : event.data.text());
  const title = data.title ? data.title : "Remix PWA";
  const options = {
    body: data.body ? data.body : "Notification Body Text",
    icon: data.icon ? data.icon : "/icons/android-icon-192x192.png",
    badge: data.badge ? data.badge : "/icons/android-icon-48x48.png",
    dir: data.dir ? data.dir : "auto",
    image: data.image ? data.image : void 0,
    silent: data.silent ? data.silent : false
  };
  self.registration.showNotification(title, {
    ...options
  });
};
self.addEventListener("install", (event) => {
  event.waitUntil(handleInstall(event).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(handleActivate(event).then(() => self.clients.claim()));
});
self.addEventListener("message", (event) => {
  event.waitUntil(handleMessage(event));
});
self.addEventListener("push", (event) => {
  event.waitUntil(handlePush(event));
});
