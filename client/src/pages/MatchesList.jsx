import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfiles } from "../context/UserProfilesContext";
import { useToast } from "../hooks/useToast";
import TabNavigation from "../components/Navigation/TabNavigation";
import { db } from "../api/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const MatchesList = () => {
    const { user } = useAuth();
    const { getProfile } = useUserProfiles();
    const { showToast } = useToast();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const prevUnreadCounts = React.useRef({});
    const isFirstLoad = React.useRef(true);

    // Real-time matches updates using Firestore onSnapshot
    useEffect(() => {
        if (!user) return;

        // Listen to all matches where the user is a participant
        const matchesRef = collection(db, "matches");
        const q = query(matchesRef, where("users", "array-contains", user.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const updatedMatches = [];

            for (const doc of snapshot.docs) {
                const matchData = doc.data();
                const matchId = doc.id;

                // Find the other user ID
                const otherUserId = matchData.users?.find(id => id !== user.uid);
                const currentUnreadCount = matchData.unreadCount?.[user.uid] || 0;

                // Check for new messages to show toast
                if (!isFirstLoad.current && otherUserId) {
                    const prevCount = prevUnreadCounts.current[matchId] || 0;
                    if (currentUnreadCount > prevCount) {
                        // We need the user name for the toast, which we might not have yet if it's a new match
                        // But usually we fetch it below. For immediate toast, we might need to rely on what we have or fetch it.
                        // Since we fetch profiles inside this loop, let's use the fetched profile if available, 
                        // or try to get it from existing matches state if it was already there.
                    }
                }

                if (otherUserId) {
                    // Use cached profile (significant performance improvement)
                    const otherUserProfile = await getProfile(otherUserId);

                    // Toast logic here where we have the name
                    if (!isFirstLoad.current && otherUserProfile) {
                        const prevCount = prevUnreadCounts.current[matchId] || 0;
                        if (currentUnreadCount > prevCount) {
                            showToast(`Tienes un mensaje nuevo de ${otherUserProfile.name}`, 'message');
                        }
                    }

                    updatedMatches.push({
                        id: matchId,
                        ...matchData,
                        otherUserId,
                        otherUser: otherUserProfile,
                        unreadCount: currentUnreadCount
                    });
                }

                // Update ref for next time
                prevUnreadCounts.current[matchId] = currentUnreadCount;
            }

            setMatches(updatedMatches);
            setLoading(false);
            isFirstLoad.current = false;
        });

        // Cleanup on unmount
        return () => unsubscribe();
    }, [user]);

    // Helper to safely convert Firestore Timestamp or string to Date object
    const getDateObject = (timestamp) => {
        if (!timestamp) return null;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        return new Date(timestamp);
    };

    // Separar matches nuevos (sin mensajes) de conversaciones activas
    const newMatches = matches
        .filter(match => !match.lastMessageTime)
        .sort((a, b) => {
            // Ordenar por fecha de match (más reciente primero)
            const dateA = getDateObject(a.matchedAt);
            const dateB = getDateObject(b.matchedAt);
            const timeA = dateA ? dateA.getTime() : 0;
            const timeB = dateB ? dateB.getTime() : 0;
            return timeB - timeA;
        });

    const activeChats = matches
        .filter(match => match.lastMessageTime)
        .sort((a, b) => {
            // Ordenar por último mensaje (más reciente primero)
            const dateA = getDateObject(a.lastMessageTime);
            const dateB = getDateObject(b.lastMessageTime);
            const timeA = dateA ? dateA.getTime() : 0;
            const timeB = dateB ? dateB.getTime() : 0;
            return timeB - timeA;
        });

    const formatTime = (timestamp) => {
        const date = getDateObject(timestamp);
        if (!date) return "";

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
                maxWidth: "600px",
                height: "100dvh",
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
            margin: "0 auto",
            maxWidth: "600px",
            height: "100dvh",
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
                    WebkitTextFillColor: "transparent",
                    fontWeight: "700"
                }}>
                    Mensajes
                </h1>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden"
            }}>
                {/* New Matches - Instagram Stories Style */}
                {newMatches.length > 0 && (
                    <div style={{
                        padding: "1rem 0",
                        borderBottom: "1px solid var(--glass-border)",
                        background: "var(--glass-bg)"
                    }}>
                        <div style={{
                            display: "flex",
                            gap: "1rem",
                            overflowX: "auto",
                            padding: "0 1rem",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none"
                        }} className="hide-scrollbar">
                            {newMatches.map((match) => (
                                <div
                                    key={match.id}
                                    onClick={() => navigate(`/chat/${match.id}`)}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        cursor: "pointer",
                                        minWidth: "70px",
                                        transition: "transform 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                >
                                    <div style={{
                                        width: "70px",
                                        height: "70px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(45deg, var(--primary-color), var(--secondary-color))",
                                        padding: "3px",
                                        position: "relative"
                                    }}>
                                        <div style={{
                                            width: "100%",
                                            height: "100%",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            border: "3px solid var(--bg-primary)"
                                        }}>
                                            <img
                                                src={match.otherUser?.images?.[0] || "https://via.placeholder.com/70"}
                                                alt={match.otherUser?.name || "Usuario"}
                                                loading="lazy"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </div>
                                        {/* Unread Badge - Red Dot */}
                                        {match.unreadCount > 0 && (
                                            <div style={{
                                                position: "absolute",
                                                top: "-2px",
                                                right: "-2px",
                                                background: "#ef4444",
                                                borderRadius: "50%",
                                                width: "16px",
                                                height: "16px",
                                                border: "2px solid var(--bg-primary)",
                                                boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)"
                                            }}></div>
                                        )}
                                        {/* New Match Badge */}
                                        <div style={{
                                            position: "absolute",
                                            bottom: "0",
                                            right: "0",
                                            background: "linear-gradient(135deg, #FF6B9D, #C471ED)",
                                            borderRadius: "50%",
                                            width: "24px",
                                            height: "24px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "2px solid var(--bg-primary)",
                                            fontSize: "0.7rem"
                                        }}>
                                            ✨
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: "0.75rem",
                                        color: "white",
                                        fontWeight: "500",
                                        maxWidth: "70px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        textAlign: "center"
                                    }}>
                                        {match.otherUser?.name || "Usuario"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Conversations */}
                {activeChats.length > 0 ? (
                    <div>
                        {activeChats.map((match) => (
                            <div
                                key={match.id}
                                onClick={() => navigate(`/chat/${match.id}`)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem",
                                    cursor: "pointer",
                                    borderBottom: "1px solid var(--glass-border)",
                                    transition: "background 0.2s",
                                    background: match.unreadCount > 0 ? "rgba(254, 60, 114, 0.05)" : "transparent"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--glass-bg)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = match.unreadCount > 0 ? "rgba(254, 60, 114, 0.05)" : "transparent"}
                            >
                                {/* Avatar */}
                                <div style={{
                                    position: "relative",
                                    flexShrink: 0
                                }}>
                                    <div style={{
                                        width: "60px",
                                        height: "60px",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        border: "2px solid var(--glass-border)"
                                    }}>
                                        <img
                                            src={match.otherUser?.images?.[0] || "https://via.placeholder.com/60"}
                                            alt={match.otherUser?.name || "Usuario"}
                                            loading="lazy"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{
                                    flex: 1,
                                    minWidth: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.25rem"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "0.5rem"
                                    }}>
                                        <span style={{
                                            fontSize: "1rem",
                                            fontWeight: match.unreadCount > 0 ? "700" : "600",
                                            color: "white",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {match.otherUser?.name || "Usuario"}
                                        </span>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            flexShrink: 0
                                        }}>
                                            <span style={{
                                                fontSize: "0.75rem",
                                                color: "var(--text-secondary)"
                                            }}>
                                                {formatTime(match.lastMessageTime)}
                                            </span>
                                            {match.unreadCount > 0 && (
                                                <div style={{
                                                    background: "#ef4444",
                                                    borderRadius: "50%",
                                                    width: "10px",
                                                    height: "10px",
                                                    flexShrink: 0
                                                }}></div>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        color: match.unreadCount > 0 ? "white" : "var(--text-secondary)",
                                        fontWeight: match.unreadCount > 0 ? "500" : "400",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {match.lastMessage || "Inicia una conversación"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : newMatches.length === 0 ? (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "3rem 2rem",
                        textAlign: "center",
                        gap: "1rem"
                    }}>
                        <div style={{
                            fontSize: "4rem",
                            opacity: 0.5
                        }}>💬</div>
                        <h3 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "white",
                            margin: 0
                        }}>
                            No tienes conversaciones
                        </h3>
                        <p style={{
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)",
                            margin: 0,
                            maxWidth: "300px"
                        }}>
                            Cuando hagas match con alguien, podrás empezar a chatear aquí
                        </p>
                    </div>
                ) : null}
            </div>

            <TabNavigation />

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default MatchesList;
