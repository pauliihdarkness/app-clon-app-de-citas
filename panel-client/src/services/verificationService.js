import { db } from '../firebase/config';
import { collection, getDocs, getDoc, doc, query, where, orderBy, updateDoc, Timestamp, setDoc } from 'firebase/firestore';

/**
 * Obtiene solicitudes de verificación pendientes
 */
export const getPendingVerifications = async () => {
    try {
        const usersRef = collection(db, 'users');
        const pendingQuery = query(
            usersRef,
            where('verificationStatus', '==', 'pending'),
            orderBy('verificationRequestedAt', 'desc')
        );

        const pendingSnapshot = await getDocs(pendingQuery);
        const verifications = [];

        pendingSnapshot.forEach(doc => {
            verifications.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return verifications;
    } catch (error) {
        console.error('Error getting pending verifications:', error);
        throw error;
    }
};

/**
 * Obtiene usuarios verificados
 */
export const getVerifiedUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const verifiedQuery = query(
            usersRef,
            where('verified', '==', true),
            orderBy('verifiedAt', 'desc')
        );

        const verifiedSnapshot = await getDocs(verifiedQuery);
        const users = [];

        verifiedSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('Error getting verified users:', error);
        throw error;
    }
};

/**
 * Aprueba una solicitud de verificación
 * @param {string} userId - ID del usuario
 */
export const approveVerification = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            verified: true,
            verificationStatus: 'approved',
            verifiedAt: Timestamp.now()
        });

        // Crear notificación para el usuario
        const notificationRef = doc(collection(db, `users/${userId}/notifications`));
        await setDoc(notificationRef, {
            type: 'verification_approved',
            title: '¡Verificación aprobada!',
            message: 'Tu cuenta ha sido verificada exitosamente.',
            read: false,
            createdAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error approving verification:', error);
        throw error;
    }
};

/**
 * Rechaza una solicitud de verificación
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón del rechazo
 */
export const rejectVerification = async (userId, reason = '') => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            verified: false,
            verificationStatus: 'rejected',
            verificationRejectionReason: reason,
            rejectedAt: Timestamp.now()
        });

        // Crear notificación para el usuario
        const notificationRef = doc(collection(db, `users/${userId}/notifications`));
        await setDoc(notificationRef, {
            type: 'verification_rejected',
            title: 'Verificación rechazada',
            message: reason || 'Tu solicitud de verificación ha sido rechazada. Por favor, revisa los requisitos e intenta nuevamente.',
            read: false,
            createdAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error rejecting verification:', error);
        throw error;
    }
};

/**
 * Revoca la verificación de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de la revocación
 */
export const revokeVerification = async (userId, reason = '') => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            verified: false,
            verificationStatus: 'revoked',
            verificationRevokedReason: reason,
            revokedAt: Timestamp.now()
        });

        // Crear notificación para el usuario
        const notificationRef = doc(collection(db, `users/${userId}/notifications`));
        await setDoc(notificationRef, {
            type: 'verification_revoked',
            title: 'Verificación revocada',
            message: reason || 'Tu verificación ha sido revocada.',
            read: false,
            createdAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error revoking verification:', error);
        throw error;
    }
};

/**
 * Obtiene estadísticas de verificación
 */
export const getVerificationStats = async () => {
    try {
        const usersRef = collection(db, 'users');

        // Total de usuarios
        const allUsersSnapshot = await getDocs(usersRef);
        const totalUsers = allUsersSnapshot.size;

        // Usuarios verificados
        const verifiedQuery = query(usersRef, where('verified', '==', true));
        const verifiedSnapshot = await getDocs(verifiedQuery);
        const verifiedCount = verifiedSnapshot.size;

        // Solicitudes pendientes
        const pendingQuery = query(usersRef, where('verificationStatus', '==', 'pending'));
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingCount = pendingSnapshot.size;

        // Solicitudes rechazadas
        const rejectedQuery = query(usersRef, where('verificationStatus', '==', 'rejected'));
        const rejectedSnapshot = await getDocs(rejectedQuery);
        const rejectedCount = rejectedSnapshot.size;

        // Tasa de aprobación
        const totalProcessed = verifiedCount + rejectedCount;
        const approvalRate = totalProcessed > 0
            ? Math.round((verifiedCount / totalProcessed) * 100)
            : 0;

        // Verificaciones aprobadas hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let approvedToday = 0;

        verifiedSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.verifiedAt && data.verifiedAt.toDate() >= today) {
                approvedToday++;
            }
        });

        return {
            totalUsers,
            verifiedCount,
            pendingCount,
            rejectedCount,
            approvalRate,
            approvedToday,
            verificationRate: totalUsers > 0 ? Math.round((verifiedCount / totalUsers) * 100) : 0
        };
    } catch (error) {
        console.error('Error getting verification stats:', error);
        throw error;
    }
};

/**
 * Solicita más información para una verificación
 * @param {string} userId - ID del usuario
 * @param {string} message - Mensaje con lo que se necesita
 */
export const requestMoreInfo = async (userId, message) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            verificationStatus: 'info_requested',
            verificationInfoRequest: message,
            infoRequestedAt: Timestamp.now()
        });

        // Crear notificación para el usuario
        const notificationRef = doc(collection(db, `users/${userId}/notifications`));
        await setDoc(notificationRef, {
            type: 'verification_info_requested',
            title: 'Información adicional requerida',
            message: message,
            read: false,
            createdAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error requesting more info:', error);
        throw error;
    }
};
