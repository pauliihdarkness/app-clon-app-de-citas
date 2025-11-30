import { getPendingVerifications, getVerifiedUsers, getVerificationStats, approveVerification, rejectVerification, revokeVerification } from '../services/verificationService';

export const createVerificationPanel = () => {
    return `
    <div class="verification-panel-container">
      <div class="users-panel-header">
        <div class="header-row">
          <div class="header-left">
            <button id="back-to-dashboard-ver" class="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <h1>✓ Panel de Verificación</h1>
          </div>
          
          <button id="refresh-ver-btn" class="secondary-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualizar
          </button>
        </div>
        
        <p class="security-intro">
          Gestiona solicitudes de verificación de usuarios.
        </p>
      </div>

      <div class="stats-content">
        <div id="ver-loading" class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando solicitudes...</p>
        </div>
        
        <div id="ver-data" style="display: none;">
          <!-- Los datos se cargarán aquí -->
        </div>
      </div>
    </div>
  `;
};

export const attachVerificationPanelListeners = () => {
    const backBtn = document.getElementById('back-to-dashboard-ver');
    const refreshBtn = document.getElementById('refresh-ver-btn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.hash = '/dashboard';
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadVerificationData();
        });
    }

    loadVerificationData();
};

const loadVerificationData = async () => {
    const loadingDiv = document.getElementById('ver-loading');
    const dataDiv = document.getElementById('ver-data');

    try {
        loadingDiv.style.display = 'flex';
        dataDiv.style.display = 'none';

        const [stats, pending, verified] = await Promise.all([
            getVerificationStats(),
            getPendingVerifications(),
            getVerifiedUsers()
        ]);

        renderVerificationData(stats, pending, verified, dataDiv);

        loadingDiv.style.display = 'none';
        dataDiv.style.display = 'block';

        attachVerificationActions();
    } catch (error) {
        console.error('Error loading verification data:', error);
        loadingDiv.innerHTML = `
            <div class="error-state">
                <h3>Error al cargar datos</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
};

const renderVerificationData = (stats, pending, verified, container) => {
    const html = `
        <!-- Estadísticas -->
        <div class="stats-grid">
            <div class="stat-card stat-card-warning">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.pendingCount}</div>
                    <div class="stat-label">Solicitudes Pendientes</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-success">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.verifiedCount}</div>
                    <div class="stat-label">Usuarios Verificados</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-info">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.approvalRate}%</div>
                    <div class="stat-label">Tasa de Aprobación</div>
                </div>
            </div>
            
            <div class="stat-card stat-card-primary">
                <div class="stat-icon">🎖️</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.approvedToday}</div>
                    <div class="stat-label">Aprobados Hoy</div>
                </div>
            </div>
        </div>

        <!-- Cola de Verificación -->
        <div class="stats-section">
            <h2>⏳ Cola de Verificación</h2>
            ${pending.length === 0 ? `
                <div class="empty-state-small">
                    <p>✅ No hay solicitudes pendientes</p>
                </div>
            ` : `
                <div class="verification-queue">
                    ${pending.map(user => `
                        <div class="verification-card" data-user-id="${user.id}">
                            <div class="verification-images">
                                ${(user.images || []).slice(0, 3).map(img => `
                                    <img src="${img}" alt="${user.name}">
                                `).join('')}
                            </div>
                            <div class="verification-info">
                                <h3>${user.name}</h3>
                                <div class="user-details">
                                    <span>📧 ${user.email || 'Sin email'}</span>
                                    <span>🎂 ${user.age || 'Sin edad'} años</span>
                                    <span>📍 ${user.location?.city || 'Sin ubicación'}</span>
                                </div>
                                <div class="user-bio">${user.bio || 'Sin biografía'}</div>
                                <small>Solicitado: ${user.verificationRequestedAt ? new Date(user.verificationRequestedAt.toDate()).toLocaleDateString('es-ES') : 'Fecha desconocida'}</small>
                            </div>
                            <div class="verification-actions">
                                <button class="action-btn action-btn-approve" data-action="approve">
                                    ✅ Aprobar
                                </button>
                                <button class="action-btn action-btn-reject" data-action="reject">
                                    ❌ Rechazar
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>

        <!-- Usuarios Verificados -->
        <div class="stats-section">
            <h2>✓ Usuarios Verificados (Últimos 20)</h2>
            ${verified.length === 0 ? `
                <div class="empty-state-small">
                    <p>No hay usuarios verificados</p>
                </div>
            ` : `
                <div class="verified-list">
                    ${verified.slice(0, 20).map(user => `
                        <div class="verified-card" data-user-id="${user.id}">
                            <img src="${user.images?.[0] || '/vite.svg'}" alt="${user.name}">
                            <div class="verified-info">
                                <strong>${user.name}</strong>
                                <span>Verificado: ${user.verifiedAt ? new Date(user.verifiedAt.toDate()).toLocaleDateString('es-ES') : 'Fecha desconocida'}</span>
                            </div>
                            <div class="verified-badge">✓</div>
                            <button class="action-btn action-btn-revoke" data-action="revoke">
                                Revocar
                            </button>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;

    container.innerHTML = html;
};

const attachVerificationActions = () => {
    // Acciones de verificación pendiente
    document.querySelectorAll('.verification-card').forEach(card => {
        const userId = card.dataset.userId;

        card.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;

                try {
                    btn.disabled = true;
                    btn.textContent = 'Procesando...';

                    if (action === 'approve') {
                        if (confirm('¿Aprobar esta verificación?')) {
                            await approveVerification(userId);
                            loadVerificationData();
                        } else {
                            btn.disabled = false;
                            btn.textContent = '✅ Aprobar';
                        }
                    } else if (action === 'reject') {
                        const reason = prompt('Razón del rechazo (opcional):');
                        if (reason !== null) {
                            await rejectVerification(userId, reason);
                            loadVerificationData();
                        } else {
                            btn.disabled = false;
                            btn.textContent = '❌ Rechazar';
                        }
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al procesar la acción');
                    btn.disabled = false;
                }
            });
        });
    });

    // Acciones de revocación
    document.querySelectorAll('.verified-card .action-btn-revoke').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const card = e.target.closest('.verified-card');
            const userId = card.dataset.userId;

            const reason = prompt('Razón de la revocación:');
            if (reason) {
                try {
                    btn.disabled = true;
                    btn.textContent = 'Procesando...';

                    await revokeVerification(userId, reason);
                    loadVerificationData();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al revocar verificación');
                    btn.disabled = false;
                    btn.textContent = 'Revocar';
                }
            }
        });
    });
};
