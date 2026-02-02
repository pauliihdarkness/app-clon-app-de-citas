import React from 'react';
import { useAuth } from '../../context/AuthContext';
import IdentityVerification from '../../components/Auth/IdentityVerification';
import { submitIdentityVerification } from '../../api/verification';
import './IdentityVerificationPage.css';

const IdentityVerificationPage = () => {
    const { user } = useAuth();
    const [verificationStatus, setVerificationStatus] = React.useState('pending');
    const [resultData, setResultData] = React.useState(null);

    const handleVerificationComplete = async (verificationData) => {
        try {
            setVerificationStatus('submitting');
            
            // Log para debugging
            console.log('[FRONTEND] Datos de verificación:', {
                ...verificationData,
                userId: user.uid,
                confidenceType: typeof verificationData.confidence,
                confidenceValue: verificationData.confidence
            });
            
            // Enviar la verificación al servidor
            const response = await submitIdentityVerification({
                userId: user.uid,
                ...verificationData
            });

            console.log('[FRONTEND] Respuesta del servidor:', response);
            if (response.success) {
                setResultData(response.data);
                
                // Determinar estado basado en la respuesta
                if (response.data.status === 'approved') {
                    setVerificationStatus('approved');
                    // Redirigir después de 3 segundos
                    setTimeout(() => {
                        window.location.href = '/profile';
                    }, 3000);
                } else if (response.data.status === 'rejected') {
                    setVerificationStatus('rejected');
                    // Opción para reintentar después de 5 segundos
                    setTimeout(() => {
                        setVerificationStatus('pending');
                    }, 5000);
                } else {
                    setVerificationStatus('pending');
                    // Redirigir después de 3 segundos
                    setTimeout(() => {
                        window.location.href = '/profile';
                    }, 3000);
                }
            } else {
                setVerificationStatus('error');
                alert('Error al enviar la verificación: ' + response.error);
            }
        } catch (error) {
            console.error('Error en verificación:', error);
            setVerificationStatus('error');
            alert('Error al procesar la verificación');
        }
    };

    return (
        <div className="identity-verification-page">
            {verificationStatus === 'pending' && (
                <IdentityVerification
                    userId={user?.uid}
                    onVerificationComplete={handleVerificationComplete}
                />
            )}

            {verificationStatus === 'submitting' && (
                <div className="verification-loading">
                    <div className="spinner"></div>
                    <p>Procesando tu verificación...</p>
                </div>
            )}

            {verificationStatus === 'approved' && (
                <div className="verification-submitted">
                    <div className="success-checkmark">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" fill="#4caf50" />
                            <path d="M 30 50 L 45 65 L 70 35" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2>¡Verificación Completada!</h2>
                    <p>Tu identidad ha sido verificada exitosamente.</p>
                    <p className="verification-note">
                        ✓ Tu perfil ahora aparecerá con un badge de verificado.
                    </p>
                    <p className="redirect-note">
                        Serás redirigido a tu perfil en breve...
                    </p>
                </div>
            )}

            {verificationStatus === 'rejected' && (
                <div className="verification-rejected">
                    <div className="error-icon">⚠️</div>
                    <h2>Verificación Rechazada</h2>
                    <p>No se pudo completar la verificación con la confianza requerida.</p>
                    <p className="verification-note">
                        Confianza detectada: {resultData?.confidence ? (resultData.confidence * 100).toFixed(0) + '%' : 'N/A'}
                    </p>
                    <p className="hint">
                        Intenta de nuevo con un gesto más notable y en un lugar mejor iluminado.
                    </p>
                    <button 
                        className="retry-button"
                        onClick={() => setVerificationStatus('pending')}
                    >
                        Intentar de Nuevo
                    </button>
                </div>
            )}

            {verificationStatus === 'error' && (
                <div className="verification-error">
                    <div className="error-icon">✕</div>
                    <h2>Error en la Verificación</h2>
                    <p>Ocurrió un error al procesar tu solicitud.</p>
                    <button 
                        className="retry-button"
                        onClick={() => setVerificationStatus('pending')}
                    >
                        Intentar de Nuevo
                    </button>
                </div>
            )}
        </div>
    );
};

export default IdentityVerificationPage;
