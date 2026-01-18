import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

export default function FilterPanel({ initialFilters = {}, onApply, onCancel }) {
  const [ageMin, setAgeMin] = useState(initialFilters.ageMin || 18);
  const [ageMax, setAgeMax] = useState(initialFilters.ageMax || 60);
  const [gender, setGender] = useState(initialFilters.gender || 'any');
  const [hasPhoto, setHasPhoto] = useState(!!initialFilters.hasPhoto);
  const [interests, setInterests] = useState(initialFilters.interests || []);

  useEffect(() => {
    // sync initialFilters if they change externally
    setAgeMin(initialFilters.ageMin || 18);
    setAgeMax(initialFilters.ageMax || 60);
    setGender(initialFilters.gender || 'any');
    setHasPhoto(!!initialFilters.hasPhoto);
    setInterests(initialFilters.interests || []);
  }, [initialFilters]);

  const handleApply = () => {
    onApply({ ageMin, ageMax, gender, hasPhoto, interests });
  };

  const handleClear = () => {
    setAgeMin(18);
    setAgeMax(60);
    setGender('any');
    setHasPhoto(false);
    setInterests([]);
    onApply({});
  };

  return (
    <div className="filter-panel">
      <h3>Filtros</h3>
      <div className="row">
        <label>Edad</label>
        <div>
          <input type="number" value={ageMin} min={18} max={100} onChange={e => setAgeMin(Number(e.target.value))} />
          {' - '}
          <input type="number" value={ageMax} min={18} max={100} onChange={e => setAgeMax(Number(e.target.value))} />
        </div>
      </div>

      <div className="row">
        <label>Género</label>
        <select value={gender} onChange={e => setGender(e.target.value)}>
          <option value="any">Cualquiera</option>
          <option value="female">Femenino</option>
          <option value="male">Masculino</option>
          <option value="nonbinary">No binario</option>
        </select>
      </div>

      <div className="row">
        <label>Con foto</label>
        <input type="checkbox" checked={hasPhoto} onChange={e => setHasPhoto(e.target.checked)} />
      </div>

      <div className="actions">
        <button onClick={handleClear} className="btn secondary">Limpiar</button>
        <button onClick={onCancel} className="btn">Cancelar</button>
        <button onClick={handleApply} className="btn primary">Aplicar</button>
      </div>
    </div>
  );
}
