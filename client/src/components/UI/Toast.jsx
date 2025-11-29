import React, { useEffect } from 'react';

const Toast = ({ id, message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            case 'message': return '💬';
            default: return 'ℹ';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return {
                bg: 'linear-gradient(135deg, #4ade80, #22c55e)',
                border: '#22c55e'
            };
            case 'error': return {
                bg: 'linear-gradient(135deg, #f87171, #ef4444)',
                border: '#ef4444'
            };
            case 'warning': return {
                bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                border: '#f59e0b'
            };
            case 'info': return {
                bg: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                border: '#3b82f6'
            };
            case 'message': return {
                bg: 'rgba(255, 255, 255, 0.15)',
                border: 'rgba(255, 255, 255, 0.3)'
            };
            default: return {
                bg: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                border: '#3b82f6'
            };
        }
    };

    const colors = getColors();

    return (
        <div
            className="toast-item"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: colors.bg,
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                color: 'white',
                minWidth: '300px',
                maxWidth: '400px',
                animation: type === 'message' ? 'slideDown 0.5s ease-out' : 'slideIn 0.3s ease-out',
                marginBottom: '0.75rem',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.border}`
            }}
        >
            <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                flexShrink: 0,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%'
            }}>
                {getIcon()}
            </div>
            <p style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: '500',
                flex: 1,
                lineHeight: '1.4'
            }}>
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
