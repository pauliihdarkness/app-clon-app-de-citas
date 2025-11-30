import { getPendingReports, getModerationStats, resolveReport, suspendUser, getSuspendedUsers, reactivateUser } from '../services/moderationService';

export const createModerationPanel = () => {
    return `
    <div class="moderation-panel-container">
      <div class="users-panel-header">
        <div class="header-row">
          <div class="header-left">
            <button id="back-to-dashboard-mod" class="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <h1>🛡️ Panel de Moderación</h1>
          </div>
          
          <button id="refresh-mod-btn" class="secondary-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualizar
          </button>
        </div>
        
        <p class="security-intro">
          Gestiona reportes de usuarios y acciones de moderación.
        </p>
      </div>

      <div class="stats-content">
        <div id="mod-loading" class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando datos de moderación...</p>
        </div>
        
        <div id="mod-data" style="display: none;">
          <!-- Los datos se cargarán aquí -->
        </div>
      </div>
    </div>
  `;
};

export const attachModerationPanelListeners = () => {
    const backBtn = document.getElementById('back-to-dashboard-mod');
    const refreshBtn = document.getElementById('refresh-mod-btn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.hash = '/dashboard';
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadModerationData();
        });
    }

    loadModerationData();
};

const loadModerationData = async () => {
    const loadingDiv = document.getElementById('mod-loading');
    const dataDiv = document.getElementById('mod-data');

    try {
        loadingDiv.style.display = 'flex';
        dataDiv.style.display = 'none';

        const [stats, pendingReports, suspendedUsers] = await Promise.all([
            getModerationStats(),
            getPendingReports(),
            getSuspendedUsers()
        ]);

        renderModerationData(stats, pendingReports, suspendedUsers, dataDiv);

        loadingDiv.style.display = 'none';
        dataDiv.style.display = 'block';

        attachReportActions();
    } catch (error) {
        console.error('Error loading moderation data:', error);
        loadingDiv.innerHTML = `
            <div class="error-state">
                <h3>Error al cargar datos</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
};

const renderModerationData = (stats, reports, suspended, container) => {
    const html = `
        <!-- Estadísticas -->
        <div class="stats-grid">
            <div class="stat-card stat-card-warning">
                <div class="stat-icon">⚠️</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.pendingReports}</div>
                    <div class="stat-label">Reportes Pendientes</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-success">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.resolvedToday}</div>
                    <div class="stat-label">Resueltos Hoy</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-danger">
                <div class="stat-icon">🚫</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.suspendedUsers}</div>
                    <div class="stat-label">Usuarios Suspendidos</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-info">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.totalReports}</div>
                    <div class="stat-label">Total Reportes</div>
                </div>
            </div>
        </div>

        <!-- Reportes Pendientes -->
        <div class="stats-section">
            <h2>📋 Reportes Pendientes</h2>
            ${reports.length === 0 ? `
                <div class="empty-state-small">
                    <p>✅ No hay reportes pendientes</p>
                </div>
            ` : `
                <div class="reports-list">
                    ${reports.map(report => `
                        <div class="report-card" data-report-id="${report.id}">
                            <div class="report-header">
                                <div class="report-users">
                                    <div class="report-user">
                                        <img src="${report.reportedUser?.images?.[0] || '/vite.svg'}" alt="${report.reportedUser?.name || 'Usuario'}">
                                        <div>
                                            <strong>${report.reportedUser?.name || 'Usuario desconocido'}</strong>
                                            <span class="report-label">Reportado</span>
                                        </div>
                                    </div>
                                    <div class="report-arrow">→</div>
                                    <div class="report-user">
                                        <div>
                                            <strong>${report.reporter?.name || 'Usuario desconocido'}</strong>
                                            <span class="report-label">Reportó</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="report-date">
                                    ${report.createdAt ? new Date(report.createdAt.toDate()).toLocaleDateString('es-ES') : 'Fecha desconocida'}
                                </div>
                            </div>
                            <div class="report-content">
                                <div class="report-category">${report.category || 'Sin categoría'}</div>
                                <div class="report-reason">${report.reason || 'Sin descripción'}</div>
                            </div>
                            <div class="report-actions">
                                <button class="action-btn action-btn-dismiss" data-action="dismiss">
                                    Descartar
                                </button>
                                <button class="action-btn action-btn-warn" data-action="warning">
                                    Advertencia
                                </button>
                                <button class="action-btn action-btn-suspend" data-action="suspend">
                                    Suspender Usuario
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>

        <!-- Usuarios Suspendidos -->
        <div class="stats-section">
            <h2>🚫 Usuarios Suspendidos</h2>
            ${suspended.length === 0 ? `
                <div class="empty-state-small">
                    <p>No hay usuarios suspendidos</p>
                </div>
            ` : `
                <div class="suspended-list">
                    ${suspended.map(user => `
                        <div class="suspended-card" data-user-id="${user.id}">
                            <img src="${user.images?.[0] || '/vite.svg'}" alt="${user.name}">
                            <div class="suspended-info">
                                <strong>${user.name}</strong>
                                <span>${user.suspensionReason || 'Sin razón especificada'}</span>
                                <small>Suspendido: ${user.suspendedAt ? new Date(user.suspendedAt.toDate()).toLocaleDateString('es-ES') : 'Fecha desconocida'}</small>
                            </div>
                            <button class="action-btn action-btn-reactivate" data-action="reactivate">
                                Reactivar
                            </button>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;

    container.innerHTML = html;
};

const attachReportActions = () => {
    // Acciones de reportes
    document.querySelectorAll('.report-card').forEach(card => {
        const reportId = card.dataset.reportId;

        card.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;

                if (confirm(`¿Estás seguro de realizar esta acción?`)) {
                    try {
                        btn.disabled = true;
                        btn.textContent = 'Procesando...';

                        if (action === 'suspend') {
                            const report = await getPendingReports().then(r => r.find(rep => rep.id === reportId));
                            if (report && report.reportedUserId) {
                                await suspendUser(report.reportedUserId, report.reason || 'Violación de términos', 7);
                            }
                        }

                        await resolveReport(reportId, action);

                        // Recargar datos
                        loadModerationData();
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Error al procesar la acción');
                        btn.disabled = false;
                    }
                }
            });
        });
    });

    // Acciones de reactivación
    document.querySelectorAll('.suspended-card .action-btn-reactivate').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const card = e.target.closest('.suspended-card');
            const userId = card.dataset.userId;

            if (confirm('¿Reactivar este usuario?')) {
                try {
                    btn.disabled = true;
                    btn.textContent = 'Procesando...';

                    await reactivateUser(userId);
                    loadModerationData();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al reactivar usuario');
                    btn.disabled = false;
                }
            }
        });
    });
};
