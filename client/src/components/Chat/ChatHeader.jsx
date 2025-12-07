import React from 'react'
import { ChevronLeft, MoreVertical } from 'lucide-react'

export default function ChatHeader({
  onBack,
  loading,
  otherUser,
  onProfileClick,
  showMenu,
  setShowMenu,
  menuRef,
  onReportOpen,
  onBlockUser,
  onUnmatch,
}) {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      backdropFilter: 'blur(10px)',
      flexShrink: 0
    }}>
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: '1.5rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
      >
        <ChevronLeft size={28} />
      </button>

      {loading ? (
        <div style={{ flex: 1 }}>
          <div style={{
            width: '120px',
            height: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ) : (
        <>
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={onProfileClick}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              padding: '2px',
              transition: 'transform 0.2s ease'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img style={{
                  animation: 'fadeIn 0.3s ease-in-out',
                  visibility: otherUser?.images?.[0] ? 'visible' : 'hidden',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} src={otherUser?.images?.[0]} alt="Avatar" />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, cursor: 'pointer' }} onClick={onProfileClick}>
            <h2 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'white',
              transition: 'color 0.2s ease'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-color)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'white'; }}
            >
              {otherUser?.name || 'Usuario'}
            </h2>
          </div>
        </>
      )}

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MoreVertical size={24} />
        </button>

        {showMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: '#1a1a1a',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '0.5rem',
            minWidth: '200px',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.25rem 0' }} />

            <button
              onClick={() => { onReportOpen(); setShowMenu(false); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fbbf24',
                padding: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Reportar
            </button>

            <button
              onClick={onBlockUser}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                padding: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Bloquear
            </button>

            <button
              onClick={onUnmatch}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                padding: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Deshacer Match
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

