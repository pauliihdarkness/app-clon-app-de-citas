import React from "react";
import BaseLayout from "../components/Layout/BaseLayout";
import { useAuth } from "../context/AuthContext";

const Feed = () => {
  const { user } = useAuth();

  return (
    <BaseLayout showTabs={true} maxWidth="full">
      <div style={{ padding: "1rem" }}>
        <h1 style={{
          fontSize: "2rem",
          marginBottom: "1rem",
          background: "var(--primary-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Descubre
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          ¡Hola {user?.email?.split('@')[0]}! Aquí encontrarás personas cerca de ti.
        </p>

        {/* Placeholder para swipe cards */}
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "var(--glass-bg)",
          borderRadius: "16px",
          border: "1px solid var(--glass-border)"
        }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔥</p>
          <p style={{ color: "var(--text-secondary)" }}>
            Swipe cards próximamente...
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Feed;