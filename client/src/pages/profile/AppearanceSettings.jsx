import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/Layout/BaseLayout";
import Button from "../../components/UI/Button";
import { ArrowLeft } from "lucide-react";
import "./AppearanceSettings.css";

const AppearanceSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'system', // 'light' | 'dark' | 'system'
    compactMode: false,
    fontSize: 'medium'
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('appearanceSettings');
      if (stored) setSettings(JSON.parse(stored));
    } catch (e) { }
  }, []);

  const setValue = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem('appearanceSettings', JSON.stringify(settings));
    } catch (e) { console.error('Error saving appearance settings', e); }
  }, [settings]);

  return (
    <BaseLayout showTabs={false} maxWidth="mobile" title="Apariencia" backPath="/settings">
      <div className="appearance-page">
        <div className="appearance-section">
          <h3>Tema</h3>
          <div className="appearance-item">
            <div className="label">Preferencia de tema</div>
            <div className="control">
              <select value={settings.theme} onChange={(e) => setValue('theme', e.target.value)}>
                <option value="system">Por sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </select>
            </div>
          </div>

          <div className="appearance-item">
            <div className="label">Modo compacto</div>
            <div className="control">
              <input type="checkbox" checked={settings.compactMode} onChange={() => setValue('compactMode', !settings.compactMode)} />
            </div>
          </div>

          <div className="appearance-item">
            <div className="label">Tamaño de fuente</div>
            <div className="control">
              <select value={settings.fontSize} onChange={(e) => setValue('fontSize', e.target.value)}>
                <option value="small">Pequeña</option>
                <option value="medium">Media</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <Button variant="secondary" onClick={() => navigate('/settings')} style={{marginLeft:8}}>
              <ArrowLeft size={16} /> Volver
            </Button>
            <Button onClick={save}>Guardar (UI)</Button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AppearanceSettings;
