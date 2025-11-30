import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TabNavigation from "../Navigation/TabNavigation";
import { useNotifications } from "../../context/NotificationContext";
import "./BaseLayout.css";
import "../../assets/styles/global.css";

const BaseLayout = ({ children, maxWidth = "full", showTabs = false, title = "App de Citas", backPath, headerActions }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Safe fallback for notifications
  let unreadCount = 0;
  try {
    const notifications = useNotifications();
    unreadCount = notifications?.unreadCount || 0;
  } catch (error) {
    // NotificationProvider not available, use default value
    console.warn('NotificationContext not available in BaseLayout');
  }

  // Determinar si mostrar botón de atrás
  const showBackButton = !showTabs && location.pathname !== "/";

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const handleFilters = () => {
    alert("⚡ Filtros próximamente...");
  };

  return (
    <div className="base-layout">
      {/* Header Inteligente */}
      <header className="app-header">
        <div className="header-left">
          {showBackButton && (
            <button onClick={handleBack} className="header-btn" aria-label="Volver">
              ←
            </button>
          )}
        </div>

        <div className="header-center">
          <h2 className="app-logo" onClick={() => navigate("/feed")}>
            {title}
          </h2>
        </div>

        <div className="header-right">
          {headerActions ? (
            headerActions
          ) : location.pathname === '/feed' ? (
            <>
              <button onClick={handleFilters} className="header-btn" aria-label="Filtros">
                ⚡
              </button>
              <button onClick={handleNotifications} className="header-btn" aria-label="Notificaciones">
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
            </>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className={`app-main ${showTabs ? "has-tabs" : ""}`}>
        <div className={`container container--${maxWidth}`}>
          {children}
        </div>
      </main>

      {/* Footer (Solo si no hay tabs) */}
      <footer className={`app-footer ${showTabs ? "hidden" : ""}`}>
        <small>© 2025 App de Citas</small>
      </footer>

      {/* Bottom Navigation */}
      {showTabs && <TabNavigation />}
    </div>
  );
};

export default BaseLayout;
