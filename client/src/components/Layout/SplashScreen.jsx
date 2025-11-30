import React from 'react';

const SplashScreen = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100dvh',
            backgroundColor: '#0F0F15', // Dark background
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            background: "radial-gradient(circle at center, #2a1a2e 0%, #0F0F15 70%)",
        }}>
            <div className="splash-logo" style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                background: "linear-gradient(45deg, #FE3C72, #FF7854)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: '20px',
                animation: 'pulse 2s infinite ease-in-out'
            }}>
                App de Citas
            </div>

            <div className="spinner" style={{
                width: "40px",
                height: "40px",
                border: "4px solid rgba(255,255,255,0.1)",
                borderLeftColor: "#FE3C72",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
            }}></div>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default SplashScreen;
