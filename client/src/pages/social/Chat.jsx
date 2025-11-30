import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useChatSnapshot from "../../hooks/onSnapShot";
import { db } from "../../api/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import MessageBubble from "../../components/Chat/MessageBubble";
import { ChevronLeft, Send, MessageCircle, MoreVertical, EyeOff, UserX, Flag, Trash2 } from "lucide-react";
import { hideMatchForUser, unmatchUser } from "../../api/matches";
import { blockUser } from "../../api/user";
import { reportUser } from "../../api/reports";
import { useToast } from "../../hooks/useToast";

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
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleHideChat = async () => {
    if (!matchId || !user) return;
    try {
      await hideMatchForUser(matchId, user.uid);
      showToast("Chat ocultado", "success");
      navigate("/chat");
    } catch (error) {
      showToast("Error al ocultar chat", "error");
    }
  };

  const handleUnmatch = async () => {
    if (!matchId) return;
    if (window.confirm("¿Estás seguro de que quieres deshacer el match? Esta acción es irreversible.")) {
      try {
        await unmatchUser(matchId);
        showToast("Match deshecho", "success");
        navigate("/chat");
      } catch (error) {
        showToast("Error al deshacer match", "error");
      }
    }
  };

  const handleBlockUser = async () => {
    if (!otherUser?.uid || !user) return;
    if (window.confirm(`¿Bloquear a ${otherUser.name}? No podrán verse ni escribirse más.`)) {
      try {
        await blockUser(user.uid, otherUser.uid);
        showToast("Usuario bloqueado", "success");
        navigate("/chat");
      } catch (error) {
        showToast("Error al bloquear usuario", "error");
      }
    }
  };

  const handleReportUser = async () => {
    if (!otherUser?.uid || !user || !reportReason) return;
    try {
      await reportUser(user.uid, otherUser.uid, reportReason);
      showToast("Usuario reportado", "success");
      setShowReportModal(false);
      setReportReason("");
      // Suggest blocking after reporting
      if (window.confirm("Gracias por tu reporte. ¿Deseas bloquear a este usuario también?")) {
        await handleBlockUser();
      }
    } catch (error) {
      showToast("Error al reportar usuario", "error");
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
            borderRadius: "50%",
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
          <ChevronLeft size={28} />
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
                  background: "var(--primary-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <img style={{
                    animation: "fadeIn 0.3s ease-in-out",
                    visibility: otherUser?.images?.[0] ? "visible" : "hidden",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }} src={otherUser?.images?.[0]} alt="Avatar" />
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
        {/* More Options Button */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <MoreVertical size={24} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "0.5rem",
              background: "#1a1a1a",
              border: "1px solid var(--glass-border)",
              borderRadius: "12px",
              padding: "0.5rem",
              minWidth: "200px",
              zIndex: 100,
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              zIndex: 99999
            }}>
              <button
                onClick={handleProfileClick}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  padding: "0.75rem",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ width: "20px", display: "flex", justifyContent: "center" }}>👤</div>
                Ver Perfil
              </button>

              <button
                onClick={handleHideChat}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  padding: "0.75rem",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <EyeOff size={18} />
                Ocultar Chat
              </button>

              <div style={{ height: "1px", background: "var(--glass-border)", margin: "0.25rem 0" }}></div>

              <button
                onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fbbf24",
                  padding: "0.75rem",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(251, 191, 36, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Flag size={18} />
                Reportar
              </button>

              <button
                onClick={handleBlockUser}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  padding: "0.75rem",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <UserX size={18} />
                Bloquear
              </button>

              <button
                onClick={handleUnmatch}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  padding: "0.75rem",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Trash2 size={18} />
                Deshacer Match
              </button>
            </div>
          )}
        </div>
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
            <Send size={24} />
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

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass" style={{
            background: "#1a1a1a",
            padding: "2rem",
            borderRadius: "24px",
            maxWidth: "400px",
            width: "100%",
            border: "1px solid var(--glass-border)",
            animation: "scaleIn 0.3s ease"
          }}>
            <h3 style={{ marginBottom: "1rem", color: "white" }}>Reportar Usuario</h3>
            <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              ¿Por qué quieres reportar a este usuario? Esto nos ayuda a mantener la comunidad segura.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {["Comportamiento inapropiado", "Perfil falso", "Spam / Estafa", "Acoso", "Otro"].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-border)",
                    background: reportReason === reason ? "var(--primary-color)" : "rgba(255,255,255,0.05)",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s"
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReportUser}
                disabled={!reportReason}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "12px",
                  border: "none",
                  background: reportReason ? "var(--primary-gradient)" : "rgba(255,255,255,0.1)",
                  color: "white",
                  cursor: reportReason ? "pointer" : "not-allowed",
                  opacity: reportReason ? 1 : 0.5
                }}
              >
                Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;