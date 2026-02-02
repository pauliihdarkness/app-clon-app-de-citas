import axios from './axios';

/**
 * Enviar verificación de identidad al servidor
 * @param {Object} verificationData - Datos de verificación
 * @param {string} verificationData.userId - ID del usuario
 * @param {string} verificationData.gestureType - Tipo de gesto realizado
 * @param {string} verificationData.timestamp - Timestamp de la verificación
 * @param {number} verificationData.confidence - Confianza de la detección (0-1)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const submitIdentityVerification = async (verificationData) => {
    try {
        const response = await axios.post('/api/verification/identity', verificationData);
        return {
            success: true,
            data: response.data.data || response.data,
        };
    } catch (error) {
        console.error('Error submitting identity verification:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Error al enviar verificación',
        };
    }
};

/**
 * Obtener estado de verificación del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Estado de verificación
 */
export const getVerificationStatus = async (userId) => {
    try {
        const response = await axios.get(`/api/verification/status/${userId}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching verification status:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Error al obtener estado de verificación',
        };
    }
};

/**
 * Cancelar verificación pendiente
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const cancelVerification = async (userId) => {
    try {
        const response = await axios.post(`/api/verification/cancel/${userId}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error canceling verification:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Error al cancelar verificación',
        };
    }
};

/**
 * Obtener historial de intentos de verificación
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Historial de intentos
 */
export const getVerificationHistory = async (userId) => {
    try {
        const response = await axios.get(`/api/verification/history/${userId}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching verification history:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Error al obtener historial de verificación',
        };
    }
};
