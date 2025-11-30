/**
 * Keep-Alive Service
 * 
 * Maintains backend server active by sending periodic ping requests.
 * This prevents Render free tier from sleeping after 15 minutes of inactivity.
 * Also ensures the matchWorker stays running to process likes into matches.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

let pingInterval = null;
let isActive = false;

/**
 * Ping the server to keep it alive
 * @returns {Promise<boolean>} True if server responded successfully
 */
const pingServer = async () => {
    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const text = await response.text();
            console.log('✅ Server is alive:', text);
            return true;
        } else {
            console.warn('⚠️ Server responded with error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to ping server:', error.message);
        return false;
    }
};

/**
 * Start the keep-alive service
 * Makes an immediate ping and then continues every 2 minutes
 */
export const startKeepAlive = () => {
    if (isActive) {
        console.log('ℹ️ Keep-alive already running');
        return;
    }

    console.log('🚀 Starting keep-alive service...');
    isActive = true;

    // Immediate ping to wake up server
    pingServer();

    // Set up periodic pinging
    pingInterval = setInterval(() => {
        pingServer();
    }, PING_INTERVAL);
};

/**
 * Stop the keep-alive service
 * Useful when user logs out or navigates away
 */
export const stopKeepAlive = () => {
    if (!isActive) {
        return;
    }

    console.log('🛑 Stopping keep-alive service');

    if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
    }

    isActive = false;
};

/**
 * Check if keep-alive is currently active
 * @returns {boolean}
 */
export const isKeepAliveActive = () => {
    return isActive;
};

/**
 * Get the configured API URL
 * @returns {string}
 */
export const getApiUrl = () => {
    return API_URL;
};

// Clean up on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        stopKeepAlive();
    });
}
