import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../api/user";
import BaseLayout from "../components/Layout/BaseLayout";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import TextArea from "../components/UI/TextArea";
import UpdateMultipleImagesWithCrop from "../components/Profile/UpdateMultipleImagesWithCrop";
import LocationSelector from "../components/Profile/LocationSelector";
import genderDataRaw from "../assets/data/gender-identities.json";
import orientationDataRaw from "../assets/data/sexual-orientation.json";
import interestsDataRaw from "../assets/data/interests.json";
import "./EditProfile.css";

const genderData = genderDataRaw.identidades_genero;
const orientationData = orientationDataRaw.orientaciones_sexuales;
// Flatten interests from all categories
const interestsData = Object.values(interestsDataRaw).flat().map(item => item.nombre);

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [genero, setGenero] = useState("");
  const [bio, setBio] = useState("");
  const [orientacionSexual, setOrientacionSexual] = useState("");
  const [intereses, setIntereses] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserProfile(user.uid);
          if (data) {
            setNombre(data.name || "");
            setEdad(data.age?.toString() || "");
            setGenero(data.gender || "");
            setBio(data.bio || "");
            setOrientacionSexual(data.sexualOrientation || "");
            setIntereses(data.interests || []);
            setImageUrls(data.images || []);
            setPais(data.location?.country || "");
            setProvincia(data.location?.state || "");
            setCiudad(data.location?.city || "");
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

  const handleInterestClick = (interest) => {
    if (intereses.includes(interest)) {
      setIntereses(intereses.filter(i => i !== interest));
    } else {
      if (intereses.length < 5) {
        setIntereses([...intereses, interest]);
      } else {
        alert("Máximo 5 intereses");
      }
    }
  };

  const handleImagesChange = (urls) => {
    if (urls.length <= 9) {
      setImageUrls(urls);
    } else {
      alert("Máximo 9 imágenes permitidas");
    }
  };

  const handleLocationChange = (location) => {
    setPais(location.country || "");
    setProvincia(location.state || "");
    setCiudad(location.city || "");
  };

  const handleSave = async () => {
    if (!nombre || !edad || !genero) {
      alert("Por favor completa los campos obligatorios: Nombre, Edad y Género");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: nombre,
        age: parseInt(edad),
        gender: genero,
        bio: bio,
        sexualOrientation: orientacionSexual,
        interests: intereses,
        images: imageUrls,
        location: {
          country: pais,
          state: provincia,
          city: ciudad
        }
      });

      alert("Perfil actualizado exitosamente");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar el perfil. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
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
    <BaseLayout showTabs={true} maxWidth="mobile">
      <div className="edit-profile-container">
        {/* Header */}
        <div className="edit-profile-header">
          <button className="back-button" onClick={handleCancel}>
            ← Volver
          </button>
          <h1>Editar Perfil</h1>
        </div>

        {/* Section 1: Basic Info */}
        <div className="edit-section">
          <h2>📋 Información Básica</h2>

          <div className="form-group">
            <label>Nombre *</label>
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label>Edad *</label>
            <Input
              type="number"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              placeholder="Tu edad"
              min="18"
              max="100"
            />
          </div>

          <div className="form-group">
            <label>Género *</label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              style={selectStyle}
            >
              <option value="">Selecciona tu género</option>
              {genderData.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <LocationSelector
              onLocationChange={handleLocationChange}
              initialLocation={{ pais, provincia, ciudad }}
            />
          </div>
        </div>

        {/* Section 2: About Me */}
        <div className="edit-section">
          <h2>💭 Sobre Mí</h2>

          <div className="form-group">
            <label>Biografía</label>
            <TextArea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Orientación Sexual</label>
            <select
              value={orientacionSexual}
              onChange={(e) => setOrientacionSexual(e.target.value)}
              style={selectStyle}
            >
              <option value="">Selecciona tu orientación</option>
              {orientationData.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Intereses (máximo 5)</label>
            <div className="interests-grid">
              {interestsData.map((interest) => (
                <button
                  key={interest}
                  className={`interest-btn ${intereses.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestClick(interest)}
                  type="button"
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="interest-count">{intereses.length}/5 seleccionados</p>
          </div>
        </div>

        {/* Section 3: Photos */}
        <div className="edit-section">
          <h2>📷 Fotos ({imageUrls.length}/9)</h2>
          <p className="section-description">
            Puedes subir hasta 9 fotos para tu perfil
          </p>
          <UpdateMultipleImagesWithCrop
            uid={user.uid}
            onImagesChange={handleImagesChange}
            initialImages={imageUrls}
            maxImages={9}
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "💾 Guardar Cambios"}
          </Button>
          <Button onClick={handleCancel} variant="secondary" disabled={saving}>
            ❌ Cancelar
          </Button>
        </div>
      </div>
    </BaseLayout>
  );
};

export default EditProfile;