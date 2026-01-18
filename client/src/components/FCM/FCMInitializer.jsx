import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { setupFCM } from '../../utils/messaging';
import { useToast } from '../../hooks/useToast';

/**
 * Component to initialize FCM when user logs in
 */
const FCMInitializer = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) return;

        // Setup FCM with foreground message handler
        const initializeFCM = async () => {
            try {
                await setupFCM(user.uid, (payload) => {
                    // Handle foreground messages
                    const { title, body } = payload.notification || {};

                    if (title) {
                        showToast(body || title, payload.data?.type || 'info');
                    }
                });
            } catch (error) {
                console.error('Error initializing FCM:', error);
            }
        };

        initializeFCM();
    }, [user, showToast]);

    return null; // This component doesn't render anything
};

export default FCMInitializer;
