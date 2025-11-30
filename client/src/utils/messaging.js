import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../api/firebase';

let messaging = null;

/**
 * Initialize Firebase Messaging
 */
export const initializeMessaging = async () => {
    try {
        // Lazy import to avoid errors in non-supporting browsers
        const { getMessaging } = await import('firebase/messaging');
        const { app } = await import('../api/firebase');

        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error('Error initializing Firebase Messaging:', error);
        throw error;
    }
};

/**
 * Request notification permission from the user
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async () => {
    try {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Get FCM token for this device
 * @param {string} userId - Current user ID
 * @returns {Promise<string|null>} FCM token or null
 */
export const getFCMToken = async (userId) => {
    try {
        if (!messaging) {
            await initializeMessaging();
        }

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

        if (!vapidKey) {
            console.error('VAPID key not found in environment variables');
            return null;
        }

        // Register service worker first
        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;
        }

        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
        });

        if (token) {
            // Save token to Firestore
            await saveFCMToken(userId, token);
            return token;
        }

        return null;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Save FCM token to Firestore
 * @param {string} userId - User ID
 * @param {string} token - FCM token
 */
const saveFCMToken = async (userId, token) => {
    try {
        const tokenRef = doc(db, 'users', userId, 'tokens', token);
        await setDoc(tokenRef, {
            token,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            platform: 'web'
        }, { merge: true });
        console.log('FCM Token saved successfully to Firestore:', token);
    } catch (error) {
        console.error('Error saving FCM token:', error);
        throw error;
    }
};

/**
 * Handle foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export const handleForegroundMessages = (callback) => {
    if (!messaging) {
        return () => { };
    }

    const unsubscribe = onMessage(messaging, (payload) => {
        // Show browser notification even when app is open
        if (payload.notification) {
            const { title, body, icon } = payload.notification;

            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon: icon || '/vite.svg',
                    badge: '/vite.svg',
                    tag: payload.data?.type || 'default',
                    data: payload.data
                });
            }
        }

        // Call custom callback
        if (callback) {
            callback(payload);
        }
    });

    return unsubscribe;
};

/**
 * Initialize FCM for a logged-in user
 * @param {string} userId - User ID
 * @param {Function} messageCallback - Optional callback for foreground messages
 */
export const setupFCM = async (userId, messageCallback) => {
    try {
        // Request permission
        const hasPermission = await requestNotificationPermission();

        if (!hasPermission) {
            return;
        }

        // Get and save token
        await getFCMToken(userId);

        // Setup foreground message handler
        if (messageCallback) {
            handleForegroundMessages(messageCallback);
        }
    } catch (error) {
        console.error('Error setting up FCM:', error);
    }
};
