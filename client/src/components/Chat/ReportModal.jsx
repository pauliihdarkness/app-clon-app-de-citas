import React from 'react'

export default function ReportModal({ show, onClose, reportReason, setReportReason, onSubmit }) {
  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass" style={{
        background: '#1a1a1a',
        padding: '2rem',
        borderRadius: '24px',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid var(--glass-border)',
        animation: 'scaleIn 0.3s ease'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'white' }}>Reportar Usuario</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          ¿Por qué quieres reportar a este usuario? Esto nos ayuda a mantener la comunidad segura.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['Comportamiento inapropiado', 'Perfil falso', 'Spam / Estafa', 'Acoso', 'Otro'].map((reason) => (
            <button
              key={reason}
              onClick={() => setReportReason(reason)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: reportReason === reason ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              {reason}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!reportReason}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '12px',
              border: 'none',
              background: reportReason ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: reportReason ? 'pointer' : 'not-allowed',
              opacity: reportReason ? 1 : 0.5
            }}
          >
            Enviar Reporte
          </button>
        </div>
      </div>
    </div>
  )
}
