import React from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ message, setMessage, onSend, textareaRef, user }) {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      borderTop: '1px solid var(--glass-border)',
      padding: '1rem',
      backdropFilter: 'blur(10px)',
      flexShrink: 0
    }}>
      <form onSubmit={(e) => { e.preventDefault(); onSend(e); }} style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end'
      }}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend(e);
            }
          }}
          placeholder="Escribe un mensaje..."
          rows={1}
          style={{
            flex: 1,
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            fontSize: '0.8rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, background 0.2s ease',
            resize: 'none',
            overflowY: 'auto',
            minHeight: '54px',
            maxHeight: '80px',
            fontFamily: 'inherit',
            lineHeight: '1.4'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-color)';
            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--glass-border)';
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        />
        <button
          type="submit"
          disabled={!user || !message.trim()}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: user && message.trim()
              ? 'var(--primary-gradient)'
              : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '1.5rem',
            cursor: user && message.trim() ? 'pointer' : 'not-allowed',
            opacity: user && message.trim() ? 1 : 0.5,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: user && message.trim()
              ? '0 4px 12px rgba(254, 60, 114, 0.3)'
              : 'none',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (user && message.trim()) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(254, 60, 114, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = user && message.trim()
              ? '0 4px 12px rgba(254, 60, 114, 0.3)'
              : 'none';
          }}
        >
          <Send size={24} />
        </button>
      </form>
    </div>
  )
}
