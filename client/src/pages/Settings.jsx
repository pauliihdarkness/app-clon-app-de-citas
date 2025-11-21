import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BaseLayout from "../components/Layout/BaseLayout";
import "./Settings.css";

const Settings = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <BaseLayout showTabs={false} maxWidth="mobile" title="Configuración" backPath="/profile">
            <div className="settings-container">

                {/* Section: Account */}
                <div className="settings-section">
                    <h3>Cuenta</h3>
                    <div className="settings-menu">
                        <button className="settings-item" onClick={() => navigate("/account-info")}>
                            <span className="icon">👤</span>
                            <div className="item-info">
                                <span className="label">Información de la cuenta</span>
                                <span className="sublabel">{user?.email}</span>
                            </div>
                            <span className="arrow">›</span>
                        </button>
                        <button className="settings-item" onClick={() => alert("Próximamente: Privacidad")}>
                            <span className="icon">🔒</span>
                            <span className="label">Privacidad y Seguridad</span>
                            <span className="arrow">›</span>
                        </button>
                    </div>
                </div>

                {/* Section: Preferences */}
                <div className="settings-section">
                    <h3>Preferencias</h3>
                    <div className="settings-menu">
                        <button className="settings-item" onClick={() => alert("Próximamente: Notificaciones")}>
                            <span className="icon">🔔</span>
                            <span className="label">Notificaciones</span>
                            <span className="arrow">›</span>
                        </button>
                        <button className="settings-item" onClick={() => alert("Próximamente: Tema")}>
                            <span className="icon">🌙</span>
                            <span className="label">Apariencia</span>
                            <span className="arrow">›</span>
                        </button>
                    </div>
                </div>

                {/* Section: App Info */}
                <div className="settings-section">
                    <h3>Acerca de</h3>
                    <div className="settings-menu">
                        <button className="settings-item" onClick={() => alert("Versión 1.0.0")}>
                            <span className="icon">ℹ️</span>
                            <span className="label">Versión de la App</span>
                            <span className="value">1.0.0</span>
                        </button>
                        <button className="settings-item" onClick={() => window.open("#", "_blank")}>
                            <span className="icon">📄</span>
                            <span className="label">Términos y Condiciones</span>
                            <span className="arrow">›</span>
                        </button>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="settings-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>

                {/* Back Button (Secondary) */}
                <div className="settings-actions" style={{ marginTop: '0.5rem' }}>
                    <button
                        className="logout-btn"
                        onClick={() => navigate("/profile")}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-color)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        ⬅️ Volver al Perfil
                    </button>
                </div>

                <div className="settings-footer">
                    <p>App de Citas v1.0.0</p>
                </div>

            </div>
        </BaseLayout>
    );
};

export default Settings;
