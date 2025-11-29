import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useChatSnapshot from "../hooks/onSnapShot";
import { db } from "../api/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import MessageBubble from "../components/Chat/MessageBubble";

const Chat = () => {
  const { user } = useAuth();
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);
  const textareaRef = useRef(null);

  // Use custom hook for real-time updates
  useChatSnapshot(matchId, user, setOtherUser, setMessages, setLoading);

  // Auto-scroll to bottom
  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      if (isFirstLoad.current) {
        scrollToBottom(true);
        isFirstLoad.current = false;
      } else {
        scrollToBottom(false);
      }
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error("❌ Cannot send message: User not authenticated");
      alert("Debes iniciar sesión para enviar mensajes");
      return;
    }

    if (message.trim() && matchId) {
      try {
        const messageText = message.trim();
        setMessage(""); // Clear input immediately
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'; // Reset height
        }

        // 1. Add message to subcollection
        const messagesRef = collection(db, "matches", matchId, "messages");
        await addDoc(messagesRef, {
          senderId: user.uid,
          text: messageText,
          timestamp: serverTimestamp(),
          read: false
        });

        // 2. Update match document
        const matchRef = doc(db, "matches", matchId);
        const matchDoc = await getDoc(matchRef);

        if (matchDoc.exists()) {
          const matchData = matchDoc.data();
          const recipientId = matchData.users?.find(id => id !== user.uid);

          const updateData = {
            lastMessage: messageText,
            lastMessageTime: serverTimestamp()
          };

          if (recipientId) {
            updateData[`unreadCount.${recipientId}`] = increment(1);
          }

          await updateDoc(matchRef, updateData);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Error al enviar el mensaje");
      }
    }
  };

  const formatMessageTime = (timeString) => {
    if (!timeString) return "";

    // If it's already a formatted time string (HH:MM:SS or HH:MM), return as is
    if (/^\d{1,2}:\d{2}(:\d{2})?/.test(timeString)) {
      // Extract just HH:MM
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }

    // Try to parse as date
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      // Silently handle error
    }

    // If all else fails, return the original string
    return timeString;
  };

  const handleProfileClick = () => {
    if (otherUser?.uid) {
      navigate(`/user/${otherUser.uid}`);
    }
  };

  if (!matchId) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1>No match ID provided</h1>
          <p>Please select a conversation from your matches.</p>
          <button
            onClick={() => navigate("/chat")}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              background: "var(--primary-gradient)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Volver a Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "600px",
      margin: "0 auto",
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-primary)",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        background: "var(--glass-bg)",
        borderBottom: "1px solid var(--glass-border)",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        backdropFilter: "blur(10px)",
        flexShrink: 0
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate("/chat")}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: "12px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            fontSize: "1.5rem",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          ‹
        </button>

        {/* User info */}
        {loading ? (
          <div style={{ flex: 1 }}>
            <div style={{
              width: "120px",
              height: "20px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "4px",
              animation: "pulse 1.5s ease-in-out infinite"
            }}></div>
          </div>
        ) : (
          <>
            {/* Avatar - clickable */}
            <div
              style={{
                position: "relative",
                cursor: "pointer"
              }}
              onClick={handleProfileClick}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--primary-gradient)",
                padding: "2px",
                transition: "transform 0.2s ease"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: otherUser?.images?.[0] ? `url(${otherUser.images[0]})` : "var(--primary-gradient)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}>
                  {!otherUser?.images?.[0] && "👤"}
                </div>
              </div>
            </div>

            {/* Name - clickable */}
            <div
              style={{
                flex: 1,
                cursor: "pointer"
              }}
              onClick={handleProfileClick}
            >
              <h2 style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "white",
                transition: "color 0.2s ease"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--primary-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "white";
                }}
              >
                {otherUser?.name || "Usuario"}
              </h2>
            </div>
          </>
        )}
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem"
          }}>
            <div style={{ fontSize: "3rem" }}>💬</div>
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

      {/* Input area */}
      <div style={{
        background: "var(--glass-bg)",
        borderTop: "1px solid var(--glass-border)",
        padding: "1rem",
        backdropFilter: "blur(10px)",
        flexShrink: 0
      }}>
        <form onSubmit={handleSendMessage} style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-end"
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
                handleSendMessage(e);
              }
            }}
            placeholder="Escribe un mensaje..."
            rows={1}
            style={{
              flex: 1,
              padding: "1rem",
              borderRadius: "1rem",
              border: "1px solid var(--glass-border)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontSize: "0.8rem",
              outline: "none",
              transition: "border-color 0.2s ease, background 0.2s ease",
              resize: "none",
              overflowY: "auto",
              minHeight: "54px",
              maxHeight: "80px",
              fontFamily: "inherit",
              lineHeight: "1.4"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary-color)";
              e.target.style.background = "rgba(255, 255, 255, 0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--glass-border)";
              e.target.style.background = "rgba(255, 255, 255, 0.05)";
            }}
          />
          <button
            type="submit"
            disabled={!user || !message.trim()}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "none",
              background: user && message.trim()
                ? "var(--primary-gradient)"
                : "rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "1.5rem",
              cursor: user && message.trim() ? "pointer" : "not-allowed",
              opacity: user && message.trim() ? 1 : 0.5,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: user && message.trim()
                ? "0 4px 12px rgba(254, 60, 114, 0.3)"
                : "none",
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (user && message.trim()) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(254, 60, 114, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = user && message.trim()
                ? "0 4px 12px rgba(254, 60, 114, 0.3)"
                : "none";
            }}
          >
            ➤
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        /* Custom Scrollbar Styles */
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FE3C72, #FF7854);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #FF5D8F, #FF9574);
          box-shadow: 0 0 8px rgba(254, 60, 114, 0.5);
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #FE3C72 rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default Chat;