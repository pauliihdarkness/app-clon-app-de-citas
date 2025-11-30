import { runSecurityAudit } from '../services/securityService';

// Variable global para almacenar los resultados
let currentAuditResults = null;

export const createSecurityPanel = () => {
    return `
    <div class="security-panel-container">
      <div class="users-panel-header">
        <div class="header-row">
          <div class="header-left">
            <button id="back-to-dashboard" class="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <h1>Auditoría de Seguridad</h1>
          </div>
          
          <div style="display: flex; gap: 1rem;">
            <button id="export-audit-btn" class="secondary-button" style="display: none;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exportar Reporte
            </button>
            <button id="run-audit-btn" class="primary-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Ejecutar Auditoría
            </button>
          </div>
        </div>
        
        <p class="security-intro">
          Esta herramienta verifica las reglas de seguridad de Firestore intentando acceder a diferentes recursos
          desde tu cuenta actual.
        </p>
      </div>

      <div class="security-content">
        <div id="audit-results" class="audit-results-container">
          <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h3>Listo para auditar</h3>
            <p>Presiona "Ejecutar Auditoría" para verificar los permisos.</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const attachSecurityPanelListeners = (onBackClick, currentUser) => {
    const backBtn = document.getElementById('back-to-dashboard');
    const runAuditBtn = document.getElementById('run-audit-btn');
    const exportBtn = document.getElementById('export-audit-btn');
    const resultsContainer = document.getElementById('audit-results');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.hash = '/dashboard';
        });
    }

    if (runAuditBtn) {
        runAuditBtn.addEventListener('click', async () => {
            if (!currentUser) return;

            runAuditBtn.disabled = true;
            runAuditBtn.innerHTML = '<span class="spinner"></span> Ejecutando...';

            resultsContainer.innerHTML = `
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Verificando permisos de Firestore...</p>
        </div>
      `;

            try {
                const results = await runSecurityAudit(currentUser.uid);
                currentAuditResults = results;
                renderResults(results, resultsContainer);

                // Mostrar botón de exportar
                if (exportBtn) {
                    exportBtn.style.display = 'flex';
                }
            } catch (error) {
                console.error('Error en auditoría:', error);
                resultsContainer.innerHTML = `
          <div class="error-state">
            <h3>Error al ejecutar auditoría</h3>
            <p>${error.message}</p>
          </div>
        `;
            } finally {
                runAuditBtn.disabled = false;
                runAuditBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Ejecutar Auditoría
        `;
            }
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (currentAuditResults) {
                exportToMarkdown(currentAuditResults);
            }
        });
    }
};

