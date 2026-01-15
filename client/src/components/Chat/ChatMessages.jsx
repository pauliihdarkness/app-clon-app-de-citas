import React from 'react'
import MessageBubble from './MessageBubble'
import { MessageCircle } from 'lucide-react'

export default function ChatMessages({ messages, user, otherUser, formatMessageTime, messagesEndRef }) {
  return (
    <div
      className="scroll-hidden"
      style={{
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: '1rem'
    }}>
      {messages.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <MessageCircle size={64} strokeWidth={1.5} />
          <p>No hay mensajes aún. ¡Inicia la conversación!</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isOwn = msg.author === user?.uid;
          const showAvatar = index === 0 || messages[index - 1]?.author !== msg.author;
          const formattedTime = formatMessageTime(msg.time);

          return (
            <MessageBubble
              key={index}
              message={msg.message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              formattedTime={formattedTime}
              otherUserImage={otherUser?.images?.[0]}
              index={index}
            />
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
