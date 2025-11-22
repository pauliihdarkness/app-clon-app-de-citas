import React from "react";
import "./UserCard.css";

const UserCard = ({ user, onLike, onPass }) => {
    if (!user) return null;

    const mainImage = user.images && user.images.length > 0 ? user.images[0] : null;

    return (
        <div className="user-card">
            <div
                className="card-image"
                style={{ backgroundImage: mainImage ? `url(${mainImage})` : 'none' }}
            >
                {!mainImage && <div className="placeholder-image">📷</div>}

                <div className="card-overlay">
                    <div className="card-info">
                        <h2>{user.name}, {user.age}</h2>
                        {user.location && (
                            <p className="card-location">
                                📍 {user.location.city}
                            </p>
                        )}
                        {user.bio && <p className="card-bio">{user.bio}</p>}

                        {/* Tags rápidos */}
                        <div className="card-tags">
                            {user.lifestyle?.zodiac && (
                                <span className="tag">✨ {user.lifestyle.zodiac}</span>
                            )}
                            {user.job?.title && (
                                <span className="tag">💼 {user.job.title}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button className="action-btn pass" onClick={onPass} aria-label="Pass">
                    ❌
                </button>
                <button className="action-btn like" onClick={onLike} aria-label="Like">
                    💚
                </button>
            </div>
        </div>
    );
};

export default UserCard;
