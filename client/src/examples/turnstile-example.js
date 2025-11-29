/**
 * Example: How to use Cloudflare Turnstile in your forms
 * This file demonstrates the integration of Turnstile widget
 */

import { renderTurnstile, getTurnstileToken, resetTurnstile } from '../utils/turnstile.js';

// Global variable to store widget ID
let turnstileWidgetId = null;

/**
 * Initialize Turnstile widget on page load
 */
export async function initializeTurnstile() {
    const container = document.getElementById('turnstile-container');

    if (!container) {
        console.warn('⚠️ Turnstile container not found');
        return;
    }

    try {
        turnstileWidgetId = await renderTurnstile(container, {
            theme: 'auto', // 'light', 'dark', or 'auto'
            size: 'normal', // 'normal', 'compact', or 'flexible'
            callback: onTurnstileSuccess,
            'error-callback': onTurnstileError,
            'expired-callback': onTurnstileExpired
        });

        console.log('✅ Turnstile initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Turnstile:', error);
    }
}

/**
 * Callback when Turnstile is completed successfully
 */
function onTurnstileSuccess(token) {
    console.log('✅ Turnstile verification completed');
    // You can enable submit button here if needed
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

/**
 * Callback when Turnstile encounters an error
 */
function onTurnstileError() {
    console.error('❌ Turnstile verification failed');
    alert('Error en la verificación. Por favor, intenta de nuevo.');
}

/**
 * Callback when Turnstile token expires
 */
function onTurnstileExpired() {
    console.warn('⚠️ Turnstile token expired');
    // Reset the widget
    if (turnstileWidgetId) {
        resetTurnstile(turnstileWidgetId);
    }
}

/**
 * Example: Handle form submission with Turnstile
 */
export async function handleFormSubmit(event, formData) {
    event.preventDefault();

    // Get Turnstile token
    const turnstileToken = getTurnstileToken(turnstileWidgetId);

    if (!turnstileToken) {
        alert('Por favor completa la verificación de seguridad');
        return;
    }

    try {
        // Add Turnstile token to form data
        const dataToSend = {
            ...formData,
            turnstileToken: turnstileToken
        };

        // Send to your API endpoint
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/your-endpoint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Form submitted successfully');
            // Handle success
            return result;
        } else {
            console.error('❌ Form submission failed:', result);
            // Reset Turnstile on failure
            if (turnstileWidgetId) {
                resetTurnstile(turnstileWidgetId);
            }
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        // Reset Turnstile on error
        if (turnstileWidgetId) {
            resetTurnstile(turnstileWidgetId);
        }
        throw error;
    }
}

/**
 * Example: Login form with Turnstile
 */
export function setupLoginForm() {
    const loginForm = document.getElementById('login-form');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await handleFormSubmit(e, { email, password });
            // Redirect or show success message
            window.location.href = '/dashboard';
        } catch (error) {
            alert('Error al iniciar sesión: ' + error.message);
        }
    });
}

/**
 * Example: Registration form with Turnstile
 */
export function setupRegistrationForm() {
    const regForm = document.getElementById('registration-form');

    if (!regForm) return;

    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            await handleFormSubmit(e, formData);
            alert('¡Registro exitoso!');
            window.location.href = '/login';
        } catch (error) {
            alert('Error en el registro: ' + error.message);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTurnstile();
    setupLoginForm();
    setupRegistrationForm();
});
