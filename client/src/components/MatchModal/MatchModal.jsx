import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MatchModal.css";
import { MessageCircle } from "lucide-react";

const MatchModal = ({ currentUser, matchedUser, matchId, onClose }) => {
    const navigate = useNavigate();

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleSendMessage = () => {
        onClose();
        navigate(`/chat/${matchId}`);
    };

    const handleKeepSwiping = () => {
        onClose();
    };

    return (
        <div className="match-modal-overlay" onClick={handleKeepSwiping}>
            <div className="match-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Confetti particles */}
                <div className="confetti-container">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                                backgroundColor: [
                                    "#FF6B9D",
                                    "#C471ED",
                                    "#12E7C3",
                                    "#FFA500",
                                    "#FF1493",
                                ][Math.floor(Math.random() * 5)],
                            }}
                        />
                    ))}
                </div>

                {/* Main content */}
                <div className="match-modal-inner">
                    {/* Header */}
                    <div className="match-modal-header">
                        <h1 className="match-title">¡Es un Match!</h1>
                        <p className="match-subtitle">
                            A {matchedUser?.name} también le gustas
                        </p>
                    </div>

                    {/* Dual avatars */}
                    <div className="match-avatars-container">
                        <div className="match-avatar match-avatar-left">
                            <div className="avatar-gradient-border">
                                <img
                                    src={currentUser?.images?.[0] || "https://via.placeholder.com/150"}
                                    alt={currentUser?.name || "Tú"}
                                    loading="eager"
                                />
                            </div>
                        </div>

                        <div className="match-heart-icon">
                            <span className="heart-pulse">💗</span>
                        </div>

                        <div className="match-avatar match-avatar-right">
                            <div className="avatar-gradient-border">
                                <img
                                    src={matchedUser?.images?.[0] || "https://via.placeholder.com/150"}
                                    alt={matchedUser?.name || "Usuario"}
                                    loading="eager"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="match-actions">
                        <button
                            className="match-button match-button-primary"
                            onClick={handleSendMessage}
                        >
                            <MessageCircle size={20} />
                            Enviar Mensaje
                        </button>
                        <button
                            className="match-button match-button-secondary"
                            onClick={handleKeepSwiping}
                        >
                            <span className="button-icon">👋</span>
                            Seguir deslizando
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchModal;
