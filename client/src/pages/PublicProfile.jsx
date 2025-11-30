import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../api/user";
import { saveLike, savePass } from "../api/likes";
import { ChevronLeft, ChevronRight, Camera, MessageSquareQuote, MapPin, Info, Wine, Briefcase, Target, X, Heart } from "lucide-react";
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
                <button onClick={() => navigate(-1)} className="back-btn-public-profile" aria-label="Volver">
                    <ChevronLeft size={28} color="var(--text-color)" />
                </button>
                <h1>Perfil</h1>
                <div style={{ width: "40px" }}></div> {/* Spacer for centering */}
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
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button className="carousel-btn next" onClick={nextPhoto}>
                                            <ChevronRight size={24} />
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
                            <div className="placeholder-icon"><Camera size={48} /></div>
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
                                <MapPin size={18} />
                                {userData.location.city}
                                {userData.location.state && `, ${userData.location.state}`}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    {userData?.bio && (
                        <div className="profile-section">
                            <h3><MessageSquareQuote size={18} /> Sobre mí</h3>
                            <p className="bio-text">{userData.bio}</p>
                        </div>
                    )}

                    {/* More About Me */}
                    {(userData?.sexualOrientation || userData?.searchIntent) && (
                        <div className="profile-section">
                            <h3><Info size={18} /> Más sobre mí</h3>
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
                            <h3><Wine size={18} /> Estilo de Vida</h3>
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
                            <h3><Briefcase size={18} /> Profesional</h3>
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
                            <h3><Target size={18} /> Intereses</h3>
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

        </div>
    );
};

export default PublicProfile;
