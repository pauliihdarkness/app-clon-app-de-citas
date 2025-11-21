import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../api/user";
import BaseLayout from "../components/Layout/BaseLayout";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import TextArea from "../components/UI/TextArea";
import Modal from "../components/UI/Modal";
import UpdateMultipleImagesWithCrop from "../components/Profile/UpdateMultipleImagesWithCrop";
import LocationSelector from "../components/Profile/LocationSelector";
import genderDataRaw from "../assets/data/gender-identities.json";
import orientationDataRaw from "../assets/data/sexual-orientation.json";
import interestsDataRaw from "../assets/data/interests.json";
import "./EditProfile.css";

const genderData = genderDataRaw.identidades_genero;
const orientationData = orientationDataRaw.orientaciones_sexuales;

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'basic', 'bio', 'interests'

  // Data states (Source of Truth)
  const [userData, setUserData] = useState({
    name: "",
    gender: "",
    bio: "",
    sexualOrientation: "",
    interests: [],
    images: [],
    location: { country: "", state: "", city: "" }
  });

  // Temp states for editing (Modals)
  const [tempData, setTempData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserProfile(user.uid);
          if (data) {
            setUserData({
              name: data.name || "",
              gender: data.gender || "",
              bio: data.bio || "",
              sexualOrientation: data.sexualOrientation || "",
              interests: data.interests || [],
              images: data.images || [],
              location: {
                country: data.location?.country || "",
                state: data.location?.state || "",
                city: data.location?.city || ""
              }
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const openModal = (modalName) => {
    setTempData({ ...userData }); // Copy current data to temp
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setTempData({});
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Prepare update object based on active modal
      let updateData = {};

      if (activeModal === 'basic') {
        if (!tempData.name || !tempData.gender) {
          alert("Nombre y Género son obligatorios");
          setSaving(false);
          return;
        }
        updateData = {
          name: tempData.name,
          gender: tempData.gender,
          sexualOrientation: tempData.sexualOrientation,
          location: tempData.location
        };
      } else if (activeModal === 'bio') {
        updateData = { bio: tempData.bio };
      } else if (activeModal === 'interests') {
        updateData = { interests: tempData.interests };
      }

      await updateUserProfile(user.uid, updateData);

      // Update local state
      setUserData(prev => ({ ...prev, ...updateData }));
      closeModal();

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  // Handlers for Temp Data
  const handleTempChange = (field, value) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  const handleTempLocationChange = (location) => {
    setTempData(prev => ({ ...prev, location }));
  };

  const handleTempInterestClick = (interest) => {
    const currentInterests = tempData.interests || [];
    if (currentInterests.includes(interest)) {
      handleTempChange('interests', currentInterests.filter(i => i !== interest));
    } else {
      if (currentInterests.length < 8) {
        handleTempChange('interests', [...currentInterests, interest]);
      } else {
        alert("Máximo 8 intereses");
      }
    }
  };

  // Direct Image Update (No Modal needed for this as per previous logic, or keep it separate)
  const handleImagesChange = (urls) => {
    if (urls.length <= 9) {
      setUserData(prev => ({ ...prev, images: urls }));
    } else {
      alert("Máximo 9 imágenes permitidas");
    }
  };

  const handleDirectImageUpdate = async (newImages) => {
    try {
      await updateUserProfile(user.uid, { images: newImages });
    } catch (error) {
      console.error("Error updating images:", error);
    }
  };

  if (loading) {
    return (
      <BaseLayout showTabs={true} maxWidth="mobile">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </BaseLayout>
    );
  }

  const selectStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "var(--border-radius)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "12px",
    paddingRight: "36px"
  };

  return (
    <BaseLayout showTabs={false} maxWidth="mobile" title="Editar Perfil">
      <div className="edit-profile-container">

        {/* 1. Photos Section (Direct Edit) */}
        <div className="edit-box photos-box">
          <div className="box-header">
            <h2>📷 Fotos ({userData.images.length}/9)</h2>
          </div>
          <div className="box-content">
            <UpdateMultipleImagesWithCrop
              uid={user.uid}
              onImagesChange={handleImagesChange}
              onDirectUpdate={handleDirectImageUpdate}
              initialImages={userData.images}
              maxImages={9}
            />
          </div>
        </div>

        {/* 2. Basic Info Summary Box */}
        <div className="edit-box summary-box" onClick={() => openModal('basic')}>
          <div className="box-header">
            <h2>📋 Información Básica</h2>
            <span className="edit-icon">✏️</span>
          </div>
          <div className="box-content summary-content">
            <div className="summary-item">
              <span className="label">Nombre:</span>
              <span className="value">{userData.name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Género:</span>
              <span className="value">{userData.gender}</span>
            </div>
            <div className="summary-item">
              <span className="label">Ubicación:</span>
              <span className="value">
                {userData.location.city ? `${userData.location.city}, ${userData.location.state}` : "No definida"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Bio Summary Box */}
        <div className="edit-box summary-box" onClick={() => openModal('bio')}>
          <div className="box-header">
            <h2>💭 Sobre Mí</h2>
            <span className="edit-icon">✏️</span>
          </div>
          <div className="box-content summary-content">
            <p className="bio-preview">
              {userData.bio || "¡Cuéntanos algo sobre ti! Toca para editar."}
            </p>
          </div>
        </div>

        {/* 4. Interests Summary Box */}
        <div className="edit-box summary-box" onClick={() => openModal('interests')}>
          <div className="box-header">
            <h2>✨ Intereses ({userData.interests.length}/8)</h2>
            <span className="edit-icon">✏️</span>
          </div>
          <div className="box-content summary-content">
            <div className="interests-preview">
              {userData.interests.length > 0 ? (
                userData.interests.map(interest => (
                  <span key={interest} className="interest-tag-preview">{interest}</span>
                ))
              ) : (
                <span className="placeholder-text">Toca para seleccionar intereses</span>
              )}
            </div>
          </div>
        </div>

        <div className="global-actions">
          <Button onClick={() => navigate("/profile")} variant="secondary">
            ⬅️ Volver al Perfil
          </Button>
        </div>

        {/* --- MODALS --- */}

        {/* Basic Info Modal */}
        <Modal isOpen={activeModal === 'basic'} onClose={closeModal} title="Editar Información Básica">
          <div className="modal-form-content">
            <div className="form-group">
              <label>Nombre *</label>
              <Input
                type="text"
                value={tempData.name || ""}
                onChange={(e) => handleTempChange('name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Género *</label>
              <select
                value={tempData.gender || ""}
                onChange={(e) => handleTempChange('gender', e.target.value)}
                style={selectStyle}
              >
                <option value="">Selecciona</option>
                {genderData.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Orientación Sexual</label>
              <select
                value={tempData.sexualOrientation || ""}
                onChange={(e) => handleTempChange('sexualOrientation', e.target.value)}
                style={selectStyle}
              >
                <option value="">Selecciona</option>
                {orientationData.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ubicación</label>
              <LocationSelector
                onLocationChange={handleTempLocationChange}
                initialLocation={tempData.location || {}}
              />
            </div>
            <div className="modal-actions">
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Bio Modal */}
        <Modal isOpen={activeModal === 'bio'} onClose={closeModal} title="Editar Biografía">
          <div className="modal-form-content">
            <div className="form-group">
              <label>Biografía (máx 500 caracteres)</label>
              <TextArea
                value={tempData.bio || ""}
                onChange={(e) => handleTempChange('bio', e.target.value)}
                placeholder="Escribe aquí..."
                maxLength={500}
                className="bio-textarea-fixed"
              />
              <div className="char-count">{(tempData.bio || "").length}/500</div>
            </div>
            <div className="modal-actions">
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Interests Modal */}
        <Modal isOpen={activeModal === 'interests'} onClose={closeModal} title="Editar Intereses">
          <div className="modal-form-content">
            <div className="interests-categories-modal">
              {Object.entries(interestsDataRaw).map(([category, items]) => (
                <div key={category} className="interest-category">
                  <h3>{category}</h3>
                  <div className="interests-grid-small">
                    {items.map((item) => (
                      <button
                        key={item.nombre}
                        className={`interest-tag ${(tempData.interests || []).includes(item.nombre) ? 'selected' : ''}`}
                        onClick={() => handleTempInterestClick(item.nombre)}
                        type="button"
                      >
                        <span className="emoji">{item.emoji}</span>
                        <span className="name">{item.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions sticky-footer">
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Guardando..." : `Guardar (${(tempData.interests || []).length}/8)`}
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </BaseLayout>
  );
};

export default EditProfile;