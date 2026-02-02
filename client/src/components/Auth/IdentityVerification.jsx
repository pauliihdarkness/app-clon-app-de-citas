import React, { useState } from 'react';
import GestureDetection from './GestureDetection';
import './IdentityVerification.css';

const IdentityVerification = ({ onVerificationComplete, userId }) => {
    const [step, setStep] = useState('instructions'); // instructions, capture, processing, success, error
    const [error, setError] = useState(null);
    const [selectedGesture, setSelectedGesture] = useState(null);

    const gestures = [
        { id: 'smile', label: 'Sonreír', emoji: '😊', description: 'Sonríe de forma natural a la cámara' },
        { id: 'blink', label: 'Parpadear', emoji: '👁️', description: 'Parpadea dos o tres veces de forma clara' },
        { id: 'nod', label: 'Asentir', emoji: '👤', description: 'Mueve tu cabeza hacia arriba y hacia abajo' },
        { id: 'headShake', label: 'Negar', emoji: '🙅', description: 'Mueve tu cabeza de lado a lado' },
    ];

    const handleGestureSelect = (gestureId) => {
        setSelectedGesture(gestureId);
        setError(null);
        setStep('capture');
    };

    const handleVerificationSuccess = (data) => {
        setStep('success');
        setTimeout(() => {
            if (onVerificationComplete) {
                onVerificationComplete(data);
            }
        }, 2000);
    };

    const handleVerificationError = (errorMessage) => {
        setError(errorMessage);
        setStep('error');
    };

    const handleReset = () => {
        setStep('instructions');
        setSelectedGesture(null);
        setError(null);
    };

    return (
        <div className="identity-verification-container">
            {step === 'instructions' && (
                <div className="verification-step instructions-step">
                    <div className="verification-header">
                        <h1>Verificación de Identidad</h1>
                        <p>Completa un gesto para verificar que eres una persona real</p>
                    </div>

                    <div className="gestures-grid">
                        {gestures.map((gesture) => (
                            <div
                                key={gesture.id}
                                className="gesture-card"
                                onClick={() => handleGestureSelect(gesture.id)}
                            >
                                <div className="gesture-emoji">{gesture.emoji}</div>
                                <h3>{gesture.label}</h3>
                                <p>{gesture.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="verification-info">
                        <h3>¿Por qué necesitamos esto?</h3>
                        <ul>
                            <li>Garantizar que eres una persona real</li>
                            <li>Prevenir cuentas falsas o automatizadas</li>
                            <li>Mejorar la seguridad de la comunidad</li>
                        </ul>
                    </div>
                </div>
            )}

            {step === 'capture' && selectedGesture && (
                <GestureDetection
                    gestureType={selectedGesture}
                    userId={userId}
                    onSuccess={handleVerificationSuccess}
                    onError={handleVerificationError}
                    onCancel={handleReset}
                />
            )}

            {step === 'success' && (
                <div className="verification-step success-step">
                    <div className="success-icon">✓</div>
                    <h2>¡Verificación completada!</h2>
                    <p>Tu identidad ha sido verificada exitosamente</p>
                </div>
            )}

            {step === 'error' && (
                <div className="verification-step error-step">
                    <div className="error-icon">✕</div>
                    <h2>Error en la verificación</h2>
                    <p>{error || 'No se pudo completar la verificación. Intenta de nuevo.'}</p>
                    <button className="retry-button" onClick={handleReset}>
                        Intentar de nuevo
                    </button>
                </div>
            )}
        </div>
    );
};

export default IdentityVerification;
