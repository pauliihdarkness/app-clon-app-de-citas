import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/Layout/BaseLayout";
import Button from "../../components/UI/Button";
import { ArrowLeft } from "lucide-react";
import "./NotificationsSettings.css";

const NotificationsSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    sound: true,
    previewMessages: false,
    doNotDisturb: false
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('notificationSettings');
      if (stored) setSettings(JSON.parse(stored));
    } catch (e) { }
  }, []);

  const toggle = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving notification settings', e);
    }
  }, [settings]);

  return (
    <BaseLayout showTabs={false} maxWidth="mobile" title="Notificaciones" backPath="/settings">
      <div className="notifications-page">
        <div className="notifications-section">
          <h3>Preferencias</h3>
          <div className="notif-item">
            <div className="label">Notificaciones Push</div>
            <div className="control">
              <input type="checkbox" checked={settings.pushNotifications} onChange={() => toggle('pushNotifications')} />
            </div>
          </div>

          <div className="notif-item">
            <div className="label">Notificaciones por Email</div>
            <div className="control">
              <input type="checkbox" checked={settings.emailNotifications} onChange={() => toggle('emailNotifications')} />
            </div>
          </div>

          <div className="notif-item">
            <div className="label">Reproducir sonido</div>
            <div className="control">
              <input type="checkbox" checked={settings.sound} onChange={() => toggle('sound')} />
            </div>
          </div>

          <div className="notif-item">
            <div className="label">Mostrar vista previa de mensajes</div>
            <div className="control">
              <input type="checkbox" checked={settings.previewMessages} onChange={() => toggle('previewMessages')} />
            </div>
          </div>

          <div className="notif-item">
            <div className="label">Modo No Molestar</div>
            <div className="control">
              <input type="checkbox" checked={settings.doNotDisturb} onChange={() => toggle('doNotDisturb')} />
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

export default NotificationsSettings;
