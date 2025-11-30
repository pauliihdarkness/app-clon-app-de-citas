import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, blockUser } from "../../api/user";
import { saveLike, savePass } from "../../api/likes";
import { reportUser } from "../../api/reports";
import { useToast } from "../../hooks/useToast";
import { MoreVertical, Flag, UserX, X, Heart, MapPin, MessageSquare, Info, Wine, Briefcase, Target } from "lucide-react";
import "./PublicProfile.css";

const PublicProfile = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { showToast } = useToast();
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const menuRef = React.useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Detectar si viene del feed específicamente
    const fromFeed = location.state?.fromFeed === true;
    const isOwnProfile = user?.uid === userId;
    const showActionButtons = fromFeed && !isOwnProfile;

    // Touch gesture states
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                try {
                    const data = await getUserProfile(userId);
                    setUserData(data);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [userId]);

    // Haptic feedback helper
    const triggerHaptic = (style = "light") => {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20
            };
            navigator.vibrate(patterns[style] || 10);
        }
    };

    const nextPhoto = () => {
        if (userData?.images && userData.images.length > 0 && !isTransitioning) {
            triggerHaptic("light");
            setIsTransitioning(true);
            setCurrentPhotoIndex((prev) =>
                prev === userData.images.length - 1 ? 0 : prev + 1
            );
            setTimeout(() => setIsTransitioning(false), 400);
        }
    };

    const prevPhoto = () => {
        if (userData?.images && userData.images.length > 0 && !isTransitioning) {
            triggerHaptic("light");
            setIsTransitioning(true);
            setCurrentPhotoIndex((prev) =>
                prev === 0 ? userData.images.length - 1 : prev - 1
            );
            setTimeout(() => setIsTransitioning(false), 400);
        }
    };

    // Touch handlers
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextPhoto();
        } else if (isRightSwipe) {
            prevPhoto();
        }
    };

    const handleLike = async () => {
        if (!user || !userId) return;
        triggerHaptic("medium");
        try {
            await saveLike(user.uid, userId);
            navigate(-1); // Go back after action
        } catch (error) {
            console.error("Error saving like:", error);
        }
    };

    const handlePass = async () => {
        if (!user || !userId) return;
        triggerHaptic("medium");
        try {
            await savePass(user.uid, userId);
            navigate(-1); // Go back after action
        } catch (error) {
            console.error("Error saving pass:", error);
        }
    };


    const handleBlockUser = async () => {
        if (!userId || !user) return;
        if (window.confirm(`¿Bloquear a ${userData.name}? No podrán verse ni escribirse más.`)) {
            try {
                await blockUser(user.uid, userId);
                showToast("Usuario bloqueado", "success");
                navigate(-1);
            } catch (error) {
                showToast("Error al bloquear usuario", "error");
            }
        }
    };

    const handleReportUser = async () => {
        if (!userId || !user || !reportReason) return;
        try {
            await reportUser(user.uid, userId, reportReason);
            showToast("Usuario reportado", "success");
            setShowReportModal(false);
            setReportReason("");
            if (window.confirm("Gracias por tu reporte. ¿Deseas bloquear a este usuario también?")) {
                await handleBlockUser();
            }
        } catch (error) {
            showToast("Error al reportar usuario", "error");
        }
    };

    if (loading) {
        return (
            <div className="public-profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="public-profile-container">
                <div className="error-state">
                    <p>Usuario no encontrado</p>
                    <button onClick={() => navigate(-1)}>Volver</button>
                </div>
            </div>
        );
    }

    const photos = userData?.images || [];
    const hasPhotos = photos.length > 0;

    return (
        <div className="public-profile-container">
            {/* Header with back button */}
            <div className="public-profile-header">
                <button onClick={() => navigate(-1)} className="back-btn" aria-label="Volver">
                    ‹
                </button>
                <h1>Perfil</h1>
                <div style={{ width: "40px" }}></div> {/* Spacer for centering */}

                {/* More Options Button */}
                <div style={{ position: "absolute", right: "1rem", top: "1rem" }} ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            background: "rgba(0,0,0,0.3)",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            backdropFilter: "blur(4px)"
                        }}
                    >
                        <MoreVertical size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: "0.5rem",
                            background: "#1a1a1a",
                            border: "1px solid var(--glass-border)",
                            borderRadius: "12px",
                            padding: "0.5rem",
                            minWidth: "180px",
                            zIndex: 100,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem"
                        }}>
                            <button
                                onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#fbbf24",
                                    padding: "0.75rem",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                    transition: "background 0.2s"
                                }}
                            >
                                <Flag size={18} />
                                Reportar
                            </button>

                            <button
                                onClick={handleBlockUser}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#ef4444",
                                    padding: "0.75rem",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                    transition: "background 0.2s"
                                }}
                            >
                                <UserX size={18} />
                                Bloquear
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="public-profile-content">
                {/* Image Carousel */}
                <div className="photo-carousel">
                    {hasPhotos ? (
                        <>
                            <div
                                className={`carousel-image ${isTransitioning ? 'transitioning' : ''}`}
                                style={{
                                    backgroundImage: `url(${photos[currentPhotoIndex]})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                            >
                                {photos.length > 1 && (
                                    <>
                                        <button className="carousel-btn prev" onClick={prevPhoto}>
                                            ‹
                                        </button>
                                        <button className="carousel-btn next" onClick={nextPhoto}>
                                            ›
                                        </button>
                                        <div className="carousel-indicators">
                                            {photos.map((_, index) => (
                                                <div
                                                    key={index}
                                                    className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentPhotoIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="carousel-image placeholder">
                            <div className="placeholder-icon">📷</div>
                            <p>Sin fotos</p>
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="profile-info">
                    {/* Name & Age */}
                    <div className="profile-header">
                        <h2>
                            {userData?.name || "Usuario"}, {userData?.age || "—"}
                        </h2>
                        {userData?.location?.city && (
                            <p className="location">
                                <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} /> {userData.location.city}
                                {userData.location.state && `, ${userData.location.state}`}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    {userData?.bio && (
                        <div className="profile-section">
                            <h3><MessageSquare size={18} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} /> Sobre mí</h3>
                            <p className="bio-text">{userData.bio}</p>
                        </div>
                    )}

                    {/* More About Me */}
                    {(userData?.sexualOrientation || userData?.searchIntent) && (
                        <div className="profile-section">
                            <h3><Info size={18} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} /> Más sobre mí</h3>
                            <div className="details-grid">
                                {userData.sexualOrientation && (
                                    <div className="detail-item">
                                        <span className="detail-label">Orientación</span>
                                        <span className="detail-value">{userData.sexualOrientation}</span>
                                    </div>
                                )}
                                {userData.searchIntent && (
                                    <div className="detail-item">
                                        <span className="detail-label">Busco</span>
                                        <span className="detail-value">{userData.searchIntent}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lifestyle */}
                    {userData?.lifestyle && Object.values(userData.lifestyle).some(val => val) && (
                        <div className="profile-section">
                            <h3><Wine size={18} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} /> Estilo de Vida</h3>
                            <div className="details-grid">
                                {userData.lifestyle.height && (
                                    <div className="detail-item">
                                        <span className="detail-label">Altura</span>
                                        <span className="detail-value">{userData.lifestyle.height} cm</span>
                                    </div>
                                )}
                                {userData.lifestyle.zodiac && (
                                    <div className="detail-item">
                                        <span className="detail-label">Zodiaco</span>
                                        <span className="detail-value">{userData.lifestyle.zodiac}</span>
                                    </div>
                                )}
                                {userData.lifestyle.drink && (
                                    <div className="detail-item">
                                        <span className="detail-label">Bebida</span>
                                        <span className="detail-value">{userData.lifestyle.drink}</span>
                                    </div>
                                )}
                                {userData.lifestyle.smoke && (
                                    <div className="detail-item">
                                        <span className="detail-label">Tabaco</span>
                                        <span className="detail-value">{userData.lifestyle.smoke}</span>
                                    </div>
                                )}
                                {userData.lifestyle.workout && (
                                    <div className="detail-item">
                                        <span className="detail-label">Ejercicio</span>
                                        <span className="detail-value">{userData.lifestyle.workout}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Job */}
                    {userData?.job && (userData.job.title || userData.job.company || userData.job.education) && (
                        <div className="profile-section">
                            <h3><Briefcase size={18} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} /> Profesional</h3>
                            <div className="details-grid">
                                {userData.job.title && (
                                    <div className="detail-item">
                                        <span className="detail-label">Ocupación</span>
                                        <span className="detail-value">{userData.job.title}</span>
                                    </div>
                                )}
                                {userData.job.company && (
                                    <div className="detail-item">
                                        <span className="detail-label">Empresa</span>
                                        <span className="detail-value">{userData.job.company}</span>
                                    </div>
                                )}
                                {userData.job.education && (
                                    <div className="detail-item">
                                        <span className="detail-label">Educación</span>
                                        <span className="detail-value">{userData.job.education}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Interests */}
                    {userData?.interests && userData.interests.length > 0 && (
                        <div className="profile-section">
                            <h3><Target size={18} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} /> Intereses</h3>
                            <div className="interests-container">
                                {userData.interests.map((interest, index) => (
                                    <span key={index} className="interest-tag">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons - Only show when coming from feed */}
                {showActionButtons && (
                    <div className="profile-actions">
                        <button
                            className="action-btn pass"
                            onClick={handlePass}
                            aria-label="Pass"
                        >
                            <X size={32} />
                        </button>
                        <button
                            className="action-btn like"
                            onClick={handleLike}
                            aria-label="Like"
                        >
                            <Heart size={32} fill="currentColor" />
                        </button>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "1rem"
                }}>
                    <div className="glass" style={{
                        background: "#1a1a1a",
                        padding: "2rem",
                        borderRadius: "24px",
                        maxWidth: "400px",
                        width: "100%",
                        border: "1px solid var(--glass-border)",
                        animation: "scaleIn 0.3s ease"
                    }}>
                        <h3 style={{ marginBottom: "1rem", color: "white" }}>Reportar Usuario</h3>
                        <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            ¿Por qué quieres reportar a este usuario?
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            {["Comportamiento inapropiado", "Perfil falso", "Spam / Estafa", "Acoso", "Otro"].map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => setReportReason(reason)}
                                    style={{
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--glass-border)",
                                        background: reportReason === reason ? "var(--primary-color)" : "rgba(255,255,255,0.05)",
                                        color: "white",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={() => setShowReportModal(false)}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    borderRadius: "12px",
                                    border: "1px solid var(--glass-border)",
                                    background: "transparent",
                                    color: "white",
                                    cursor: "pointer"
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReportUser}
                                disabled={!reportReason}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    borderRadius: "12px",
                                    border: "none",
                                    background: reportReason ? "var(--primary-gradient)" : "rgba(255,255,255,0.1)",
                                    color: "white",
                                    cursor: reportReason ? "pointer" : "not-allowed",
                                    opacity: reportReason ? 1 : 0.5
                                }}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
