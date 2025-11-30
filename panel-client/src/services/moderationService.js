import { db } from '../firebase/config';
import { collection, getDocs, getDoc, doc, query, where, orderBy, updateDoc, Timestamp, addDoc } from 'firebase/firestore';

/**
 * Obtiene reportes pendientes
 */
export const getPendingReports = async () => {
    try {
        const reportsRef = collection(db, 'reports');
        const reportsQuery = query(
            reportsRef,
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        const reportsSnapshot = await getDocs(reportsQuery);
        const reports = [];

        for (const reportDoc of reportsSnapshot.docs) {
            const reportData = reportDoc.data();

            // Obtener información del usuario reportado
            let reportedUserData = null;
            if (reportData.reportedUserId) {
                const userDoc = await getDoc(doc(db, 'users', reportData.reportedUserId));
                if (userDoc.exists()) {
                    reportedUserData = {
                        id: userDoc.id,
                        name: userDoc.data().name,
                        images: userDoc.data().images
                    };
                }
            }

            // Obtener información del usuario que reportó
            let reporterData = null;
            if (reportData.reporterId) {
                const reporterDoc = await getDoc(doc(db, 'users', reportData.reporterId));
                if (reporterDoc.exists()) {
                    reporterData = {
                        id: reporterDoc.id,
                        name: reporterDoc.data().name
                    };
                }
            }

            reports.push({
                id: reportDoc.id,
                ...reportData,
                reportedUser: reportedUserData,
                reporter: reporterData
            });
        }

        return reports;
    } catch (error) {
        console.error('Error getting pending reports:', error);
        throw error;
    }
};

/**
 * Obtiene detalles de un reporte
 */
export const getReportById = async (reportId) => {
    try {
        const reportDoc = await getDoc(doc(db, 'reports', reportId));

        if (!reportDoc.exists()) {
            throw new Error('Reporte no encontrado');
        }

        return {
            id: reportDoc.id,
            ...reportDoc.data()
        };
    } catch (error) {
        console.error('Error getting report:', error);
        throw error;
    }
};

/**
 * Resuelve un reporte
 * @param {string} reportId - ID del reporte
 * @param {string} action - Acción tomada ('dismissed', 'warning', 'suspended')
 * @param {string} notes - Notas del moderador
 */
export const resolveReport = async (reportId, action, notes = '') => {
    try {
        const reportRef = doc(db, 'reports', reportId);

        await updateDoc(reportRef, {
            status: 'resolved',
            action,
            moderatorNotes: notes,
            resolvedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error resolving report:', error);
        throw error;
    }
};

/**
 * Suspende un usuario
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de la suspensión
 * @param {number} days - Días de suspensión (0 = permanente)
 */
export const suspendUser = async (userId, reason, days = 0) => {
    try {
        const userRef = doc(db, 'users', userId);

        const suspendedUntil = days > 0
            ? Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000))
            : null;

        await updateDoc(userRef, {
            suspended: true,
            suspendedUntil,
            suspensionReason: reason,
            suspendedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error suspending user:', error);
        throw error;
    }
};

/**
 * Obtiene usuarios suspendidos
 */
export const getSuspendedUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const suspendedQuery = query(
            usersRef,
            where('suspended', '==', true)
        );

        const suspendedSnapshot = await getDocs(suspendedQuery);
        const users = [];

        suspendedSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('Error getting suspended users:', error);
        throw error;
    }
};

/**
 * Reactiva un usuario suspendido
 * @param {string} userId - ID del usuario
 */
export const reactivateUser = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            suspended: false,
            suspendedUntil: null,
            suspensionReason: null,
            reactivatedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error reactivating user:', error);
        throw error;
    }
};

/**
 * Obtiene estadísticas de moderación
 */
export const getModerationStats = async () => {
    try {
        const reportsRef = collection(db, 'reports');

        // Total de reportes
        const allReportsSnapshot = await getDocs(reportsRef);
        const totalReports = allReportsSnapshot.size;

        // Reportes pendientes
        const pendingQuery = query(reportsRef, where('status', '==', 'pending'));
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingReports = pendingSnapshot.size;

        // Reportes resueltos hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedTodayQuery = query(
            reportsRef,
            where('status', '==', 'resolved'),
            where('resolvedAt', '>=', Timestamp.fromDate(today))
        );
        const resolvedTodaySnapshot = await getDocs(resolvedTodayQuery);
        const resolvedToday = resolvedTodaySnapshot.size;

        // Usuarios suspendidos
        const usersRef = collection(db, 'users');
        const suspendedQuery = query(usersRef, where('suspended', '==', true));
        const suspendedSnapshot = await getDocs(suspendedQuery);
        const suspendedUsers = suspendedSnapshot.size;

        // Reportes por categoría
        const categoryCounts = {};
        allReportsSnapshot.forEach(doc => {
            const category = doc.data().category || 'Otro';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        return {
            totalReports,
            pendingReports,
            resolvedToday,
            suspendedUsers,
            categoryCounts
        };
    } catch (error) {
        console.error('Error getting moderation stats:', error);
        throw error;
    }
};
