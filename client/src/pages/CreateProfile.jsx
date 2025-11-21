import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createUserProfile, createPrivateUserData } from "../api/user";
import { calculateAge, getMaxBirthDate, getMinBirthDate, validateBirthDate } from "../utils/dateUtils";
import BaseLayout from "../components/Layout/BaseLayout";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import TextArea from "../components/UI/TextArea";
import LocationSelector from "../components/Profile/LocationSelector";
import UpdateMultipleImagesWithCrop from "../components/Profile/UpdateMultipleImagesWithCrop";
import genderData from "../assets/data/gender-identities.json";
import orientationData from "../assets/data/sexual-orientation.json";
import interestsData from "../assets/data/interests.json";

const CreateProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [edad, setEdad] = useState("");
    const [genero, setGenero] = useState("");
    const [orientacionSexual, setOrientacionSexual] = useState("");
    const [bio, setBio] = useState("");
    const [intereses, setIntereses] = useState([]);
    const [pais, setPais] = useState("");
    const [provincia, setProvincia] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);

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

    const handleLocationChange = (location) => {
        setPais(location.country || "");
        setProvincia(location.state || "");
        setCiudad(location.city || "");
    };

    const handleImagesChange = (urls) => {
        setImageUrls(urls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        // Validate birth date
        const validation = validateBirthDate(fechaNacimiento);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        setIsLoading(true);
        try {
            // Save public profile data
            await createUserProfile(user.uid, {
                name: nombre,
                age: calculateAge(fechaNacimiento),
                gender: genero,
                sexualOrientation: orientacionSexual,
                bio: bio,
                interests: intereses,
                location: {
                    country: pais || "",
                    state: provincia || "",
                    city: ciudad || ""
                },
                uid: user.uid,
                images: imageUrls,
                createdAt: new Date()
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
        appearance: "none", // Remove default arrow
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right .7em top 50%",
        backgroundSize: ".65em auto",
    };

    return (
        <BaseLayout maxWidth="tablet">
            <h1>Crear Perfil</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                <Input
                    type="date"
                    placeholder="Fecha de nacimiento"
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

                {edad && (
                    <div style={{ color: edad < 18 ? "red" : "#333", fontWeight: "bold" }}>
                        Edad: {edad} {edad < 18 ? "(Debes ser mayor de 18 años)" : ""}
                    </div>
                )}

                {/* Gender Select */}
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

                {/* Sexual Orientation Select */}
                <div style={{ position: "relative" }}>
                    <select
                        value={orientacionSexual}
                        onChange={(e) => setOrientacionSexual(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="" style={{ color: "#999" }}>Selecciona tu orientación sexual</option>
                        {orientationData.orientaciones_sexuales.map((o) => (
                            <option key={o} value={o} style={{ color: "#333" }}>{o}</option>
                        ))}
                    </select>
                </div>

                <TextArea
                    placeholder="Cuéntanos sobre ti (Bio)"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={5}
                />

                <div>
                    <strong>Selecciona tus intereses:</strong>
                    {Object.entries(interestsData).map(([categoria, items]) => (
                        <div key={categoria} style={{ marginBottom: "0.5rem" }}>
                            <span style={{ fontWeight: "bold" }}>{categoria}</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
                                {items.map(({ emoji, nombre }) => (
                                    <span
                                        key={nombre}
                                        onClick={() => handleInterestClick(nombre)}
                                        style={{
                                            cursor: "pointer",
                                            padding: "0.3rem 0.7rem",
                                            borderRadius: "16px",
                                            background: intereses.includes(nombre) ? "linear-gradient(90deg, #FE3C72 0%, #FF7854 100%)" : "#f3f3f3",
                                            color: intereses.includes(nombre) ? "#fff" : "#333",
                                            border: intereses.includes(nombre) ? "2px solid #FFC107" : "1px solid #ccc",
                                            fontSize: "1rem",
                                            userSelect: "none",
                                            boxShadow: intereses.includes(nombre) ? "0 2px 8px rgba(254,60,114,0.15)" : "none",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {emoji} {nombre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ margin: "0.5rem 0" }}>
                    <strong>Intereses seleccionados:</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
                        {intereses.map((nombre) => {
                            const categoria = Object.keys(interestsData).find(cat => interestsData[cat].some(i => i.nombre === nombre));
                            const item = categoria ? interestsData[categoria].find(i => i.nombre === nombre) : null;
                            return item ? (
                                <span
                                    key={nombre}
                                    style={{ background: "linear-gradient(90deg, #FF7854 0%, #FE3C72 100%)", color: "#fff", borderRadius: "16px", padding: "0.3rem 0.7rem", cursor: "pointer", border: "2px solid #FFC107", boxShadow: "0 2px 8px rgba(255,120,84,0.15)" }}
                                    onClick={() => handleInterestClick(nombre)}
                                    title="Quitar interés"
                                >
                                    {item.emoji} {nombre}
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>

                <LocationSelector
                    onLocationChange={handleLocationChange}
                    initialLocation={{ pais, provincia, ciudad }}
                />

                <UpdateMultipleImagesWithCrop
                    uid={user?.uid}
                    onImagesChange={handleImagesChange}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Crear Perfil"}
                </Button>
            </form>
        </BaseLayout>
    );
};

export default CreateProfile;
