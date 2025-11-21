import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TabNavigation from "../Navigation/TabNavigation";
import "./BaseLayout.css";
import "../../assets/styles/global.css";

const BaseLayout = ({ children, maxWidth = "full", showTabs = false, title = "Citas & Conexiones", backPath, headerActions }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    alert("🔔 ¡Sin notificaciones nuevas!");
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
          ) : (
            <>
              <button onClick={handleFilters} className="header-btn" aria-label="Filtros">
                ⚡
              </button>
              <button onClick={handleNotifications} className="header-btn" aria-label="Notificaciones">
                🔔
                <span className="badge"></span>
              </button>
            </>
          )}
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
        <small>© 2025 App de Citas • Privacidad • Términos</small>
      </footer>

      {/* Bottom Navigation */}
      {showTabs && <TabNavigation />}
    </div>
  );
};

export default BaseLayout;
