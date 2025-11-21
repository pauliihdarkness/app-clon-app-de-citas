import React from "react";
import TabNavigation from "../Navigation/TabNavigation";
import "../../assets/styles/global.css";

const BaseLayout = ({ children, maxWidth = "full", showTabs = false }) => {
  return (
    <div className="base-layout">
      <header className="header" style={{ padding: "1rem", background: "var(--primary-color)", color: "var(--text-color)", textAlign: "center" }}>
        <h2>💖 App de Citas</h2>
      </header>
      <main style={{ minHeight: "70vh", padding: "1rem 0", paddingBottom: showTabs ? "90px" : "1rem" }}>
        <div className={`container container--${maxWidth}`}>
          {children}
        </div>
      </main>
      <footer className="footer" style={{ padding: "1rem", background: "var(--secondary-color)", color: "var(--text-color)", textAlign: "center", display: showTabs ? "none" : "block" }}>
        <small>© 2025 App de Citas. Solo para móviles 📱</small>
      </footer>
      {showTabs && <TabNavigation />}
    </div>
  );
};

export default BaseLayout;
