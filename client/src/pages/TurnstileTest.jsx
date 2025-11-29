import React, { useEffect, useState } from 'react';
import { renderTurnstile, getTurnstileToken, resetTurnstile } from '../utils/turnstile';
import BaseLayout from '../components/Layout/BaseLayout';
import Button from '../components/UI/Button';

const TurnstileTest = () => {
    const [widgetId, setWidgetId] = useState(null);
    const [token, setToken] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        initTurnstile();
    }, []);

    const initTurnstile = async () => {
        try {
            const id = await renderTurnstile('turnstile-container', {
                theme: 'dark',
                size: 'normal',
                callback: (token) => {
                    console.log('✅ Turnstile token received:', token);
                    setToken(token);
                    setError('');
                },
                'error-callback': () => {
                    console.error('❌ Turnstile error');
                    setError('Error al cargar Turnstile. Verifica tu SITE_KEY.');
                },
                'expired-callback': () => {
                    console.warn('⚠️ Turnstile token expired');
                    setToken('');
                }
            });
            setWidgetId(id);
            console.log('🛡️ Turnstile widget initialized with ID:', id);
        } catch (err) {
            console.error('Failed to initialize Turnstile:', err);
            setError(err.message);
        }
    };

    const handleVerify = async () => {
        if (!token) {
            setError('Por favor completa el desafío de Turnstile primero');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/verify-turnstile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const result = await response.json();
            setVerificationResult(result);

            if (result.success) {
                console.log('✅ Verification successful:', result);
            } else {
                console.error('❌ Verification failed:', result);
                setError(result.message || 'Verificación fallida');
            }
        } catch (err) {
            console.error('Error verifying token:', err);
            setError('Error al verificar el token: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (widgetId) {
            resetTurnstile(widgetId);
            setToken('');
            setVerificationResult(null);
            setError('');
        }
    };

    return (
        <BaseLayout maxWidth="desktop">
            <div style={{
                minHeight: '100vh',
                padding: '2rem',
                color: 'white'
            }}>
                <div className="glass" style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    padding: '2rem',
                    borderRadius: '16px'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        marginBottom: '1rem',
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🛡️ Cloudflare Turnstile Test
                    </h1>

                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Esta página verifica que Cloudflare Turnstile esté funcionando correctamente.
                    </p>

                    {/* Status de configuración */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>📋 Estado de Configuración:</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <p>✅ VITE_TURNSTILE_SITE_KEY: {import.meta.env.VITE_TURNSTILE_SITE_KEY ? 'Configurado' : '❌ No configurado'}</p>
                            <p>✅ API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3000'}</p>
                        </div>
                    </div>

                    {/* Widget de Turnstile */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <div id="turnstile-container"></div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div style={{
                            background: 'rgba(255, 75, 75, 0.1)',
                            border: '1px solid rgba(255, 75, 75, 0.3)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            color: '#FF4B4B'
                        }}>
                            ❌ {error}
                        </div>
                    )}

                    {/* Token display */}
                    {token && (
                        <div style={{
                            background: 'rgba(76, 175, 80, 0.1)',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#4CAF50' }}>
                                ✅ Token recibido:
                            </p>
                            <code style={{
                                display: 'block',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                wordBreak: 'break-all',
                                color: 'var(--text-secondary)'
                            }}>
                                {token.substring(0, 50)}...
                            </code>
                        </div>
                    )}

                    {/* Verification result */}
                    {verificationResult && (
                        <div style={{
                            background: verificationResult.success
                                ? 'rgba(76, 175, 80, 0.1)'
                                : 'rgba(255, 75, 75, 0.1)',
                            border: `1px solid ${verificationResult.success
                                ? 'rgba(76, 175, 80, 0.3)'
                                : 'rgba(255, 75, 75, 0.3)'}`,
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>
                                {verificationResult.success ? '✅ Verificación Exitosa' : '❌ Verificación Fallida'}
                            </h4>
                            <pre style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                overflow: 'auto'
                            }}>
                                {JSON.stringify(verificationResult, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button
                            onClick={handleVerify}
                            disabled={!token || isLoading}
                            style={{ flex: 1 }}
                        >
                            {isLoading ? 'Verificando...' : '🔍 Verificar Token'}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="secondary"
                            style={{ flex: 1 }}
                        >
                            🔄 Resetear
                        </Button>
                    </div>

                    {/* Instructions */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(33, 150, 243, 0.1)',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <h4 style={{ marginBottom: '0.5rem', color: '#2196F3' }}>📖 Instrucciones:</h4>
                        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
                            <li>El widget de Turnstile debería aparecer arriba</li>
                            <li>Completa el desafío (si aparece)</li>
                            <li>Cuando obtengas el token, haz clic en "Verificar Token"</li>
                            <li>El servidor verificará el token con Cloudflare</li>
                        </ol>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default TurnstileTest;
