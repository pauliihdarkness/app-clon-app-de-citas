import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Obtener todos los usuarios de Firestore
 * @param {number} maxUsers - Número máximo de usuarios a obtener (default: 100)
 * @returns {Promise<Array>}
 */
export const getAllUsers = async (maxUsers = 100) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'), limit(maxUsers));
        const querySnapshot = await getDocs(q);

        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

/**
 * Obtener un usuario específico por ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return {
                id: userSnap.id,
                ...userSnap.data()
            };
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        throw error;
    }
};

/**
 * Buscar usuarios por nombre
 * @param {string} searchQuery - Texto de búsqueda
 * @param {Array} users - Array de usuarios donde buscar
 * @returns {Array}
 */
export const searchUsers = (searchQuery, users) => {
    if (!searchQuery || searchQuery.trim() === '') {
        return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query)
    );
};

/**
 * Filtrar usuarios por criterios
 * @param {Object} filters - Objeto con filtros { gender, minAge, maxAge, country, state, city }
 * @param {Array} users - Array de usuarios a filtrar
 * @returns {Array}
 */
export const filterUsers = (filters, users) => {
    let filtered = [...users];

    // Filtrar por género
    if (filters.gender && filters.gender !== 'all') {
        filtered = filtered.filter(user => user.gender === filters.gender);
    }

    // Filtrar por edad mínima
    if (filters.minAge) {
        filtered = filtered.filter(user => user.age >= parseInt(filters.minAge));
    }

    // Filtrar por edad máxima
    if (filters.maxAge) {
        filtered = filtered.filter(user => user.age <= parseInt(filters.maxAge));
    }

    // Filtrar por país
    if (filters.country && filters.country !== 'all') {
        filtered = filtered.filter(user => user.location?.country === filters.country);
    }

    // Filtrar por estado
    if (filters.state && filters.state !== 'all') {
        filtered = filtered.filter(user => user.location?.state === filters.state);
    }

    // Filtrar por ciudad
    if (filters.city && filters.city !== 'all') {
        filtered = filtered.filter(user => user.location?.city === filters.city);
    }

    // Filtrar por orientación sexual
    if (filters.sexualOrientation && filters.sexualOrientation !== 'all') {
        filtered = filtered.filter(user => user.sexualOrientation === filters.sexualOrientation);
    }

    return filtered;
};

/**
 * Obtener valores únicos de un campo para filtros
 * @param {Array} users - Array de usuarios
 * @param {string} field - Campo a extraer (ej: 'gender', 'location.country')
 * @returns {Array}
 */
export const getUniqueValues = (users, field) => {
    const values = new Set();

    users.forEach(user => {
        let value;
        if (field.includes('.')) {
            // Campo anidado (ej: location.country)
            const parts = field.split('.');
            value = user[parts[0]]?.[parts[1]];
        } else {
            value = user[field];
        }

        if (value) {
            values.add(value);
        }
    });

    return Array.from(values).sort();
};
