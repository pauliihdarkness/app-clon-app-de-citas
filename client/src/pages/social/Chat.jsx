import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useChatSnapshot from "../../hooks/onSnapShot";
import { db } from "../../api/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
// MessageBubble is rendered inside ChatMessages component
import ChatMessages from '../../components/Chat/ChatMessages'
import ChatInput from '../../components/Chat/ChatInput'
import ReportModal from '../../components/Chat/ReportModal'
import BaseLayout from "../../components/Layout/BaseLayout";
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
  const [_loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);
  const textareaRef = useRef(null);
  const { showToast } = useToast();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

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

  const chatTitleNode = otherUser ? (
    <button
      onClick={handleProfileClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "inherit"
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.3)",
        flexShrink: 0
      }}>
        <img
          src={otherUser.images?.[0]}
          alt={otherUser.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>{otherUser.name}</span>
        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Toca para ver perfil</span>
      </div>
    </button>
  ) : null;

  const _handleHideChat = async () => {
    if (!matchId || !user) return;
    try {
      await hideMatchForUser(matchId, user.uid);
      showToast("Chat ocultado", "success");
      navigate("/chat");
      } catch {
      showToast("Error al ocultar chat", "error");
    }
  };

  const _handleUnmatch = async () => {
    if (!matchId) return;
    if (window.confirm("¿Estás seguro de que quieres deshacer el match? Esta acción es irreversible.")) {
      try {
        await unmatchUser(matchId);
        showToast("Match deshecho", "success");
        navigate("/chat");
      } catch {
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
      } catch {
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
    } catch {
      showToast("Error al reportar usuario", "error");
    }
  };

  if (!matchId) {
    return (
      <BaseLayout maxWidth="mobile" showTabs={false} title="Chat">
        <div style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
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
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      maxWidth="mobile"
      showTabs={false}
      title={otherUser ? otherUser.name : "Chat"}
      titleNode={chatTitleNode}
      backPath="/chat"
      hideFooter={true}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 60px)", // viewport dinámico menos header
        background: "var(--bg-primary)",
        borderRadius: "24px 24px 0 0",
        overflow: "hidden"
      }}>
        <ChatMessages
          messages={messages}
          user={user}
          otherUser={otherUser}
          formatMessageTime={formatMessageTime}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={handleSendMessage}
          textareaRef={textareaRef}
          user={user}
        />
      </div>

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportReason={reportReason}
        setReportReason={setReportReason}
        onSubmit={handleReportUser}
      />
    </BaseLayout>
  );
};

export default Chat;