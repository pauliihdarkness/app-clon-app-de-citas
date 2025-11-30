import React, { useState, useEffect } from "react";
import BaseLayout from "../../components/Layout/BaseLayout";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../api/user";
import { useNavigate } from "react-router-dom";
import { Edit2, Settings, Camera, MessageSquareQuote, Info, Wine, Briefcase, Target, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Touch gesture states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserProfile(user.uid);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const nextPhoto = () => {
    if (userData?.images && userData.images.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPhotoIndex((prev) =>
          prev === userData.images.length - 1 ? 0 : prev + 1
        );
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    }
  };

  const prevPhoto = () => {
    if (userData?.images && userData.images.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPhotoIndex((prev) =>
          prev === 0 ? userData.images.length - 1 : prev - 1
        );
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
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

  if (loading) {
    return (
      <BaseLayout showTabs={true} maxWidth="mobile">
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

  const photos = userData?.images || [];
  const hasPhotos = photos.length > 0;

  const headerActions = (
    <>
      <button onClick={handleEditProfile} className="header-btn" aria-label="Editar Perfil">
        <Edit2 size={20} />
      </button>
      <button onClick={() => navigate("/settings")} className="header-btn" aria-label="Configuración">
        <Settings size={20} />
      </button>
    </>
  );

  return (
    <BaseLayout showTabs={true} maxWidth="mobile" title="Mi Perfil" headerActions={headerActions}>
      <div className="profile-container">
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
            <h1>
              {userData?.name || "Usuario"}, {userData?.age || "—"}
            </h1>
            {userData?.location?.city && (
              <p className="location">
                <MapPin /> {userData.location.city}
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

          {/* More About Me - Sexual Orientation & Search Intent */}
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

          {/* Lifestyle Section */}
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

          {/* Job Section */}
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

          {/* Footer */}
          <div className="profile-footer">
            <p>Versión 1.0.0 • App de Citas</p>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Profile;