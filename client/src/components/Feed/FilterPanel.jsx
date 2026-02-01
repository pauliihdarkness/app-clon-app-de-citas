import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import genderDataRaw from "../../assets/data/gender-identities.json";
import { Calendar, Users, SlidersHorizontal, X, Check } from "lucide-react";
import './FilterPanel.css';

// Componente Dual Range Slider
const DualRangeSlider = ({ min, max, valueMin, valueMax, onChangeMin, onChangeMax }) => {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null); // 'min' | 'max' | null
  const draggingRef = useRef(null);

  const getPercentage = (value) => ((value - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback((clientX) => {
    if (!sliderRef.current) return min;
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + percentage * (max - min));
  }, [min, max]);

  const handleStart = (e, type) => {
    draggingRef.current = type;
    setIsDragging(type);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTrackClick = useCallback((e) => {
    // No hacer nada si el click fue en un thumb
    if (e.target.closest('.dual-range-slider-thumb')) return;
    if (draggingRef.current || isDragging) return; // No hacer nada si ya estamos arrastrando

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (!clientX) return;

    const clickedValue = getValueFromPosition(clientX);
    const minDistance = Math.abs(clickedValue - valueMin);
    const maxDistance = Math.abs(clickedValue - valueMax);

    if (minDistance < maxDistance) {
      // Mover el handle mínimo
      const clampedValue = Math.min(clickedValue, valueMax);
      onChangeMin(clampedValue);
    } else {
      // Mover el handle máximo
      const clampedValue = Math.max(clickedValue, valueMin);
      onChangeMax(clampedValue);
    }
  }, [getValueFromPosition, valueMin, valueMax, onChangeMin, onChangeMax, isDragging]);

  const handleMove = useCallback((e) => {
    const dragType = draggingRef.current;
    if (!dragType || !sliderRef.current) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const newValue = getValueFromPosition(clientX);

    if (dragType === 'min') {
      const clampedValue = Math.min(newValue, valueMax);
      onChangeMin(clampedValue);
    } else {
      const clampedValue = Math.max(newValue, valueMin);
      onChangeMax(clampedValue);
    }
  }, [getValueFromPosition, valueMin, valueMax, onChangeMin, onChangeMax]);

  const handleEnd = useCallback(() => {
    draggingRef.current = null;
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  const minPercent = getPercentage(valueMin);
  const maxPercent = getPercentage(valueMax);

  return (
    <div className="dual-range-slider-container">
      <div
        className="dual-range-slider-track"
        ref={sliderRef}
        onClick={handleTrackClick}
        onTouchStart={handleTrackClick}
      >
        {/* Track background */}
        <div className="dual-range-slider-track-bg" />

        {/* Active range (between min and max) */}
        <div
          className="dual-range-slider-active"
          style={{
            '--min-percent': `${minPercent}%`,
            '--max-percent': `${maxPercent}%`,
            '--range-width': `${maxPercent - minPercent}%`
          }}
        />

        {/* Min thumb */}
        <div
          className={`dual-range-slider-thumb ${isDragging === 'min' ? 'dragging' : ''}`}
          style={{ '--thumb-position': `${minPercent}%` }}
          onMouseDown={(e) => handleStart(e, 'min')}
          onTouchStart={(e) => handleStart(e, 'min')}
        >
          <div className="thumb-value">{valueMin}</div>
        </div>

        {/* Max thumb */}
        <div
          className={`dual-range-slider-thumb ${isDragging === 'max' ? 'dragging' : ''}`}
          style={{ '--thumb-position': `${maxPercent}%` }}
          onMouseDown={(e) => handleStart(e, 'max')}
          onTouchStart={(e) => handleStart(e, 'max')}
        >
          <div className="thumb-value">{valueMax}</div>
        </div>
      </div>
    </div>
  );
};

export default function FilterPanel({ initialFilters = {}, onApply, onCancel }) {
  // Asegurar que initialFilters no sea null o undefined
  const safeFilters = useMemo(() => initialFilters || {}, [initialFilters]);

  const [ageMin, setAgeMin] = useState(safeFilters.ageMin || 18);
  const [ageMax, setAgeMax] = useState(safeFilters.ageMax || 60);
  const DEFAULT_DISTANCE = 50; // km
  const [distance, setDistance] = useState(safeFilters.distance || DEFAULT_DISTANCE);
  const genderData = genderDataRaw.identidades_genero || [];
  const [genders, setGenders] = useState(safeFilters.genders || []);
  const [interests, setInterests] = useState(safeFilters.interests || []);

  const initialKeyRef = useRef(JSON.stringify(safeFilters));
  useEffect(() => {
    const key = JSON.stringify(safeFilters);
    if (key !== initialKeyRef.current) {
      initialKeyRef.current = key;
      const t = setTimeout(() => {
        setAgeMin(safeFilters.ageMin || 18);
        setAgeMax(safeFilters.ageMax || 60);
        setGenders(safeFilters.genders || []);
        setInterests(safeFilters.interests || []);
        setDistance(safeFilters.distance || DEFAULT_DISTANCE);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [safeFilters]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (ageMin !== 18 || ageMax !== 60) count++;
    if (genders.length > 0) count++;
    if (interests.length > 0) count++;
    if (distance !== DEFAULT_DISTANCE) count++;
    return count;
  }, [ageMin, ageMax, genders.length, interests.length, distance]);

  // Verificar si hay cambios desde los filtros iniciales
  const hasChanges = useMemo(() => {
    const initial = safeFilters;
    return (
      (initial.ageMin || 18) !== ageMin ||
      (initial.ageMax || 60) !== ageMax ||
      JSON.stringify(initial.genders || []) !== JSON.stringify(genders) ||
      JSON.stringify(initial.interests || []) !== JSON.stringify(interests) ||
      (initial.distance || DEFAULT_DISTANCE) !== distance
    );
  }, [ageMin, ageMax, genders, interests, safeFilters]);

  const handleApply = () => {
    onApply({ ageMin, ageMax, genders, interests, distance });
  };

  const handleClear = () => {
    setAgeMin(18);
    setAgeMax(60);
    setGenders([]);
    setInterests([]);
    setDistance(DEFAULT_DISTANCE);
  };

  const handleGenderToggle = (gender) => {
    setGenders(prev => {
      if (prev.includes(gender)) {
        return prev.filter(x => x !== gender);
      } else {
        return [...prev, gender];
      }
    });
  };

  // Validar que ageMin no sea mayor que ageMax
  const isAgeRangeValid = ageMin <= ageMax;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-title-section">
          <SlidersHorizontal size={24} className="filter-icon" />
          <div>
            <h3>Filtros</h3>
            <p className="filter-subtitle">Ajusta tu búsqueda</p>
          </div>
        </div>
      </div>

      {/* Rango de Edad con Slider Dual */}
      <div className="filter-section">
        <div className="section-header">
          <Calendar size={20} />
          <label className="section-label">Rango de Edad</label>
        </div>
        <div className="age-range-container">
          {/* Display compacto del rango */}
          <div className="age-display-compact">
            <span className="age-value">{ageMin}</span>
            <span className="age-separator">-</span>
            <span className="age-value">{ageMax}</span>
            <span className="age-unit">años</span>
          </div>

          {/* Dual Range Slider */}
          <DualRangeSlider
            min={18}
            max={99}
            valueMin={ageMin}
            valueMax={ageMax}
            onChangeMin={(val) => setAgeMin(Math.min(val, ageMax))}
            onChangeMax={(val) => setAgeMax(Math.max(val, ageMin))}
          />

          {!isAgeRangeValid && (
            <p className="age-warning">⚠️ La edad mínima debe ser menor o igual a la máxima</p>
          )}
        </div>
      </div>

      {/* Géneros con chips interactivos */}
      <div className="filter-section">
        <div className="section-header">
          <Users size={20} />
          <label className="section-label">Géneros que te interesan</label>
          {genders.length > 0 && (
            <span className="section-count">({genders.length} seleccionado{genders.length !== 1 ? 's' : ''})</span>
          )}
        </div>
        <div className="gender-chips">
          {genderData.map(gender => {
            const isSelected = genders.includes(gender);
            return (
              <button
                key={gender}
                type="button"
                className={`gender-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => handleGenderToggle(gender)}
                aria-pressed={isSelected}
              >
                {isSelected && <Check size={16} />}
                <span>{gender}</span>
              </button>
            );
          })}
        </div>
        {genders.length === 0 && (
          <p className="filter-hint">💡 Selecciona al menos un género para ver resultados</p>
        )}
      </div>

      {/* Nota: la lista de géneros ya se muestra como chips interactivos arriba. */}

      {/* Cercanía */}
      <div className="filter-section">
        <div className="section-header">
          <Calendar size={20} />
          <label className="section-label">Cercanía</label>
          <span className="section-count">{distance} km</span>
        </div>
        <div className="proximity-container" style={{ ['--pct']: `${((distance - 1) / (200 - 1)) * 100}%` }}>
          <div className="proximity-controls">
            <input
              type="range"
              min={1}
              max={200}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="proximity-range"
              aria-label="Distancia máxima"
            />

            <div className="proximity-side">
              <input
                type="number"
                min={1}
                max={200}
                value={distance}
                onChange={(e) => {
                  const v = Number(e.target.value) || 1;
                  setDistance(Math.min(200, Math.max(1, Math.round(v))));
                }}
                className="proximity-number"
                aria-label="Distancia en kilómetros"
              />
            </div>
          </div>

          <div className="proximity-presets" role="list">
            {[5, 25, 50, 100].map(p => (
              <button
                key={p}
                type="button"
                className={`preset ${distance === p ? 'active' : ''}`}
                onClick={() => setDistance(p)}
                aria-pressed={distance === p}
              >
                {p} km
              </button>
            ))}
          </div>

          <div className="proximity-values">
            <span>1 km</span>
            <span className="proximity-current">{distance} km</span>
            <span>200 km</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="filter-actions">
        <button
          onClick={handleClear}
          className="btn btn-clear"
          disabled={activeFiltersCount === 0}
        >
          <X size={18} />
          Limpiar todo
        </button>
        <div className="action-buttons">
          <button onClick={onCancel} className="btn btn-cancel">
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="btn btn-apply"
            disabled={!isAgeRangeValid || !hasChanges}
          >
            <Check size={18} />
            Aplicar preferencias
          </button>
        </div>
      </div>
    </div>
  );
}