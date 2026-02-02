import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getVerificationStatus } from '../api/verification';

const VerificationContext = createContext();

export const VerificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar estado de verificación cuando el usuario cambia
    useEffect(() => {
        if (user?.uid) {
            fetchVerificationStatus();
        }
    }, [user?.uid]);

    const fetchVerificationStatus = async () => {
        try {
            setLoading(true);
            const response = await getVerificationStatus(user.uid);
            
            if (response.success) {
                setVerificationStatus(response.data);
                setIsVerified(response.data?.status === 'approved');
                setError(null);
            } else {
                setError(response.error);
            }
        } catch (err) {
            console.error('Error fetching verification status:', err);
            setError('Error al cargar estado de verificación');
        } finally {
            setLoading(false);
        }
    };

    const refreshVerificationStatus = async () => {
        await fetchVerificationStatus();
    };

    return (
        <VerificationContext.Provider
            value={{
                verificationStatus,
                isVerified,
                loading,
                error,
                refreshVerificationStatus
            }}
        >
            {children}
        </VerificationContext.Provider>
    );
};

export const useVerification = () => {
    const context = useContext(VerificationContext);
    if (!context) {
        throw new Error('useVerification debe ser usado dentro de VerificationProvider');
    }
    return context;
};
