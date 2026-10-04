const CACHE = "plant-care-v3";

const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      body: event.data ? event.data.text() : ""
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "🌱 Plant Care",
      {
        body: data.body || "水やりチェックの時間だよ 💧",
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        tag: data.tag || "plant-care",
        data: {
          url: "./index.html"
        }
      }
    )
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(list => {
        for (const client of list) {
          if ("focus" in client) {
            client.navigate("./index.html");
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow("./index.html");
        }
      })
  );
});
