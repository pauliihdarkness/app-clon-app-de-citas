import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";

const UserCard = ({ user, onLike, onPass }) => {
    const navigate = useNavigate();
    const [swipeX, setSwipeX] = useState(0);
    const [swipeY, setSwipeY] = useState(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const cardRef = useRef(null);
    const infoRef = useRef(null);

    useEffect(() => {
        // Reset photo index when user changes (deferred to avoid synchronous setState in effect)
        const t = setTimeout(() => {
            setCurrentPhotoIndex(0);
            setSwipeX(0);
            setSwipeY(0);
            setIsExiting(false);
        }, 0);
        return () => clearTimeout(t);
    }, [user?.id]);

    if (!user) return null;

    const images = user.images && user.images.length > 0 ? user.images : [];
    const hasMultiplePhotos = images.length > 1;
    const currentImage = images[currentPhotoIndex] || null;

    // Haptic feedback helper
    const triggerHaptic = (style = "light") => {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 30
            };
            navigator.vibrate(patterns[style] || 10);
        }
    };

    // Touch handlers for swipe
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStartX.current;
        const deltaY = currentY - touchStartY.current;

        // Only swipe horizontally if horizontal movement is greater
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault(); // Prevent scroll
            setSwipeX(deltaX);
            setSwipeY(deltaY * 0.1); // Slight vertical movement for realism
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        const threshold = 100; // Minimum swipe distance

        if (Math.abs(swipeX) > threshold) {
            // Trigger action
            setIsExiting(true);
            triggerHaptic("medium");

            setTimeout(() => {
                if (swipeX > 0) {
                    onLike();
                } else {
                    onPass();
                }
                // Reset will happen when new user loads
            }, 300);
        } else {
            // Reset position
            setSwipeX(0);
            setSwipeY(0);
        }
    };

    // Tap handlers for photo navigation
    const handleCardTap = (e) => {
        // Don't navigate photos if dragging or if clicking on action buttons/info buttons
        if (isDragging || e.target.closest('.action-btn') || e.target.closest('.info-btn')) return;

        if (!hasMultiplePhotos) return;

        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const cardWidth = rect.width;

        if (tapX < cardWidth / 2) {
            // Tap on left side - previous photo
            setCurrentPhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            triggerHaptic("light");
        } else {
            // Tap on right side - next photo
            setCurrentPhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            triggerHaptic("light");
        }
    };

    // Handle view profile
    const handleViewProfile = (e) => {
        e.stopPropagation();
        if (user?.id) {
            triggerHaptic("light");
            navigate(`/user/${user.id}`, { state: { fromFeed: true } });
        }
    };


    // Calculate rotation based on swipe
    const rotation = swipeX * 0.03; // Subtle rotation
    const opacity = isExiting ? 0 : 1;

    // Determine overlay color and opacity
    const overlayOpacity = Math.min(Math.abs(swipeX) / 100, 0.5);
    const isLikeDirection = swipeX > 0;

    return (
        <div
            ref={cardRef}
            className={`user-card ${isExiting ? 'exiting' : ''}`}
            style={{
                transform: `translateX(${swipeX}px) translateY(${swipeY}px) rotate(${rotation}deg)`,
                opacity,
                transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleCardTap}
        >
            {/* Photo Indicators */}
            {hasMultiplePhotos && (
                <div className="photo-indicators">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`indicator-bar ${index === currentPhotoIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            )}

            {/* Swipe Overlays */}
            {swipeX !== 0 && (
                <>
                    <div
                        className="swipe-overlay like-overlay"
                        style={{ opacity: isLikeDirection ? overlayOpacity : 0 }}
                    >
                        <div className="overlay-icon">❤️</div>
                        <div className="overlay-text">LIKE</div>
                    </div>
                    <div
                        className="swipe-overlay pass-overlay"
                        style={{ opacity: !isLikeDirection ? overlayOpacity : 0 }}
                    >
                        <div className="overlay-icon">✖️</div>
                        <div className="overlay-text">PASS</div>
                    </div>
                </>
            )}

            <div
                className="card-image"
                style={{ backgroundImage: currentImage ? `url(${currentImage})` : 'none' }}
            >
                {!currentImage && <div className="placeholder-image">📷</div>}

                <div className="card-overlay">
                    <div className="card-info" ref={infoRef}>
                        <div className="card-info-header">
                            <h2>{user.name}, {user.age}</h2>
                            <button
                                className="info-btn profile-btn"
                                onClick={handleViewProfile}
                                aria-label="Ver perfil completo"
                                title="Ver perfil completo"
                            >
                                ℹ️
                            </button>
                        </div>
                        {user.bio && <p className="card-bio">{user.bio}</p>}
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button
                    className="action-btn pass"
                    onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic("medium");
                        onPass();
                    }}
                    aria-label="Pass"
                >
                    ❌
                </button>
                <button
                    className="action-btn like"
                    onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic("medium");
                        onLike();
                    }}
                    aria-label="Like"
                >
                    💚
                </button>
            </div>
        </div>
    );
};

export default UserCard;
