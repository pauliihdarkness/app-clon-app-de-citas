/**
 * Cloudflare Turnstile Integration Utility
 * Provides functions to load, render, and manage Turnstile widgets
 */

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

/**
 * Load Turnstile script dynamically
 * @returns {Promise<void>}
 */
export const loadTurnstileScript = () => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.turnstile) {
            resolve();
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', resolve);
            existingScript.addEventListener('error', reject);
            return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = TURNSTILE_SCRIPT_URL;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log('✅ Cloudflare Turnstile loaded successfully');
            resolve();
        };

        script.onerror = () => {
            console.error('❌ Failed to load Cloudflare Turnstile');
            reject(new Error('Failed to load Turnstile script'));
        };

        document.head.appendChild(script);
    });
};

/**
 * Render Turnstile widget
 * @param {string|HTMLElement} element - Element ID or DOM element
 * @param {Object} options - Turnstile options
 * @returns {Promise<string>} Widget ID
 */
export const renderTurnstile = async (element, options = {}) => {
    await loadTurnstileScript();

    const container = typeof element === 'string'
        ? document.getElementById(element)
        : element;

    if (!container) {
        throw new Error('Turnstile container element not found');
    }

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey) {
        console.warn('⚠️ VITE_TURNSTILE_SITE_KEY not configured');
        throw new Error('Turnstile site key not configured');
    }

    const defaultOptions = {
        sitekey: siteKey,
        theme: 'light',
        size: 'normal',
        ...options
    };

    try {
        const widgetId = window.turnstile.render(container, defaultOptions);
        console.log('🛡️ Turnstile widget rendered:', widgetId);
        return widgetId;
    } catch (error) {
        console.error('❌ Error rendering Turnstile widget:', error);
        throw error;
    }
};

/**
 * Get Turnstile token from widget
 * @param {string} widgetId - Widget ID returned from render
 * @returns {string|null} Token or null if not ready
 */
export const getTurnstileToken = (widgetId) => {
    if (!window.turnstile) {
        console.warn('⚠️ Turnstile not loaded');
        return null;
    }

    try {
        return window.turnstile.getResponse(widgetId);
    } catch (error) {
        console.error('❌ Error getting Turnstile token:', error);
        return null;
    }
};

/**
 * Reset Turnstile widget
 * @param {string} widgetId - Widget ID to reset
 */
export const resetTurnstile = (widgetId) => {
    if (!window.turnstile) {
        console.warn('⚠️ Turnstile not loaded');
        return;
    }

    try {
        window.turnstile.reset(widgetId);
        console.log('🔄 Turnstile widget reset');
    } catch (error) {
        console.error('❌ Error resetting Turnstile widget:', error);
    }
};

/**
 * Remove Turnstile widget
 * @param {string} widgetId - Widget ID to remove
 */
export const removeTurnstile = (widgetId) => {
    if (!window.turnstile) {
        return;
    }

    try {
        window.turnstile.remove(widgetId);
        console.log('🗑️ Turnstile widget removed');
    } catch (error) {
        console.error('❌ Error removing Turnstile widget:', error);
    }
};

/**
 * Verify Turnstile token on server
 * @param {string} token - Turnstile token
 * @param {string} endpoint - Server endpoint for verification
 * @returns {Promise<boolean>} Verification result
 */
export const verifyTurnstileToken = async (token, endpoint = '/api/verify-turnstile') => {
    if (!token) {
        console.warn('⚠️ No Turnstile token provided');
        return false;
    }

    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Turnstile token verified');
            return true;
        } else {
            console.warn('⚠️ Turnstile verification failed:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error verifying Turnstile token:', error);
        return false;
    }
};

export default {
    loadTurnstileScript,
    renderTurnstile,
    getTurnstileToken,
    resetTurnstile,
    removeTurnstile,
    verifyTurnstileToken
};
