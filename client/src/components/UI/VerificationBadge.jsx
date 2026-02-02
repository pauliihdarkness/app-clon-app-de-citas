import React from 'react';
import { useVerification } from '../../context/VerificationContext';
import { useNavigate } from 'react-router-dom';
import './VerificationBadge.css';

const VerificationBadge = ({ size = 'medium', status = null, isPublic = false, compact = false }) => {
    // Si se pasa un status como prop (perfil público), usarlo
    // De lo contrario, usar el contexto (perfil propio)
    const context = useVerification();
    const { isVerified, verificationStatus, loading } = isPublic ? 
        { isVerified: status === 'verified', verificationStatus: { status }, loading: false } :
        context;
    const navigate = useNavigate();

    const handleClick = () => {
        if (!isVerified && !isPublic) {
            navigate('/verify-identity');
        }
    };

    // No mostrar nada si es perfil público y no está verificado
    if (isPublic && status !== 'verified') {
        return null;
    }

    // Versión compacta (solo icono)
    if (compact && isVerified) {
        return (
            <div 
                className="verification-badge-compact" 
                title="Identidad verificada"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    flexShrink: 0
                }}
            >
                <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                    style={{ width: '14px', height: '14px' }}
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        );
    }

    return (
        <div className={`verification-badge ${size}`}>
            {loading ? (
                <div className="badge-content loading">
                    <span className="spinner"></span>
                </div>
            ) : isVerified ? (
                <div className="badge-content verified" title="Identidad verificada">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Verificado</span>
                </div>
            ) : verificationStatus?.status === 'pending' ? (
                <div className="badge-content pending" title="Verificación pendiente">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Pendiente</span>
                </div>
            ) : verificationStatus?.status === 'rejected' ? (
                <div className="badge-content rejected" title="Verificación rechazada">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>Rechazado</span>
                </div>
            ) : (
                <button className="badge-content not-verified" onClick={handleClick} title="Haz clic para verificar tu identidad">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-15a2 2 0 100 4 2 2 0 000-4zm0 8a3 3 0 110 6 3 3 0 010-6z" />
                    </svg>
                    <span>Verificar</span>
                </button>
            )}
        </div>
    );
};

export default VerificationBadge;
