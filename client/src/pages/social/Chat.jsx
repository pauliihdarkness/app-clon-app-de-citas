import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useChatSnapshot from "../../hooks/onSnapShot";
import { db } from "../../api/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
// MessageBubble is rendered inside ChatMessages component
import ChatHeader from '../../components/Chat/ChatHeader'
import ChatMessages from '../../components/Chat/ChatMessages'
import ChatInput from '../../components/Chat/ChatInput'
import ReportModal from '../../components/Chat/ReportModal'
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
      <ChatHeader
        onBack={() => navigate('/chat')}
        loading={loading}
        otherUser={otherUser}
        onProfileClick={handleProfileClick}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        menuRef={menuRef}
        onReportOpen={() => setShowReportModal(true)}
        onBlockUser={handleBlockUser}
        onUnmatch={handleUnmatch}
      />


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

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportReason={reportReason}
        setReportReason={setReportReason}
        onSubmit={handleReportUser}
      />
    </div>
  );
};

export default Chat;