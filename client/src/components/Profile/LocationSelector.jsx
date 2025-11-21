import React, { useState, useEffect, useMemo } from 'react';
import Input from "../UI/Input";
import Button from "../UI/Button";
import localizations from "../../assets/data/Localizations-AR.json";
import { getInitialLocation } from "../../utils/geolocation";
import "../../assets/styles/global.css";

const LocationSelector = ({ onLocationChange, initialLocation }) => {
    const [pais] = useState("Argentina"); // Por ahora fijo en Argentina
    const [provincia, setProvincia] = useState(initialLocation?.provincia || "");
    const [ciudad, setCiudad] = useState(initialLocation?.ciudad || "");
    const [sugerencias, setSugerencias] = useState([]);
    const [geoError, setGeoError] = useState("");
    const [isLoadingGeo, setIsLoadingGeo] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Obtener lista de provincias
    const provincias = useMemo(() => {
        return localizations[pais] ? Object.keys(localizations[pais]).sort() : [];
    }, [pais]);

    // Actualizar sugerencias cuando cambia la ciudad o provincia
    useEffect(() => {
        if (provincia && ciudad.length > 0) {
            const ciudadesProvincia = localizations[pais][provincia] || [];
            const filtered = ciudadesProvincia
                .filter(item => item.ciudad.toLowerCase().includes(ciudad.toLowerCase()))
                .map(item => item.ciudad)
                .slice(0, 10); // Limitar a 10 resultados
            setSugerencias(filtered);
            setShowSuggestions(true);
        } else {
            setSugerencias([]);
            setShowSuggestions(false);
        }
    }, [ciudad, provincia, pais]);

    // Notificar al padre cuando cambia la ubicación completa
    useEffect(() => {
        onLocationChange({ country: pais, state: provincia, city: ciudad });
    }, [pais, provincia, ciudad, onLocationChange]);

    const handleDetectLocation = async () => {
        setGeoError("");
        setIsLoadingGeo(true);
        try {
            const loc = await getInitialLocation();
            if (loc.pais === "Argentina") { // Validar que sea del país soportado
                // Intentar normalizar nombres si es necesario
                // Por ahora asumimos que vienen bien o el usuario corregirá
                setProvincia(loc.provincia); // Ojo: Nominatim puede devolver nombres ligeramente distintos
                setCiudad(loc.ciudad);
            } else {
                setGeoError("Solo disponible en Argentina por el momento.");
            }
        } catch (err) {
            setGeoError(typeof err === 'string' ? err : "Error al detectar ubicación");
        } finally {
            setIsLoadingGeo(false);
        }
    };

    const handleSelectCity = (selectedCity) => {
        setCiudad(selectedCity);
        setShowSuggestions(false);
    };

    return (
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>📍 Ubicación</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Provincia</label>
                <select
                    value={provincia}
                    onChange={e => {
                        setProvincia(e.target.value);
                        setCiudad(""); // Resetear ciudad al cambiar provincia
                    }}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "var(--border-radius)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        fontSize: "1rem",
                        outline: "none",
                        cursor: "pointer"
                    }}
                >
                    <option value="" style={{ color: "#333" }}>Selecciona una provincia</option>
                    {provincias.map(p => (
                        <option key={p} value={p} style={{ color: "#333" }}>{p}</option>
                    ))}
                </select>
            </div>

            <div style={{ position: "relative" }}>
                <Input
                    type="text"
                    placeholder={provincia ? "Escribe tu ciudad..." : "Primero selecciona una provincia"}
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    disabled={!provincia}
                    icon={<span>🏙️</span>}
                    onFocus={() => ciudad && setSugerencias(s => s) && setShowSuggestions(true)}
                />

                {showSuggestions && sugerencias.length > 0 && (
                    <ul style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#1E1E1E",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        margin: "0.25rem 0 0 0",
                        listStyle: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 10
                    }}>
                        {sugerencias.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => handleSelectCity(s)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    cursor: "pointer",
                                    borderRadius: "4px",
                                    transition: "background 0.2s",
                                    color: "white"
                                }}
                                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                                onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                    <Button
                        type="button"
                        onClick={handleDetectLocation}
                        variant="secondary"
                        disabled={isLoadingGeo}
                        icon={<span>🧭</span>}
                    >
                        {isLoadingGeo ? "Detectando..." : "Usar mi ubicación actual"}
                    </Button>
                </div>
            </div>

            {geoError && (
                <span className="fade-in" style={{ color: "#FF4B4B", fontSize: "0.9rem", textAlign: "center" }}>
                    {geoError}
                </span>
            )}
        </div>
    );
};

export default LocationSelector;
