/**
 * Web Notifications Utility
 * Handles browser notifications for PWA
 */

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = () => {
    return 'Notification' in window;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) {
        console.log('Notifications not supported');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Check if notification permission is granted
 */
export const hasNotificationPermission = () => {
    return isNotificationSupported() && Notification.permission === 'granted';
};

/**
 * Show a browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
    if (!hasNotificationPermission()) {
        return null;
    }

    const defaultOptions = {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        tag: 'dating-app',
        ...options
    };

    try {
        return new Notification(title, defaultOptions);
    } catch (error) {
        console.error('Error showing notification:', error);
        return null;
    }
};

/**
 * Show notification for new message
 */
export const showMessageNotification = (senderName, messageText, senderPhoto, chatId) => {
    const notification = showNotification(
        `Nuevo mensaje de ${senderName}`,
        {
            body: messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText,
            icon: senderPhoto || '/icon-192.png',
            tag: `message-${chatId}`,
            data: {
                url: `/chat/${chatId}`,
                type: 'message'
            }
        }
    );

    if (notification) {
        notification.onclick = () => {
            window.focus();
            window.location.href = `/chat/${chatId}`;
            notification.close();
        };
    }

    return notification;
};

/**
 * Show notification for new match
 */
export const showMatchNotification = (matchedUserName, matchedUserPhoto, matchId) => {
    const notification = showNotification(
        '¡Es un Match! 💗',
        {
            body: `Tienes un nuevo match con ${matchedUserName}`,
            icon: matchedUserPhoto || '/icon-192.png',
            tag: `match-${matchId}`,
            requireInteraction: true,
            data: {
                url: `/chat/${matchId}`,
                type: 'match'
            }
        }
    );

    if (notification) {
        notification.onclick = () => {
            window.focus();
            window.location.href = `/chat/${matchId}`;
            notification.close();
        };
    }

    return notification;
};

/**
 * Check if document is hidden (app in background)
 */
export const isAppInBackground = () => {
    return document.hidden || document.visibilityState === 'hidden';
};
