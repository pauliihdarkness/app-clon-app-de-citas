import React, { useState, useEffect, useMemo } from 'react';
import Input from "../UI/Input";
import Button from "../UI/Button";
import localizations from "../../assets/data/Localizations-AR.json";
import { getInitialLocation } from "../../utils/geolocation";
import "../../assets/styles/global.css";

import { Building2, Compass } from "lucide-react";
import "./LocationSelector.css";

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
        <div className="location-selector-container">

            <div className="location-field">
                <label className="location-label">Provincia</label>
                <select
                    value={provincia}
                    onChange={e => {
                        setProvincia(e.target.value);
                        setCiudad(""); // Resetear ciudad al cambiar provincia
                    }}
                    className="location-select"
                >
                    <option value="">Selecciona una provincia</option>
                    {provincias.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            <div className="city-input-wrapper">
                <Input
                    type="text"
                    placeholder={provincia ? "Escribe tu ciudad..." : "Primero selecciona una provincia"}
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    disabled={!provincia}
                    icon={<Building2 size={18} />}
                    onFocus={() => ciudad && setSugerencias(s => s) && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay para permitir click
                />

                {showSuggestions && sugerencias.length > 0 && (
                    <ul className="suggestions-list">
                        {sugerencias.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => handleSelectCity(s)}
                                className="suggestion-item"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="geo-button-wrapper">
                <div style={{ flex: 1 }}>
                    <Button
                        type="button"
                        onClick={handleDetectLocation}
                        variant="secondary"
                        disabled={isLoadingGeo}
                        icon={<Compass size={18} />}
                    >
                        {isLoadingGeo ? "Detectando..." : "Usar mi ubicación actual"}
                    </Button>
                </div>
            </div>

            <p className="location-privacy-note">
                Nota: La ubicación obtenida es aproximada (relativa) y no se guarda tu geolocalización exacta.
                No se actualizará automáticamente a menos que vuelvas a pulsar el botón.
            </p>

            {geoError && (
                <span className="geo-error">
                    {geoError}
                </span>
            )}
        </div>
    );
};

export default LocationSelector;

