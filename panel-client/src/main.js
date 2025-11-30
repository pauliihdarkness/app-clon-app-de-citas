import './style.css';
import { onAuthChange } from './services/auth';
import { createLoginPage, attachLoginListeners } from './components/LoginPage';
import { createDashboard, attachDashboardListeners } from './components/Dashboard';
import { createUsersPanel, attachUsersPanelListeners } from './components/UsersPanel';
import { createSecurityPanel, attachSecurityPanelListeners } from './components/SecurityPanel';
import { createStatsPanel, attachStatsPanelListeners } from './components/StatsPanel';
import { createModerationPanel, attachModerationPanelListeners } from './components/ModerationPanel';
import { createVerificationPanel, attachVerificationPanelListeners } from './components/VerificationPanel';


const app = document.querySelector('#app');
let currentUser = null;

// Mostrar pantalla de carga inicial
app.innerHTML = `
  <div class="loading-container">
    <div class="spinner-large"></div>
    <p>Cargando...</p>
  </div>
`;

// Sistema de Rutas
const routes = {
  '#/': 'dashboard',
  '#/dashboard': 'dashboard',
  '#/users': 'users',
  '#/security': 'security',
  '#/stats': 'stats',
  '#/moderation': 'moderation',
  '#/verification': 'verification'
};

// Obtener ruta actual o default
const getCurrentRoute = () => {
  const hash = window.location.hash || '#/';
  return routes[hash] || 'dashboard';
};

// Navegar a una ruta
const navigateTo = (path) => {
  window.location.hash = path;
};

// Observar cambios en el estado de autenticación
onAuthChange((user) => {
  currentUser = user;

  if (user) {
    // Usuario autenticado - renderizar ruta actual
    handleRoute();
  } else {
    // Usuario no autenticado - mostrar login
    app.innerHTML = createLoginPage();
    attachLoginListeners();
    // Limpiar hash si es necesario o redirigir a login
    if (window.location.hash !== '#/') {
      window.history.replaceState(null, null, ' ');
    }
  }
});

// Manejar cambios de ruta
function handleRoute() {
  if (!currentUser) return;

  const view = getCurrentRoute();

  if (view === 'dashboard') {
    app.innerHTML = createDashboard(currentUser);
    attachDashboardListeners();
  } else if (view === 'users') {
    app.innerHTML = createUsersPanel();
    attachUsersPanelListeners(() => navigateTo('#/dashboard'));
  } else if (view === 'security') {
    app.innerHTML = createSecurityPanel();
    attachSecurityPanelListeners(() => navigateTo('#/dashboard'), currentUser);
  } else if (view === 'stats') {
    app.innerHTML = createStatsPanel();
    attachStatsPanelListeners(currentUser);
  } else if (view === 'moderation') {
    app.innerHTML = createModerationPanel();
    attachModerationPanelListeners();
  } else if (view === 'verification') {
    app.innerHTML = createVerificationPanel();
    attachVerificationPanelListeners();
  }
}

// Escuchar cambios en el hash
window.addEventListener('hashchange', handleRoute);

// Manejar carga inicial si ya hay usuario (el onAuthChange lo disparará, 
// pero si queremos manejar rutas directas necesitamos esto)
window.addEventListener('load', () => {
  // El onAuthChange se encargará de la renderización inicial
});
