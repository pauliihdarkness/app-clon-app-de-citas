import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../api/user";
import TabNavigation from "../components/Navigation/TabNavigation";

const MatchesList = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMatches = async () => {
            if (!user) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/matches?userId=${user.uid}`);
                if (response.ok) {
                    const data = await response.json();

                    // Filter out matches without otherUserId
                    const validMatches = data.filter(match => match.otherUserId);

                    // Fetch profile info for each match's other user
                    const matchesWithProfiles = await Promise.all(
                        validMatches.map(async (match) => {
                            try {
                                const otherUserProfile = await getUserProfile(match.otherUserId);
                                return {
                                    ...match,
                                    otherUser: otherUserProfile
                                };
                            } catch (error) {
                                return {
                                    ...match,
                                    otherUser: null
                                };
                            }
                        })
                    );

                    setMatches(matchesWithProfiles);
                }
            } catch (error) {
                // Silently handle error
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [user]);

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Ahora";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "var(--bg-primary)"
            }}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem"
                }}>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        border: "4px solid rgba(255,255,255,0.1)",
                        borderTop: "4px solid transparent",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                        animation: "spin 1s linear infinite",
                        position: "relative"
                    }}>
                        <div style={{
                            position: "absolute",
                            inset: "8px",
                            background: "var(--bg-primary)",
                            borderRadius: "50%"
                        }}></div>
                    </div>
                    <p style={{
                        color: "var(--text-secondary)",
                        fontSize: "1.1rem",
                        fontWeight: "500"
                    }}>Cargando conversaciones...</p>
                </div>
                <TabNavigation />
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
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
                backdropFilter: "blur(10px)",
                flexShrink: 0
            }}>
                <h1 style={{
                    fontSize: "1.5rem",
                    margin: 0,
                    background: "var(--primary-gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    💬 Mensajes
                </h1>
            </div>

            {/* Messages list */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem"
            }}>
                {matches.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "3rem 1rem",
                        background: "var(--glass-bg)",
                        borderRadius: "16px",
                        border: "1px solid var(--glass-border)"
                    }}>
                        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</p>
                        <h2 style={{ marginBottom: "0.5rem" }}>No tienes conversaciones</h2>
                        <p style={{ color: "var(--text-secondary)" }}>
                            Cuando hagas match con alguien, aparecerá aquí
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {matches.map((match, index) => {
                            const otherUser = match.otherUser;
                            const displayName = otherUser?.name || "Usuario";
                            const displayImage = otherUser?.images?.[0] || null;
                            const hasUnread = match.unreadCount > 0; // Asumiendo que el backend provee esto

                            return (
                                <div
                                    key={match.id}
                                    onClick={() => navigate(`/chat/${match.id}`)}
                                    style={{
                                        background: "var(--glass-bg)",
                                        borderRadius: "16px",
                                        border: "1px solid var(--glass-border)",
                                        padding: "1rem",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        animation: `slideIn 0.3s ease ${index * 0.05}s both`,
                                        position: "relative"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.borderColor = "var(--primary-color)";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(254, 60, 114, 0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.borderColor = "var(--glass-border)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    {/* Avatar with gradient border */}
                                    <div style={{ position: "relative" }}>
                                        <div style={{
                                            width: "64px",
                                            height: "64px",
                                            borderRadius: "50%",
                                            background: "var(--primary-gradient)",
                                            padding: "3px",
                                            flexShrink: 0
                                        }}>
                                            <div style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: "50%",
                                                background: displayImage ? `url(${displayImage})` : "var(--primary-gradient)",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.5rem"
                                            }}>
                                                {!displayImage && "👤"}
                                            </div>
                                        </div>
                                        {/* Unread indicator - red dot */}
                                        {hasUnread && (
                                            <div style={{
                                                position: "absolute",
                                                top: "0",
                                                right: "0",
                                                width: "16px",
                                                height: "16px",
                                                borderRadius: "50%",
                                                background: "#EF4444",
                                                border: "3px solid var(--bg-primary)",
                                                boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)"
                                            }}></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem" }}>
                                            <h3 style={{
                                                margin: 0,
                                                fontSize: "1.15rem",
                                                fontWeight: hasUnread ? "700" : "600",
                                                color: "white"
                                            }}>
                                                {displayName}
                                            </h3>
                                            {match.lastMessageTime && (
                                                <span style={{
                                                    fontSize: "0.85rem",
                                                    color: hasUnread ? "var(--primary-color)" : "var(--text-secondary)",
                                                    flexShrink: 0,
                                                    marginLeft: "0.5rem",
                                                    fontWeight: hasUnread ? "600" : "500"
                                                }}>
                                                    {formatTime(match.lastMessageTime)}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            color: hasUnread ? "white" : "var(--text-secondary)",
                                            fontSize: "0.95rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            fontWeight: hasUnread ? "500" : "400"
                                        }}>
                                            {match.lastMessage || "Inicia la conversación 💬"}
                                        </p>
                                    </div>

                                    {/* Chevron icon */}
                                    <div style={{
                                        color: "var(--text-secondary)",
                                        fontSize: "1.2rem",
                                        transition: "transform 0.2s ease"
                                    }}>
                                        ›
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <TabNavigation />

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default MatchesList;
