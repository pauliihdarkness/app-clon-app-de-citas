import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../../api/user";
import BaseLayout from "../../components/Layout/BaseLayout";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import TextArea from "../../components/UI/TextArea";
import Modal from "../../components/UI/Modal/Modal";
import UpdateMultipleImagesWithCrop from "../../components/Profile/UpdateMultipleImagesWithCrop/UpdateMultipleImagesWithCrop";
import LocationSelector from "../../components/Profile/LocationSelector/LocationSelector";
import genderDataRaw from "../../assets/data/gender-identities.json";
import orientationDataRaw from "../../assets/data/sexual-orientation.json";
import interestsDataRaw from "../../assets/data/interests.json";
import { Camera, Edit2, ArrowLeft } from "lucide-react";
import "./EditProfile.css";

const genderData = genderDataRaw.identidades_genero;
const orientationData = orientationDataRaw.orientaciones_sexuales;

const lifestyleOptions = {
  drink: ["Frecuentemente", "Socialmente", "Raramente", "Nunca"],
  smoke: ["Fumo", "Socialmente", "No fumo"],
  workout: ["Diario", "Frecuentemente", "A veces", "Nunca"],
  zodiac: ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"],
  searchIntent: ["Relación seria", "Algo casual", "Amistad", "No sé todavía", "Otro"],
  education: ["Secundaria", "Universitario", "Posgrado", "Otro"]
};

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'basic', 'bio', 'interests', 'lifestyle', 'job', 'intentions'

  // Data states (Source of Truth)
  const [userData, setUserData] = useState({
    name: "",
    gender: "",
    bio: "",
    sexualOrientation: "",
    interests: [],
    images: [],
    location: { country: "", state: "", city: "" },
    lifestyle: { drink: "", smoke: "", workout: "", zodiac: "", height: "" },
    job: { title: "", company: "", education: "" },
    searchIntent: ""
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
              },
              lifestyle: {
                drink: data.lifestyle?.drink || "",
                smoke: data.lifestyle?.smoke || "",
                workout: data.lifestyle?.workout || "",
                zodiac: data.lifestyle?.zodiac || "",
                height: data.lifestyle?.height || ""
              },
              job: {
                title: data.job?.title || "",
                company: data.job?.company || "",
                education: data.job?.education || ""
              },
              searchIntent: data.searchIntent || ""
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
      } else if (activeModal === 'lifestyle') {
        updateData = { lifestyle: tempData.lifestyle };
      } else if (activeModal === 'job') {
        updateData = { job: tempData.job };
      } else if (activeModal === 'intentions') {
        updateData = { searchIntent: tempData.searchIntent };
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

  const handleTempNestedChange = (parent, field, value) => {
    setTempData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
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
  const handleImagesChange = useCallback((urls) => {
    if (urls.length <= 9) {
      setUserData(prev => ({ ...prev, images: urls }));
    } else {
      alert("Máximo 9 imágenes permitidas");
    }
  }, []);

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

  return (
    <BaseLayout showTabs={false} maxWidth="mobile" title="Editar Perfil">
      <div className="edit-profile-container">

        {/* 1. Photos Section (Direct Edit) */}
        <div className="edit-box photos-box">
          <div className="box-header">
            <h2><Camera size={20} /> Fotos ({userData.images.length}/9)</h2>
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
            <span className="edit-icon"><Edit2 size={18} /></span>
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
            <span className="edit-icon"><Edit2 size={18} /></span>
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
            <span className="edit-icon"><Edit2 size={18} /></span>
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

        {/* 5. Lifestyle Summary Box */}
        <div className="edit-box summary-box" onClick={() => openModal('lifestyle')}>
          <div className="box-header">
            <h2>🍷 Estilo de Vida</h2>
            <span className="edit-icon"><Edit2 size={18} /></span>
          </div>
          <div className="box-content summary-content">
            <div className="summary-item">
              <span className="label">Altura:</span>
              <span className="value">{userData.lifestyle.height ? `${userData.lifestyle.height} cm` : "-"}</span>
            </div>
            <div className="summary-item">
              <span className="label">Zodiaco:</span>
              <span className="value">{userData.lifestyle.zodiac || "-"}</span>
            </div>
          </div>
        </div>

        {/* 6. Job Summary Box */}
        <div className="edit-box summary-box" onClick={() => openModal('job')}>
          <div className="box-header">
            <h2>💼 Información Profesional</h2>
            <span className="edit-icon"><Edit2 size={18} /></span>
          </div>
          <div className="box-content summary-content">
            <div className="summary-item">
              <span className="label">Ocupación:</span>
              <span className="value">{userData.job.title || "-"}</span>
            </div>
          </div>
        </div>

        {/* 7. Intentions Summary Box */}
        <div className="edit-box summary-box" onClick={() => openModal('intentions')}>
          <div className="box-header">
            <h2>❤️ Qué busco</h2>
            <span className="edit-icon"><Edit2 size={18} /></span>
          </div>
          <div className="box-content summary-content">
            <p className="bio-preview">
              {userData.searchIntent || "Selecciona qué estás buscando..."}
            </p>
          </div>
        </div>

        <div className="global-actions">
          <Button onClick={() => navigate("/profile")} variant="secondary">
            <ArrowLeft size={18} /> Volver al Perfil
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
                className="custom-select"
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
                className="custom-select"
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

        {/* Lifestyle Modal */}
        <Modal isOpen={activeModal === 'lifestyle'} onClose={closeModal} title="Estilo de Vida">
          <div className="modal-form-content">
            <div className="form-group">
              <label>Altura (cm)</label>
              <Input
                type="number"
                value={tempData.lifestyle?.height || ""}
                onChange={(e) => handleTempNestedChange('lifestyle', 'height', e.target.value)}
                placeholder="Ej: 175"
              />
            </div>
            <div className="form-group">
              <label>Signo Zodiacal</label>
              <select
                value={tempData.lifestyle?.zodiac || ""}
                onChange={(e) => handleTempNestedChange('lifestyle', 'zodiac', e.target.value)}
                className="custom-select"
              >
                <option value="">Selecciona</option>
                {lifestyleOptions.zodiac.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Bebida</label>
              <select
                value={tempData.lifestyle?.drink || ""}
                onChange={(e) => handleTempNestedChange('lifestyle', 'drink', e.target.value)}
                className="custom-select"
              >
                <option value="">Selecciona</option>
                {lifestyleOptions.drink.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tabaco</label>
              <select
                value={tempData.lifestyle?.smoke || ""}
                onChange={(e) => handleTempNestedChange('lifestyle', 'smoke', e.target.value)}
                className="custom-select"
              >
                <option value="">Selecciona</option>
                {lifestyleOptions.smoke.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ejercicio</label>
              <select
                value={tempData.lifestyle?.workout || ""}
                onChange={(e) => handleTempNestedChange('lifestyle', 'workout', e.target.value)}
                className="custom-select"
              >
                <option value="">Selecciona</option>
                {lifestyleOptions.workout.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Job Modal */}
        <Modal isOpen={activeModal === 'job'} onClose={closeModal} title="Información Profesional">
          <div className="modal-form-content">
            <div className="form-group">
              <label>Ocupación / Puesto</label>
              <Input
                type="text"
                value={tempData.job?.title || ""}
                onChange={(e) => handleTempNestedChange('job', 'title', e.target.value)}
                placeholder="Ej: Desarrollador de Software"
              />
            </div>
            <div className="form-group">
              <label>Empresa / Institución</label>
              <Input
                type="text"
                value={tempData.job?.company || ""}
                onChange={(e) => handleTempNestedChange('job', 'company', e.target.value)}
                placeholder="Ej: Google"
              />
            </div>
            <div className="form-group">
              <label>Educación</label>
              <select
                value={tempData.job?.education || ""}
                onChange={(e) => handleTempNestedChange('job', 'education', e.target.value)}
                className="custom-select"
              >
                <option value="">Selecciona</option>
                {lifestyleOptions.education.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Intentions Modal */}
        <Modal isOpen={activeModal === 'intentions'} onClose={closeModal} title="Qué busco">
          <div className="modal-form-content">
            <div className="form-group">
              <label>Estoy buscando...</label>
              <select
                value={tempData.searchIntent || ""}
                onChange={(e) => handleTempChange('searchIntent', e.target.value)}
                className="custom-select"
              >
                <option value="">Selecciona</option>
                {lifestyleOptions.searchIntent.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </BaseLayout>
  );
};

export default EditProfile;