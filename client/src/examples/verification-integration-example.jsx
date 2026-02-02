import React from 'react';
import VerificationBadge from '../../components/UI/VerificationBadge';

/**
 * Ejemplo de cómo integrar el badge de verificación en el perfil
 * 
 * Simplemente importa VerificationBadge y úsalo en tu componente
 */

export const ProfileHeaderExample = () => {
    return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
                <h2>Mi Perfil</h2>
                <p>usuario@example.com</p>
            </div>
            <VerificationBadge size="medium" />
        </div>
    );
};

export const PublicProfileExample = () => {
    return (
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <h3>Juan Pérez</h3>
                    <p>25 años • Madrid</p>
                </div>
                <VerificationBadge size="small" />
            </div>
        </div>
    );
};

export const MatchCardExample = () => {
    return (
        <div style={{ 
            background: 'white', 
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <h4 style={{ margin: 0 }}>María García</h4>
                <VerificationBadge size="small" />
            </div>
            <p>Software Developer • Barcelona</p>
        </div>
    );
};

/**
 * Integración en componentes existentes:
 * 
 * 1. En Profile.jsx:
 *    <div className="profile-header">
 *        <h1>{userProfile.name}</h1>
 *        <VerificationBadge size="medium" />
 *    </div>
 * 
 * 2. En PublicProfile.jsx:
 *    <div className="profile-card">
 *        <h2>{profile.name}</h2>
 *        <VerificationBadge size="small" />
 *    </div>
 * 
 * 3. En MatchModal o tarjetas de match:
 *    {user.identityVerified && <VerificationBadge size="small" />}
 */
