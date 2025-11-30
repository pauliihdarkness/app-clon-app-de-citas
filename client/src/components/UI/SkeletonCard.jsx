import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => {
    return (
        <div className="skeleton-card skeleton-shimmer">
            <div className="skeleton-content">
                {/* Title (Name + Age) */}
                <div className="skeleton-text skeleton-title skeleton-shimmer"></div>

                {/* Bio lines */}
                <div className="skeleton-text skeleton-line skeleton-shimmer"></div>
                <div className="skeleton-text skeleton-line skeleton-shimmer"></div>
                <div className="skeleton-text skeleton-line short skeleton-shimmer"></div>

                {/* Action Buttons */}
                <div className="skeleton-actions">
                    <div className="skeleton-btn skeleton-shimmer"></div>
                    <div className="skeleton-btn skeleton-shimmer"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
