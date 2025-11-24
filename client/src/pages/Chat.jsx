import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socketService from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../api/user";

const Chat = () => {
  const { user } = useAuth();
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!matchId) return;

    const fetchChatData = async () => {
      try {
        // Fetch match data to get other user info
        const matchResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/matches?userId=${user.uid}`);
        if (matchResponse.ok) {
          const matches = await matchResponse.json();
          const currentMatch = matches.find(m => m.id === matchId);

          if (currentMatch?.otherUserId) {
            const otherUserProfile = await getUserProfile(currentMatch.otherUserId);
            setOtherUser(otherUserProfile);
          }
        }

        // Fetch historical messages
        const messagesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/matches/${matchId}/messages`);
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Connect to socket
    socketService.connect();
    setIsConnected(true);

    // Join room
    socketService.joinRoom(matchId);

    // Listen for messages
    socketService.onMessage((data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketService.disconnect();
      socketService.offMessage();
      setIsConnected(false);
    };
  }, [matchId, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!user) {
      console.error("❌ Cannot send message: User not authenticated");
      alert("Debes iniciar sesión para enviar mensajes");
      return;
    }

    if (message.trim() && matchId) {
      const messageData = {
        roomId: matchId,
        author: user.uid,
        message: message,
        time: new Date().toLocaleTimeString(),
      };

      socketService.sendMessage(messageData);
      setMessage("");
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
      navigate(`/profile/${otherUser.uid}`);
    }
  };

  if (!matchId) {
    return (
      <div style={{
        minHeight: "100vh",
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
      height: "100vh",
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
              {/* Online indicator */}
              <div style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: isConnected ? "#10B981" : "#6B7280",
                border: "2px solid var(--bg-primary)",
                boxShadow: isConnected ? "0 0 8px rgba(16, 185, 129, 0.5)" : "none"
              }}></div>
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
              <p style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-secondary)"
              }}>
                {isConnected ? "Conectado" : "Desconectado"}
              </p>
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
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: isOwn ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: "0.5rem",
                  animation: `fadeIn 0.3s ease ${index * 0.05}s both`
                }}
              >
                {/* Avatar placeholder for alignment */}
                {!isOwn && (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    visibility: showAvatar ? "visible" : "hidden"
                  }}>
                    {showAvatar && (
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
                        fontSize: "0.9rem"
                      }}>
                        {!otherUser?.images?.[0] && "👤"}
                      </div>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div style={{
                  maxWidth: "70%",
                  position: "relative"
                }}>
                  <div style={{
                    background: isOwn ? "var(--primary-gradient)" : "rgba(255, 255, 255, 0.1)",
                    padding: "0.75rem 1rem",
                    borderRadius: isOwn
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    boxShadow: isOwn
                      ? "0 2px 8px rgba(254, 60, 114, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                    position: "relative"
                  }}>
                    <p style={{
                      margin: 0,
                      color: "white",
                      wordWrap: "break-word",
                      lineHeight: "1.4"
                    }}>
                      {msg.message}
                    </p>
                    {formattedTime && (
                      <span style={{
                        fontSize: "0.7rem",
                        opacity: 0.7,
                        marginTop: "0.25rem",
                        display: "block",
                        textAlign: isOwn ? "right" : "left",
                        color: "white"
                      }}>
                        {formattedTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
          alignItems: "center"
        }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            style={{
              flex: 1,
              padding: "1rem 1.25rem",
              borderRadius: "24px",
              border: "1px solid var(--glass-border)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.2s ease"
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
                : "none"
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
      `}</style>
    </div>
  );
};

export default Chat;