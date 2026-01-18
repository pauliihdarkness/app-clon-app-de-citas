/* eslint-env serviceworker */
/* global importScripts, firebase, clients */
// firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyDvfuL1z2MlHXqpE6y8c_L8SXzNgCJ_giw",
    authDomain: "citas-app-8ab2e.firebaseapp.com",
    projectId: "citas-app-8ab2e",
    storageBucket: "citas-app-8ab2e.firebasestorage.app",
    messagingSenderId: "1089831035798",
    appId: "1:1089831035798:web:ad823de6c7d7aabb5e3e4b"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'Nueva notificación';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: payload.data?.type || 'default',
        data: payload.data,
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions)
        .catch((error) => {
            console.error('Error showing notification:', error);
        });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data;
    let urlToOpen = '/';

    // Route based on notification type
    if (data) {
        if (data.type === 'message' && data.chatId) {
            urlToOpen = `/chat/${data.chatId}`;
        } else if (data.type === 'match' && data.matchId) {
            urlToOpen = `/chat/${data.matchId}`;
        } else if (data.url) {
            urlToOpen = data.url;
        }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
