import { getGeneralStats, getUserGrowth, getDemographics, getEngagementMetrics } from '../services/statsService';

export const createStatsPanel = () => {
    return `
    <div class="stats-panel-container">
      <div class="users-panel-header">
        <div class="header-row">
          <div class="header-left">
            <button id="back-to-dashboard-stats" class="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <h1>📊 Estadísticas del Sistema</h1>
          </div>
          
          <button id="refresh-stats-btn" class="secondary-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualizar
          </button>
        </div>
        
        <p class="security-intro">
          Vista general de las métricas y estadísticas del sistema.
        </p>
      </div>

      <div class="stats-content">
        <div id="stats-loading" class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando estadísticas...</p>
        </div>
        
        <div id="stats-data" style="display: none;">
          <!-- Las estadísticas se cargarán aquí -->
        </div>
      </div>
    </div>
  `;
};

export const attachStatsPanelListeners = (currentUser) => {
    const backBtn = document.getElementById('back-to-dashboard-stats');
    const refreshBtn = document.getElementById('refresh-stats-btn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.hash = '/dashboard';
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadStats();
        });
    }

    // Cargar estadísticas al iniciar
    loadStats();
};

const loadStats = async () => {
    const loadingDiv = document.getElementById('stats-loading');
    const dataDiv = document.getElementById('stats-data');

    try {
        loadingDiv.style.display = 'flex';
        dataDiv.style.display = 'none';

        const [generalStats, userGrowth, demographics, engagement] = await Promise.all([
            getGeneralStats(),
            getUserGrowth(6),
            getDemographics(),
            getEngagementMetrics()
        ]);

        renderStats(generalStats, userGrowth, demographics, engagement, dataDiv);

        loadingDiv.style.display = 'none';
        dataDiv.style.display = 'block';
    } catch (error) {
        console.error('Error loading stats:', error);
        loadingDiv.innerHTML = `
            <div class="error-state">
                <h3>Error al cargar estadísticas</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
};

const renderStats = (general, growth, demographics, engagement, container) => {
    const html = `
        <!-- Resumen Ejecutivo -->
        <div class="stats-grid">
            <div class="stat-card stat-card-primary">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <div class="stat-value">${general.totalUsers.toLocaleString()}</div>
                    <div class="stat-label">Total Usuarios</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-success">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <div class="stat-value">${general.activeUsers.toLocaleString()}</div>
                    <div class="stat-label">Activos (7 días)</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-info">
                <div class="stat-icon">🆕</div>
                <div class="stat-content">
                    <div class="stat-value">${general.newUsers.toLocaleString()}</div>
                    <div class="stat-label">Nuevos (30 días)</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-warning">
                <div class="stat-icon">🎖️</div>
                <div class="stat-content">
                    <div class="stat-value">${general.verificationRate}%</div>
                    <div class="stat-label">Tasa Verificación</div>
                </div>
            </div>
        </div>

        <!-- Crecimiento de Usuarios -->
        <div class="stats-section">
            <h2>📈 Crecimiento de Usuarios</h2>
            <div class="chart-container">
                <div class="bar-chart">
                    ${growth.map(item => {
        const maxCount = Math.max(...growth.map(g => g.count));
        const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        return `
                            <div class="bar-item">
                                <div class="bar" style="height: ${height}%">
                                    <span class="bar-value">${item.count}</span>
                                </div>
                                <div class="bar-label">${item.month.split('-')[1]}</div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        </div>

        <!-- Distribución Demográfica -->
        <div class="stats-row">
            <div class="stats-section stats-section-half">
                <h2>👥 Distribución por Género</h2>
                <div class="demographics-list">
                    ${Object.entries(demographics.gender).map(([gender, count]) => {
        const percentage = general.totalUsers > 0 ? Math.round((count / general.totalUsers) * 100) : 0;
        return `
                            <div class="demo-item">
                                <div class="demo-label">${gender}</div>
                                <div class="demo-bar-container">
                                    <div class="demo-bar" style="width: ${percentage}%"></div>
                                </div>
                                <div class="demo-value">${count} (${percentage}%)</div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>

            <div class="stats-section stats-section-half">
                <h2>🎂 Distribución por Edad</h2>
                <div class="demographics-list">
                    ${Object.entries(demographics.ageRanges).map(([range, count]) => {
        const percentage = general.totalUsers > 0 ? Math.round((count / general.totalUsers) * 100) : 0;
        return `
                            <div class="demo-item">
                                <div class="demo-label">${range}</div>
                                <div class="demo-bar-container">
                                    <div class="demo-bar" style="width: ${percentage}%"></div>
                                </div>
                                <div class="demo-value">${count} (${percentage}%)</div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        </div>

        <!-- Top Países -->
        <div class="stats-section">
            <h2>🌍 Top 5 Países</h2>
            <div class="demographics-list">
                ${demographics.topCountries.map((item, index) => {
        const percentage = general.totalUsers > 0 ? Math.round((item.count / general.totalUsers) * 100) : 0;
        return `
                        <div class="demo-item">
                            <div class="demo-label">#${index + 1} ${item.country}</div>
                            <div class="demo-bar-container">
                                <div class="demo-bar" style="width: ${percentage}%"></div>
                            </div>
                            <div class="demo-value">${item.count} (${percentage}%)</div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>

        <!-- Métricas de Engagement -->
        <div class="stats-grid">
            <div class="stat-card stat-card-love">
                <div class="stat-icon">❤️</div>
                <div class="stat-content">
                    <div class="stat-value">${engagement.totalLikes.toLocaleString()}</div>
                    <div class="stat-label">Total Likes</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-match">
                <div class="stat-icon">💕</div>
                <div class="stat-content">
                    <div class="stat-value">${engagement.totalMatches.toLocaleString()}</div>
                    <div class="stat-label">Total Matches</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-chat">
                <div class="stat-icon">💬</div>
                <div class="stat-content">
                    <div class="stat-value">${engagement.activeConversations.toLocaleString()}</div>
                    <div class="stat-label">Conversaciones Activas</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-rate">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${engagement.matchRate}%</div>
                    <div class="stat-label">Tasa de Match</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
};
