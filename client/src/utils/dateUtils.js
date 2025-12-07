/**
 * Date utility functions for age calculation and validation
 */

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date in YYYY-MM-DD format or Date object
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    // Parse date in local timezone, not UTC
    // YYYY-MM-DD format should be interpreted as local date
    const [year, month, day] = typeof birthDate === 'string' 
        ? birthDate.split('-').map(Number)
        : [birthDate.getFullYear(), birthDate.getMonth() + 1, birthDate.getDate()];
    
    const birth = new Date(year, month - 1, day); // Month is 0-indexed in Date constructor
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - (month - 1);

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
        age--;
    }

    return age;
};

/**
 * Validate if user is at least minimum age
 * @param {string|Date} birthDate - Birth date in YYYY-MM-DD format or Date object
 * @param {number} minAge - Minimum age required (default: 18)
 * @returns {boolean} True if user meets minimum age requirement
 */
export const isMinimumAge = (birthDate, minAge = 18) => {
    const age = calculateAge(birthDate);
    return age !== null && age >= minAge;
};

/**
 * Get maximum allowed birth date for minimum age
 * @param {number} minAge - Minimum age required (default: 18)
 * @returns {string} Maximum birth date in YYYY-MM-DD format
 */
export const getMaxBirthDate = (minAge = 18) => {
    const today = new Date();
    const maxDate = new Date(
        today.getFullYear() - minAge,
        today.getMonth(),
        today.getDate()
    );
    return maxDate.toISOString().split('T')[0];
};

/**
 * Get minimum allowed birth date (reasonable limit, e.g., 100 years ago)
 * @returns {string} Minimum birth date in YYYY-MM-DD format
 */
export const getMinBirthDate = () => {
    const today = new Date();
    const minDate = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate()
    );
    return minDate.toISOString().split('T')[0];
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export const formatDateToString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Validate birth date format and range
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {object} Validation result with isValid and error message
 */
export const validateBirthDate = (birthDate) => {
    if (!birthDate) {
        return { isValid: false, error: 'La fecha de nacimiento es requerida' };
    }

    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Fecha de nacimiento inválida' };
    }

    const minDate = new Date(getMinBirthDate());
    const maxDate = new Date(getMaxBirthDate());

    if (date < minDate) {
        return { isValid: false, error: 'Fecha de nacimiento demasiado antigua' };
    }

    if (date > maxDate) {
        return { isValid: false, error: 'Debes tener al menos 18 años para registrarte' };
    }

    return { isValid: true, error: null };
};
