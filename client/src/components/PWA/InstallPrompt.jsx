import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import './InstallPrompt.css';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Save the event so it can be triggered later
            setDeferredPrompt(e);
            // Show our custom install prompt
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to the install prompt: ${outcome}`);

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember user dismissed it (optional: use localStorage to not show again)
        localStorage.setItem('installPromptDismissed', 'true');
    };

    // Don't show if user previously dismissed or if already installed
    useEffect(() => {
        const dismissed = localStorage.getItem('installPromptDismissed');
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (dismissed || isStandalone) {
            const t = setTimeout(() => setShowPrompt(false), 0);
            return () => clearTimeout(t);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="install-prompt">
            <div className="install-prompt-content">
                <div className="install-prompt-icon">
                    <Download size={24} />
                </div>
                <div className="install-prompt-text">
                    <h3>Instalar App</h3>
                    <p>Instala la app para una mejor experiencia</p>
                </div>
                <div className="install-prompt-actions">
                    <button
                        className="install-prompt-btn install-btn"
                        onClick={handleInstall}
                    >
                        Instalar
                    </button>
                    <button
                        className="install-prompt-btn dismiss-btn"
                        onClick={handleDismiss}
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
