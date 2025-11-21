import React from "react";
import BaseLayout from "../components/Layout/BaseLayout";

const Chat = () => {
  return (
    <BaseLayout showTabs={true} maxWidth="tablet">
      <div style={{ padding: "1rem" }}>
        <h1 style={{
          fontSize: "2rem",
          marginBottom: "1rem",
          background: "var(--primary-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Mensajes
        </h1>

        {/* Placeholder para lista de chats */}
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "var(--glass-bg)",
          borderRadius: "16px",
          border: "1px solid var(--glass-border)"
        }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</p>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
            No tienes conversaciones aún
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Cuando hagas match con alguien, podrás chatear aquí
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Chat;