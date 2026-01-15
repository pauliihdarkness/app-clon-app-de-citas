import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";
import { createUserProfile, createPrivateUserData } from "../../api/user";
import { calculateAge, getMaxBirthDate, getMinBirthDate, validateBirthDate } from "../../utils/dateUtils";
import BaseLayout from "../../components/Layout/BaseLayout";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import LocationSelector from "../../components/Profile/LocationSelector/LocationSelector";
import UpdateMultipleImagesWithCrop from "../../components/Profile/UpdateMultipleImagesWithCrop/UpdateMultipleImagesWithCrop.jsx";
import genderData from "../../assets/data/gender-identities.json";
import orientationData from "../../assets/data/sexual-orientation.json";
import pronounsData from "../../assets/data/pronouns.json";
import { MapPin, Calendar, Camera, User, Users, Heart } from "lucide-react";

const CreateProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [edad, setEdad] = useState("");
    const [genero, setGenero] = useState("");
    const [pronombres, setPronombres] = useState("");
    const [orientacionSexual, setOrientacionSexual] = useState("");
    const [pais, setPais] = useState("");
    const [provincia, setProvincia] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [imageUrls, setImageUrls] = useState([]);

    // Estados de UI
    const [isLoading, setIsLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const handleLocationChange = (location) => {
        setPais(location.pais || location.country || "");
        setProvincia(location.provincia || location.state || "");
        setCiudad(location.ciudad || location.city || "");
    };

    const handleImagesChange = (urls) => {
        setImageUrls(urls);
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (!user) return;

        // Validaciones básicas
        if (!nombre.trim()) {
            alert("Por favor ingresa tu nombre");
            return;
        }

        const validation = validateBirthDate(fechaNacimiento);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        if (!genero) {
            alert("Por favor selecciona tu género");
            return;
        }

        if (imageUrls.length === 0) {
            alert("Por favor sube al menos una foto");
            return;
        }

        if (!pais || !provincia || !ciudad) {
            alert("Por favor selecciona tu ubicación completa (país, provincia y ciudad)");
            return;
        }

        // Si todo está bien, mostrar modal
        setShowTermsModal(true);
    };

    const handleConfirmSubmit = async () => {
        setIsLoading(true);
        try {
            // Recalcular edad para asegurar que sigue siendo válida
            const edadActual = calculateAge(fechaNacimiento);
            
            if (!edadActual || edadActual < 18) {
                alert("Debes ser mayor de 18 años para crear tu perfil");
                setIsLoading(false);
                return;
            }

                // Save public profile data
            await createUserProfile(user.uid, {
                name: nombre,
                age: edadActual,
                gender: genero,
                    pronouns: pronombres,
                sexualOrientation: orientacionSexual,
                location: {
                    country: pais || "",
                    state: provincia || "",
                    city: ciudad || ""
                },
                uid: user.uid,
                images: imageUrls,
                createdAt: serverTimestamp()
            });

            // Save private data (birthDate)
            await createPrivateUserData(user.uid, {
                email: user.email,
                birthDate: fechaNacimiento
            });

            navigate("/feed");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Error al guardar el perfil. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
            setShowTermsModal(false);
        }
    };

    // Styles for select to match Input component
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
        backgroundPosition: "right .7em top 50%",
        backgroundSize: ".65em auto",
    };

    return (
        <BaseLayout maxWidth="tablet">
            <h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Crear Perfil</h1>

            <form onSubmit={handlePreSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* 1. Nombre */}
                <div className="form-section">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                        <User size={18} /> Nombre
                    </label>
                    <Input
                        type="text"
                        placeholder="Tu nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>

                {/* 2. Fecha de Nacimiento */}
                <div className="form-section">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                        <Calendar size={18} /> Fecha de Nacimiento
                    </label>
                    <Input
                        type="date"
                        value={fechaNacimiento || ""}
                        max={getMaxBirthDate()}
                        min={getMinBirthDate()}
                        onChange={(e) => {
                            const fecha = e.target.value;
                            setFechaNacimiento(fecha);
                            if (fecha) {
                                const edadCalculada = calculateAge(fecha);
                                setEdad(edadCalculada);
                            } else {
                                setEdad("");
                            }
                        }}
                    />
                    {edad !== "" && (
                        <div style={{
                            marginTop: "0.5rem",
                            color: edad < 18 ? "#ff3b30" : "#4cd964",
                            fontSize: "0.9rem"
                        }}>
                            Edad: {edad} años {edad < 18 ? "(Debes ser mayor de 18)" : "✓"}
                        </div>
                    )}
                </div>

                {/* 3. Género */}
                <div className="form-section">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                        <Users size={18} /> Género
                    </label>
                    <div style={{ position: "relative" }}>
                        <select
                            value={genero}
                            onChange={(e) => setGenero(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="" style={{ color: "#999" }}>Selecciona tu género</option>
                            {genderData.identidades_genero.map((g) => (
                                <option key={g} value={g} style={{ color: "#333" }}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 4. Pronombres (opcional) */}
                <div className="form-section">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                        <Users size={18} /> Pronombres
                    </label>
                    <div style={{ position: "relative" }}>
                        <select
                            value={pronombres}
                            onChange={(e) => setPronombres(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="" style={{ color: "#999" }}>Elige cómo te nombramos (opcional)</option>
                            {pronounsData.pronouns.map((p) => (
                                <option key={p} value={p} style={{ color: "#333" }}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 5. Orientación Sexual */}
                <div className="form-section">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                        <Heart size={18} /> Orientación Sexual
                    </label>
                    <div style={{ position: "relative" }}>
                        <select
                            value={orientacionSexual}
                            onChange={(e) => setOrientacionSexual(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="" style={{ color: "#999" }}>Selecciona tu orientación</option>
                            {orientationData.orientaciones_sexuales.map((o) => (
                                <option key={o} value={o} style={{ color: "#333" }}>{o}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 6. Fotos */}
                <div className="form-section">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                        <Camera size={18} /> Tus Fotos
                    </label>
                    <UpdateMultipleImagesWithCrop
                        uid={user?.uid}
                        onImagesChange={handleImagesChange}
                    />
                </div>

                {/* 6. Ubicación */}
                <div className="form-section">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                        <MapPin size={18} /> Ubicación
                    </label>
                    <LocationSelector
                        onLocationChange={handleLocationChange}
                        initialLocation={{ provincia, ciudad }}
                    />
                </div>

                <Button type="submit" disabled={isLoading} style={{ marginTop: "1rem" }}>
                    Continuar
                </Button>
            </form>

            {/* Modal de Términos y Condiciones */}
            {showTermsModal && (
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
                        maxWidth: "500px",
                        width: "100%",
                        border: "1px solid var(--glass-border)",
                        animation: "scaleIn 0.3s ease"
                    }}>
                        <h2 style={{ marginBottom: "1rem", color: "white" }}>Términos y Condiciones</h2>
                        <div style={{
                            maxHeight: "300px",
                            overflowY: "auto",
                            marginBottom: "1.5rem",
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                            lineHeight: "1.6",
                            paddingRight: "0.5rem"
                        }}>
                            <p>Al crear una cuenta en nuestra plataforma, aceptas los siguientes términos:</p>
                            <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
                                <li>Debes ser mayor de 18 años.</li>
                                <li>No subirás contenido ofensivo, ilegal o que viole derechos de terceros.</li>
                                <li>Respetarás a lxs demás usuaries y no realizarás acoso ni spam.</li>
                                <li>Nos reservamos el derecho de suspender cuentas que violen estas normas.</li>
                            </ul>
                            <p style={{ marginTop: "0.5rem" }}>
                                Tu privacidad es importante para nosotres. Consulta nuestra Política de Privacidad para más detalles.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <Button
                                onClick={() => setShowTermsModal(false)}
                                style={{ background: "transparent", border: "1px solid var(--glass-border)" }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirmSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? "Creando..." : "Acepto"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </BaseLayout>
    );
};

export default CreateProfile;