const exportToMarkdown = (results) => {
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const score = Math.round((passedCount / totalCount) * 100);
    const failedTests = results.filter(r => !r.passed);

    const timestamp = new Date().toLocaleString('es-ES');

    let markdown = `# Reporte de Auditoría de Seguridad Firestore\n\n`;
    markdown += `**Fecha:** ${timestamp}\n\n`;
    markdown += `## Resumen Ejecutivo\n\n`;
    markdown += `- **Nivel de Seguridad:** ${score}%\n`;
    markdown += `- **Pruebas Pasadas:** ${passedCount}/${totalCount}\n`;
    markdown += `- **Pruebas Fallidas:** ${failedTests.length}\n\n`;

    if (failedTests.length > 0) {
        markdown += `## ⚠️ Problemas Detectados\n\n`;
        failedTests.forEach((test, index) => {
            const icon = test.severity === 'critical' ? '🚨' : '⚠️';
            markdown += `### ${icon} ${index + 1}. ${test.name}\n\n`;
            markdown += `- **Tipo:** ${test.operation === 'read' ? 'Lectura' : 'Escritura'}\n`;
            markdown += `- **Ruta:** \`${test.path}\`\n`;
            markdown += `- **Acceso Esperado:** ${test.expected ? 'Permitido' : 'Denegado'}\n`;
            markdown += `- **Resultado Real:** ${test.result ? 'Permitido' : 'Denegado'}\n`;
            markdown += `- **Severidad:** ${test.severity === 'critical' ? 'CRÍTICA' : 'Advertencia'}\n`;
            markdown += `- **Descripción:** ${test.description}\n`;
            if (test.error) {
                markdown += `- **Error:** \`${test.error}\`\n`;
            }
            markdown += `\n`;
        });
    } else {
        markdown += `## ✅ Sin Problemas Detectados\n\n`;
        markdown += `Todas las reglas de seguridad funcionan como se espera.\n\n`;
    }

    markdown += `## Detalle Completo de Pruebas\n\n`;
    markdown += `| Prueba | Operación | Ruta | Esperado | Real | Estado |\n`;
    markdown += `|--------|-----------|------|----------|------|--------|\n`;

    results.forEach(test => {
        const operation = test.operation === 'read' ? '📖 Lectura' : '✏️ Escritura';
        const expected = test.expected ? '✅ Permitido' : '❌ Denegado';
        const real = test.result ? '✅ Permitido' : '❌ Denegado';
        const status = test.passed ? '✅ OK' : (test.severity === 'critical' ? '🚨 CRÍTICO' : '⚠️ Advertencia');

        markdown += `| ${test.name} | ${operation} | \`${test.path}\` | ${expected} | ${real} | ${status} |\n`;
    });

    // Descargar archivo
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-seguridad-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const renderResults = (results, container) => {
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const score = Math.round((passedCount / totalCount) * 100);

    let scoreColor = '#4ade80'; // Green
    if (score < 100) scoreColor = '#facc15'; // Yellow
    if (score < 80) scoreColor = '#f87171'; // Red

    const html = `
    <div class="audit-summary">
      <div class="score-card" style="border-color: ${scoreColor}">
        <span class="score-value" style="color: ${scoreColor}">${score}%</span>
        <span class="score-label">Nivel de Seguridad</span>
      </div>
      <div class="summary-details">
        <h3>Resumen de Pruebas</h3>
        <p><strong>${passedCount}</strong> de <strong>${totalCount}</strong> pruebas pasaron correctamente.</p>
        ${score === 100
            ? '<p class="success-text">✅ Todas las reglas de seguridad funcionan como se espera.</p>'
            : '<p class="warning-text">⚠️ Se detectaron posibles problemas de configuración.</p>'}
      </div>
    </div>

    <div class="results-table-wrapper">
      <table class="results-table">
        <thead>
          <tr>
            <th>Prueba</th>
            <th>Operación</th>
            <th>Ruta</th>
            <th>Acceso Esperado</th>
            <th>Resultado Real</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(result => {
                const statusIcon = result.passed ? '✅' : (result.severity === 'critical' ? '🚨' : '⚠️');
                const statusClass = result.passed ? 'status-pass' : `status-fail-${result.severity}`;
                const accessText = result.result ? 'Permitido' : 'Denegado';
                const expectedText = result.expected ? 'Permitido' : 'Denegado';
                const operationType = result.operation === 'read' ? 'Lectura' : 'Escritura';
                const operationIcon = result.operation === 'read' ? '📖' : '✏️';

                return `
              <tr class="${statusClass}">
                <td>
                  <div class="test-name">${result.name}</div>
                  <div class="test-desc">${result.description}</div>
                </td>
                <td>
                  <span class="operation-badge operation-${result.operation}">
                    ${operationIcon} ${operationType}
                  </span>
                </td>
                <td><code class="path-code">${result.path}</code></td>
                <td><span class="badge ${result.expected ? 'badge-allow' : 'badge-deny'}">${expectedText}</span></td>
                <td><span class="badge ${result.result ? 'badge-allow' : 'badge-deny'}">${accessText}</span></td>
                <td class="status-cell">
                  <div class="status-cell-content">
                    <span class="status-icon">${statusIcon}</span>
                    ${!result.passed ? `<div class="error-msg">${result.error || 'Resultado inesperado'}</div>` : ''}
                  </div>
                </td>
              </tr>
            `;
            }).join('')}
        </tbody>
      </table>
    </div>
  `;

    container.innerHTML = html;
};
