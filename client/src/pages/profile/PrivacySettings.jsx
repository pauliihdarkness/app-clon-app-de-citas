import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/Layout/BaseLayout";
import Button from "../../components/UI/Button";
import { ArrowLeft } from "lucide-react";
import "./PrivacySettings.css";

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    showApproxLocation: true,
    shareExactLocation: false,
    allowUseForProximity: true
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('privacySettings');
      if (stored) setSettings(JSON.parse(stored));
    } catch (e) {
      // ignore
    }
  }, []);

  const toggle = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem('privacySettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving privacy settings', e);
    }
  }, [settings]);

  return (
    <BaseLayout showTabs={false} maxWidth="mobile" title="Privacidad y Seguridad" backPath="/settings">
      <div className="privacy-page">
        <div className="privacy-section">
          <h3>Datos de ubicación</h3>
          <div className="privacy-item">
            <div className="label">Mostrar ubicación aproximada</div>
            <div className="control">
              <label className="toggle">
                <input type="checkbox" checked={settings.showApproxLocation} onChange={() => toggle('showApproxLocation')} />
                <span>{settings.showApproxLocation ? 'Visible' : 'Oculta'}</span>
              </label>
            </div>
          </div>
          <div className="hint">Comparte sólo ciudad/provincia. No compartimos lat/lng exactos sin tu consentimiento.</div>

          <div className="privacy-item">
            <div className="label">Compartir ubicación exacta</div>
            <div className="control">
              <label className="toggle">
                <input type="checkbox" checked={settings.shareExactLocation} onChange={() => toggle('shareExactLocation')} />
                <span>{settings.shareExactLocation ? 'Sí' : 'No'}</span>
              </label>
            </div>
          </div>
          <div className="hint">Requiere consentimiento explícito y configuración adicional (no activa por defecto).</div>

          <div className="privacy-item">
            <div className="label">Usar ubicación para filtrar por 'Cercanía'</div>
            <div className="control">
              <label className="toggle">
                <input type="checkbox" checked={settings.allowUseForProximity} onChange={() => toggle('allowUseForProximity')} />
                <span>{settings.allowUseForProximity ? 'Permitido' : 'No permitido'}</span>
              </label>
            </div>
          </div>
          <div className="hint">Cuando está activo, la app puede usar tu ubicación para mejorar los resultados de cercanía.</div>

          {/* Futuras funciones (UI-only, Próximamente) */}
          <h3 style={{marginTop:16}}>Futuras funciones</h3>
          <div className="upcoming-item">
            <div className="label">Modo Incógnito</div>
            <div className="control">
              <button className="upcoming-btn" disabled>Próximamente</button>
            </div>
          </div>

          <div className="upcoming-item">
            <div className="label">Verificación de Identidad</div>
            <div className="control">
              <button className="upcoming-btn" disabled>Próximamente</button>
            </div>
          </div>

          <div className="upcoming-item">
            <div className="label">Insignia de perfil verificado</div>
            <div className="control">
              <button className="upcoming-btn" disabled>Próximamente</button>
            </div>
          </div>

          <div className="upcoming-item">
            <div className="label">Compartir ubicación por segmentos (avanzado)</div>
            <div className="control">
              <button className="upcoming-btn" disabled>Próximamente</button>
            </div>
          </div>

          <div className="upcoming-item">
            <div className="label">Exportar mis datos (GDPR)</div>
            <div className="control">
              <button className="upcoming-btn" disabled>Próximamente</button>
            </div>
          </div>

          <div className="upcoming-note hint">Estas opciones están planificadas para futuras versiones. Indícanos cuáles quieres prioritarias.</div>

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

export default PrivacySettings;
