// Service worker de Mordus de Médecine : reçoit et affiche les notifications push.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  const title = d.title || 'Mordus de Médecine';
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || './' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // ferme aussi les autres notifications qui mènent au même endroit
  event.waitUntil(self.registration.getNotifications().then(l => l.forEach(n => { if (n !== event.notification && n.data && event.notification.data && n.data.url === event.notification.data.url) n.close(); })).catch(() => {}));
  const url = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope) && 'focus' in c) { return c.focus().then(() => ('navigate' in c ? c.navigate(url) : c)); }
    }
    return self.clients.openWindow(url);
  }));
});
