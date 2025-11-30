/**
 * Calcula el porcentaje de completado del perfil
 * @param {Object} user - Objeto de usuario
 * @returns {number} - Porcentaje de 0 a 100
 */
const calculateProfileCompletion = (user) => {
  const fields = [
    { key: 'name', weight: 15 },
    { key: 'bio', weight: 15 },
    { key: 'age', weight: 10 },
    { key: 'gender', weight: 10 },
    { key: 'sexualOrientation', weight: 10 },
    { key: 'location', weight: 10, check: (val) => val && (val.city || val.country) },
    { key: 'images', weight: 20, check: (val) => val && val.length > 0 },
    { key: 'interests', weight: 10, check: (val) => val && val.length > 0 }
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  fields.forEach(field => {
    totalWeight += field.weight;
    const value = user[field.key];

    if (field.check) {
      if (field.check(value)) {
        completedWeight += field.weight;
      }
    } else {
      if (value !== undefined && value !== null && value !== '') {
        completedWeight += field.weight;
      }
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
};

/**
 * Obtiene el color según el porcentaje de completado
 * @param {number} percentage - Porcentaje de completado
 * @returns {string} - Color en formato hex
 */
const getCompletionColor = (percentage) => {
  if (percentage >= 80) return '#4ade80'; // Verde
  if (percentage >= 50) return '#facc15'; // Amarillo
  return '#f87171'; // Rojo
};

export const createUserCard = (user) => {
  const profileImage = user.images && user.images.length > 0
    ? user.images[0]
    : '/vite.svg';

  const location = user.location
    ? `${user.location.city || ''}, ${user.location.country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
    : 'Ubicación no especificada';

  const completion = calculateProfileCompletion(user);
  const completionColor = getCompletionColor(completion);

  return `
    <div class="user-card" data-user-id="${user.id}">
      <div class="user-card-image">
        <img src="${profileImage}" alt="${user.name}" loading="lazy" />
        ${user.age ? `<span class="user-age-badge">${user.age}</span>` : ''}
        <div class="profile-completion-badge" style="background: ${completionColor}">
          ${completion}%
        </div>
        ${user.verified ? `
          <div class="verification-badge verified" title="Usuario verificado">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        ` : `
          <div class="verification-badge unverified" title="Usuario no verificado">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </div>
        `}
      </div>
      
      <div class="user-card-content">
        <h3 class="user-card-name">
          ${user.name || 'Sin nombre'}
          ${user.verified ? `
            <svg class="verified-icon-inline" width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          ` : ''}
        </h3>
        
        <div class="user-card-info">
          <span class="user-info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${location}
          </span>
          
          ${user.gender ? `
            <span class="user-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              ${user.gender}
            </span>
          ` : ''}
        </div>
        
        ${user.bio ? `
          <p class="user-card-bio">${user.bio.substring(0, 80)}${user.bio.length > 80 ? '...' : ''}</p>
        ` : ''}
        
        <div class="profile-completion-bar">
          <div class="completion-bar-fill" style="width: ${completion}%; background: ${completionColor}"></div>
        </div>
      </div>
    </div>
  `;
};

export const attachUserCardListeners = (onUserClick) => {
  const userCards = document.querySelectorAll('.user-card');

  userCards.forEach(card => {
    card.addEventListener('click', () => {
      const userId = card.getAttribute('data-user-id');
      if (onUserClick) {
        onUserClick(userId);
      }
    });
  });
};
