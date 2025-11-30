import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, getPrivateUserData } from "../../api/user";
import BaseLayout from "../../components/Layout/BaseLayout";
import "./AccountInfo.css";
import { Info } from "lucide-react";


const AccountInfo = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accountData, setAccountData] = useState({
        email: "",
        birthDate: "",
        age: "",
        name: "",
        createdAt: ""
    });

    useEffect(() => {
        const fetchAccountData = async () => {
            if (user) {
                try {
                    // Get public profile data
                    const profileData = await getUserProfile(user.uid);

                    // Get private data (birthDate)
                    const privateData = await getPrivateUserData(user.uid);

                    setAccountData({
                        email: user.email || "",
                        birthDate: privateData?.birthDate || "",
                        age: profileData?.age || "",
                        name: profileData?.name || "",
                        createdAt: profileData?.createdAt?.toDate?.()?.toLocaleDateString('es-ES') || ""
                    });
                } catch (error) {
                    console.error("Error fetching account data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAccountData();
    }, [user]);

    const formatBirthDate = (dateString) => {
        if (!dateString) return "No disponible";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <BaseLayout showTabs={false} maxWidth="mobile" title="Información de la Cuenta" backPath="/settings">
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh"
                }}>
                    <div className="spinner" style={{
                        width: "40px",
                        height: "40px",
                        border: "4px solid rgba(255,255,255,0.1)",
                        borderLeftColor: "var(--primary-color)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}></div>
                </div>
            </BaseLayout>
        );
    }

    return (
        <BaseLayout showTabs={false} maxWidth="mobile" title="Información de la Cuenta" backPath="/settings">
            <div className="account-info-container">

                {/* Personal Information */}
                <div className="info-section">
                    <h3>📋 Información Personal</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">Nombre</span>
                            <span className="info-value">{accountData.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Fecha de Nacimiento</span>
                            <span className="info-value">{formatBirthDate(accountData.birthDate)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Edad</span>
                            <span className="info-value">{accountData.age} años</span>
                        </div>
                    </div>
                    <div className="info-note">
                        <p><Info size={16} /> La fecha de nacimiento no se puede modificar por razones de seguridad.</p>
                    </div>
                </div>

                {/* Account Information */}
                <div className="info-section">
                    <h3>🔐 Cuenta</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value">{accountData.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">User ID (UID)</span>
                            <span className="info-value" style={{
                                fontSize: "0.85rem",
                                fontFamily: "monospace",
                                wordBreak: "break-all"
                            }}>{user?.uid}</span>
                        </div>
                        {accountData.createdAt && (
                            <div className="info-item">
                                <span className="info-label">Miembro desde</span>
                                <span className="info-value">{accountData.createdAt}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security Note */}
                <div className="info-section security-note">
                    <h3>🛡️ Seguridad y Privacidad</h3>
                    <p>
                        Tu fecha de nacimiento está almacenada de forma segura y privada.
                        Solo se utiliza para calcular tu edad, que es visible en tu perfil público.
                    </p>
                </div>

            </div>
        </BaseLayout>
    );
};

export default AccountInfo;
