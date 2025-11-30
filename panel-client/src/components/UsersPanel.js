import { getAllUsers, searchUsers, filterUsers, getUniqueValues } from '../services/userService';
import { getUserById } from '../services/userService';
import { createUserCard, attachUserCardListeners } from './UserCard';
import { createUserDetailModal, attachModalListeners } from './UserDetailModal';

let allUsers = [];
let filteredUsers = [];
let currentFilters = {
  gender: 'all',
  minAge: '',
  maxAge: '',
  country: 'all',
  sexualOrientation: 'all'
};
let searchQuery = '';

export const createUsersPanel = () => {
  return `
    <div class="users-panel-container">
      <!-- Header -->
      <div class="users-panel-header">
        <div class="header-row">
          <div class="header-left">
            <button id="back-to-dashboard" class="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <h1>Gestión de Usuarios</h1>
          </div>
          
          <!-- Barra de Búsqueda y Toggle Filtros -->
          <div class="search-section">
            <div class="search-bar">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                id="user-search" 
                placeholder="Buscar por nombre o biografía..."
                autocomplete="off"
              />
            </div>
            
            <button id="toggle-filters" class="advanced-search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filtros
            </button>
          </div>
        </div>
        
        <!-- Filtros (Ocultos por defecto) -->
        <div class="filters-container" id="filters-container" style="display: none;">
          <div class="filter-group">
            <label for="filter-gender">Género:</label>
            <select id="filter-gender">
              <option value="all">Todos</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="filter-min-age">Edad mín:</label>
            <input type="number" id="filter-min-age" placeholder="18" min="18" max="100" />
          </div>
          
          <div class="filter-group">
            <label for="filter-max-age">Edad máx:</label>
            <input type="number" id="filter-max-age" placeholder="99" min="18" max="100" />
          </div>
          
          <div class="filter-group">
            <label for="filter-country">País:</label>
            <select id="filter-country">
              <option value="all">Todos</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="filter-orientation">Orientación:</label>
            <select id="filter-orientation">
              <option value="all">Todas</option>
            </select>
          </div>
          
          <button id="clear-filters" class="clear-filters-btn">
            Limpiar filtros
          </button>
        </div>
        
        <!-- Contador de resultados -->
        <div class="results-counter">
          <span id="results-count">Cargando usuarios...</span>
        </div>
      </div>
      
      <!-- Grid de Usuarios -->
      <div class="users-grid" id="users-grid">
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    </div>
  `;
};

export const attachUsersPanelListeners = (onBackClick) => {
  const backBtn = document.getElementById('back-to-dashboard');
  const searchInput = document.getElementById('user-search');
  const toggleFiltersBtn = document.getElementById('toggle-filters');
  const filtersContainer = document.getElementById('filters-container');
  const genderFilter = document.getElementById('filter-gender');
  const minAgeFilter = document.getElementById('filter-min-age');
  const maxAgeFilter = document.getElementById('filter-max-age');
  const countryFilter = document.getElementById('filter-country');
  const orientationFilter = document.getElementById('filter-orientation');
  const clearFiltersBtn = document.getElementById('clear-filters');

  // Volver al dashboard
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.hash = '/dashboard';
    });
  }

  // Toggle filtros
  if (toggleFiltersBtn && filtersContainer) {
    toggleFiltersBtn.addEventListener('click', () => {
      const isHidden = filtersContainer.style.display === 'none';
      filtersContainer.style.display = isHidden ? 'flex' : 'none';
      toggleFiltersBtn.classList.toggle('active', isHidden);
    });
  }

  // Cargar usuarios
  loadUsers();

  // Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFiltersAndSearch();
    });
  }

  // Filtros
  if (genderFilter) {
    genderFilter.addEventListener('change', (e) => {
      currentFilters.gender = e.target.value;
      applyFiltersAndSearch();
    });
  }

  if (minAgeFilter) {
    minAgeFilter.addEventListener('input', (e) => {
      currentFilters.minAge = e.target.value;
      applyFiltersAndSearch();
    });
  }

  if (maxAgeFilter) {
    maxAgeFilter.addEventListener('input', (e) => {
      currentFilters.maxAge = e.target.value;
      applyFiltersAndSearch();
    });
  }

  if (countryFilter) {
    countryFilter.addEventListener('change', (e) => {
      currentFilters.country = e.target.value;
      applyFiltersAndSearch();
    });
  }

  if (orientationFilter) {
    orientationFilter.addEventListener('change', (e) => {
      currentFilters.sexualOrientation = e.target.value;
      applyFiltersAndSearch();
    });
  }

  // Limpiar filtros
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      currentFilters = {
        gender: 'all',
        minAge: '',
        maxAge: '',
        country: 'all',
        sexualOrientation: 'all'
      };
      searchQuery = '';

      searchInput.value = '';
      genderFilter.value = 'all';
      minAgeFilter.value = '';
      maxAgeFilter.value = '';
      countryFilter.value = 'all';
      orientationFilter.value = 'all';

      applyFiltersAndSearch();
    });
  }
};

const loadUsers = async () => {
  const gridContainer = document.getElementById('users-grid');

  try {
    allUsers = await getAllUsers(200);
    filteredUsers = [...allUsers];

    // Poblar filtros con valores únicos
    populateFilters();

    // Renderizar usuarios
    renderUsers();

  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    gridContainer.innerHTML = `
      <div class="error-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Error al cargar usuarios</h3>
        <p>${error.message}</p>
        <p class="error-hint">Verifica que Firebase esté configurado correctamente</p>
      </div>
    `;
  }
};

const populateFilters = () => {
  const genderFilter = document.getElementById('filter-gender');
  const countryFilter = document.getElementById('filter-country');
  const orientationFilter = document.getElementById('filter-orientation');

  // Géneros únicos
  const genders = getUniqueValues(allUsers, 'gender');
  genders.forEach(gender => {
    const option = document.createElement('option');
    option.value = gender;
    option.textContent = gender;
    genderFilter.appendChild(option);
  });

  // Países únicos
  const countries = getUniqueValues(allUsers, 'location.country');
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countryFilter.appendChild(option);
  });

  // Orientaciones únicas
  const orientations = getUniqueValues(allUsers, 'sexualOrientation');
  orientations.forEach(orientation => {
    const option = document.createElement('option');
    option.value = orientation;
    option.textContent = orientation;
    orientationFilter.appendChild(option);
  });
};

const applyFiltersAndSearch = () => {
  // Primero aplicar filtros
  filteredUsers = filterUsers(currentFilters, allUsers);

  // Luego aplicar búsqueda
  filteredUsers = searchUsers(searchQuery, filteredUsers);

  // Renderizar
  renderUsers();
};

const renderUsers = () => {
  const gridContainer = document.getElementById('users-grid');
  const resultsCount = document.getElementById('results-count');

  // Actualizar contador
  resultsCount.textContent = `${filteredUsers.length} usuario${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`;

  if (filteredUsers.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <h3>No se encontraron usuarios</h3>
        <p>Intenta ajustar los filtros o la búsqueda</p>
      </div>
    `;
    return;
  }

  // Renderizar tarjetas
  gridContainer.innerHTML = filteredUsers.map(user => createUserCard(user)).join('');

  // Adjuntar listeners
  attachUserCardListeners(handleUserClick);
};

const handleUserClick = async (userId) => {
  try {
    const user = await getUserById(userId);

    // Crear y mostrar modal
    const modalHTML = createUserDetailModal(user);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adjuntar listeners del modal
    attachModalListeners();

  } catch (error) {
    console.error('Error al cargar detalles del usuario:', error);
    alert('Error al cargar los detalles del usuario');
  }
};
