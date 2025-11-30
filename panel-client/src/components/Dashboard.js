import { signOut } from '../services/auth';

export const createDashboard = (user, onNavigate) => {
  return `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-logo" style="color: #667eea;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h1 class="header-title">Panel de Control</h1>
          </div>
          
          <div class="header-right">
            <div class="user-info">
              <img src="${user.photoURL || '/vite.svg'}" alt="${user.displayName}" class="user-avatar" />
              <div class="user-details">
                <span class="user-name">${user.displayName || 'Usuario'}</span>
                <span class="user-email">${user.email}</span>
              </div>
            </div>
            <button id="logout-btn" class="logout-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Salir
            </button>
          </div>
        </div>
      </header>
      
      <main class="dashboard-main">
        <div class="welcome-section">
          <h2>¡Bienvenida, ${user.displayName?.split(' ')[0] || 'Usuario'}! ✨</h2>
          <p>Has iniciado sesión correctamente con Firebase Authentication</p>
        </div>
        
        <div class="dashboard-grid">
          <div class="dashboard-card" data-navigate="users">
            <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Gestión de Usuarios</h3>
            <p>Ver y administrar todos los usuarios registrados</p>
          </div>
          
          <div class="dashboard-card" data-navigate="stats">
            <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </div>
            <h3>Estadísticas</h3>
            <p>Métricas y análisis del sistema</p>
          </div>
          
          <div class="dashboard-card" data-navigate="moderation">
            <div class="card-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h3>Moderación</h3>
            <p>Gestiona reportes y usuarios suspendidos</p>
          </div>
          
          <div class="dashboard-card" data-navigate="verification">
            <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3>Verificación</h3>
            <p>Aprueba solicitudes de verificación</p>
          </div>
          
          <div class="dashboard-card" data-navigate="security">
            <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>Auditoría de Seguridad</h3>
            <p>Verifica los permisos y reglas de acceso a datos</p>
          </div>
        </div>
        
        <div class="info-panel">
          <h3>🔥 Información de Firebase</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">UID:</span>
              <code class="info-value">${user.uid}</code>
            </div>
            <div class="info-item">
              <span class="info-label">Email Verificado:</span>
              <span class="info-value">${user.emailVerified ? '✅ Sí' : '❌ No'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Proveedor:</span>
              <span class="info-value">Google</span>
            </div>
            <div class="info-item">
              <span class="info-label">Última Conexión:</span>
              <span class="info-value">${new Date(user.metadata.lastSignInTime).toLocaleString('es-ES')}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
};

export const attachDashboardListeners = (onNavigate) => {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = `
          <span class="spinner"></span>
          Cerrando sesión...
        `;

        await signOut();
        // El cambio de estado será manejado por onAuthChange en main.js

      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        logoutBtn.disabled = false;
        logoutBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Salir
        `;
      }
    });
  }

  // Navegación a diferentes vistas
  const navigationCards = document.querySelectorAll('[data-navigate]');
  navigationCards.forEach(card => {
    card.addEventListener('click', () => {
      const view = card.getAttribute('data-navigate');
      window.location.hash = `/${view}`;
    });
  });
};