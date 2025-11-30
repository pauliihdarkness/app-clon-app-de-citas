export const createUserDetailModal = (user) => {
    const images = user.images && user.images.length > 0
        ? user.images
        : ['/vite.svg'];

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return `
    <div class="modal-overlay" id="user-detail-modal">
      <div class="modal-content">
        <button class="modal-close" id="close-modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <div class="modal-body">
          <!-- Galería de Imágenes -->
          <div class="user-detail-gallery">
            <div class="gallery-main">
              <img src="${images[0]}" alt="${user.name}" id="gallery-main-image" />
            </div>
            ${images.length > 1 ? `
              <div class="gallery-thumbnails">
                ${images.map((img, index) => `
                  <img 
                    src="${img}" 
                    alt="Imagen ${index + 1}" 
                    class="gallery-thumb ${index === 0 ? 'active' : ''}"
                    data-index="${index}"
                  />
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <!-- Información del Usuario -->
          <div class="user-detail-info">
            <div class="user-detail-header">
              <h2>${user.name || 'Sin nombre'}</h2>
              ${user.age ? `<span class="age-badge">${user.age} años</span>` : ''}
            </div>
            
            <!-- Información Básica -->
            <div class="info-section">
              <h3>📋 Información Básica</h3>
              <div class="info-grid">
                ${user.gender ? `<div class="info-item"><strong>Género:</strong> ${user.gender}</div>` : ''}
                ${user.sexualOrientation ? `<div class="info-item"><strong>Orientación:</strong> ${user.sexualOrientation}</div>` : ''}
                ${user.location ? `
                  <div class="info-item">
                    <strong>Ubicación:</strong> 
                    ${[user.location.city, user.location.state, user.location.country].filter(Boolean).join(', ')}
                  </div>
                ` : ''}
                ${user.searchIntent ? `<div class="info-item"><strong>Busca:</strong> ${user.searchIntent}</div>` : ''}
              </div>
            </div>
            
            <!-- Biografía -->
            ${user.bio ? `
              <div class="info-section">
                <h3>✍️ Biografía</h3>
                <p class="bio-text">${user.bio}</p>
              </div>
            ` : ''}
            
            <!-- Intereses -->
            ${user.interests && user.interests.length > 0 ? `
              <div class="info-section">
                <h3>❤️ Intereses</h3>
                <div class="interests-tags">
                  ${user.interests.map(interest => `
                    <span class="interest-tag">${interest}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Estilo de Vida -->
            ${user.lifestyle ? `
              <div class="info-section">
                <h3>🌟 Estilo de Vida</h3>
                <div class="info-grid">
                  ${user.lifestyle.drink ? `<div class="info-item"><strong>Bebida:</strong> ${user.lifestyle.drink}</div>` : ''}
                  ${user.lifestyle.smoke ? `<div class="info-item"><strong>Fumar:</strong> ${user.lifestyle.smoke}</div>` : ''}
                  ${user.lifestyle.workout ? `<div class="info-item"><strong>Ejercicio:</strong> ${user.lifestyle.workout}</div>` : ''}
                  ${user.lifestyle.zodiac ? `<div class="info-item"><strong>Signo:</strong> ${user.lifestyle.zodiac}</div>` : ''}
                  ${user.lifestyle.height ? `<div class="info-item"><strong>Altura:</strong> ${user.lifestyle.height} cm</div>` : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- Información Profesional -->
            ${user.job ? `
              <div class="info-section">
                <h3>💼 Información Profesional</h3>
                <div class="info-grid">
                  ${user.job.title ? `<div class="info-item"><strong>Ocupación:</strong> ${user.job.title}</div>` : ''}
                  ${user.job.company ? `<div class="info-item"><strong>Empresa:</strong> ${user.job.company}</div>` : ''}
                  ${user.job.education ? `<div class="info-item"><strong>Educación:</strong> ${user.job.education}</div>` : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- Metadata -->
            <div class="info-section">
              <h3>📅 Información de Cuenta</h3>
              <div class="info-grid">
                <div class="info-item"><strong>ID:</strong> <code>${user.id}</code></div>
                <div class="info-item"><strong>Registro:</strong> ${formatDate(user.createdAt)}</div>
                ${user.updatedAt ? `<div class="info-item"><strong>Última actualización:</strong> ${formatDate(user.updatedAt)}</div>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const attachModalListeners = () => {
    const modal = document.getElementById('user-detail-modal');
    const closeBtn = document.getElementById('close-modal');
    const overlay = modal;

    // Cerrar con botón
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
    }

    // Cerrar al hacer click en el overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            modal.remove();
        }
    });

    // Cerrar con ESC
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Galería de imágenes
    const thumbnails = document.querySelectorAll('.gallery-thumb');
    const mainImage = document.getElementById('gallery-main-image');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = thumb.getAttribute('data-index');
            mainImage.src = thumb.src;

            // Actualizar thumbnail activo
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
};
