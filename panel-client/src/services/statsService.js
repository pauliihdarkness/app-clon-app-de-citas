import { db } from '../firebase/config';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

/**
 * Obtiene estadísticas generales del sistema
 */
export const getGeneralStats = async () => {
    try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const totalUsers = usersSnapshot.size;
        let verifiedCount = 0;
        let activeCount = 0;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            if (user.verified) verifiedCount++;
            if (user.lastActive && user.lastActive.toDate() > sevenDaysAgo) {
                activeCount++;
            }
        });

        // Usuarios nuevos (último mes)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const newUsersQuery = query(
            usersRef,
            where('createdAt', '>=', Timestamp.fromDate(oneMonthAgo))
        );
        const newUsersSnapshot = await getDocs(newUsersQuery);

        return {
            totalUsers,
            activeUsers: activeCount,
            newUsers: newUsersSnapshot.size,
            verifiedUsers: verifiedCount,
            verificationRate: totalUsers > 0 ? Math.round((verifiedCount / totalUsers) * 100) : 0
        };
    } catch (error) {
        console.error('Error getting general stats:', error);
        throw error;
    }
};

/**
 * Obtiene crecimiento de usuarios por mes
 * @param {number} months - Número de meses a consultar
 */
export const getUserGrowth = async (months = 6) => {
    try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const monthlyData = {};
        const now = new Date();

        // Inicializar últimos N meses
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = 0;
        }

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            if (user.createdAt) {
                const date = user.createdAt.toDate();
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyData[key] !== undefined) {
                    monthlyData[key]++;
                }
            }
        });

        return Object.entries(monthlyData).map(([month, count]) => ({
            month,
            count
        }));
    } catch (error) {
        console.error('Error getting user growth:', error);
        throw error;
    }
};

/**
 * Obtiene distribución demográfica
 */
export const getDemographics = async () => {
    try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const genderCount = {};
        const ageRanges = {
            '18-24': 0,
            '25-34': 0,
            '35-44': 0,
            '45-54': 0,
            '55+': 0
        };
        const countryCount = {};

        usersSnapshot.forEach(doc => {
            const user = doc.data();

            // Género
            const gender = user.gender || 'No especificado';
            genderCount[gender] = (genderCount[gender] || 0) + 1;

            // Edad
            if (user.age) {
                if (user.age >= 18 && user.age <= 24) ageRanges['18-24']++;
                else if (user.age >= 25 && user.age <= 34) ageRanges['25-34']++;
                else if (user.age >= 35 && user.age <= 44) ageRanges['35-44']++;
                else if (user.age >= 45 && user.age <= 54) ageRanges['45-54']++;
                else if (user.age >= 55) ageRanges['55+']++;
            }

            // País
            if (user.location && user.location.country) {
                const country = user.location.country;
                countryCount[country] = (countryCount[country] || 0) + 1;
            }
        });

        // Top 5 países
        const topCountries = Object.entries(countryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([country, count]) => ({ country, count }));

        return {
            gender: genderCount,
            ageRanges,
            topCountries
        };
    } catch (error) {
        console.error('Error getting demographics:', error);
        throw error;
    }
};

/**
 * Obtiene métricas de engagement
 */
export const getEngagementMetrics = async () => {
    try {
        // Likes
        const likesRef = collection(db, 'likes');
        const likesSnapshot = await getDocs(likesRef);
        const totalLikes = likesSnapshot.size;

        // Matches
        const matchesRef = collection(db, 'matches');
        const matchesSnapshot = await getDocs(matchesRef);
        const totalMatches = matchesSnapshot.size;

        // Conversaciones activas (últimos 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let activeConversations = 0;
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        for (const userDoc of usersSnapshot.docs) {
            const conversationsRef = collection(db, `users/${userDoc.id}/conversations`);
            const conversationsSnapshot = await getDocs(conversationsRef);

            conversationsSnapshot.forEach(convDoc => {
                const conv = convDoc.data();
                if (conv.lastMessageAt && conv.lastMessageAt.toDate() > sevenDaysAgo) {
                    activeConversations++;
                }
            });
        }

        // Tasa de match
        const matchRate = totalLikes > 0 ? Math.round((totalMatches / totalLikes) * 100) : 0;

        return {
            totalLikes,
            totalMatches,
            activeConversations: Math.floor(activeConversations / 2), // Dividir por 2 porque cada conversación está duplicada
            matchRate
        };
    } catch (error) {
        console.error('Error getting engagement metrics:', error);
        throw error;
    }
};

/**
 * Obtiene usuarios activos en los últimos N días
 * @param {number} days - Número de días
 */
export const getActiveUsers = async (days = 7) => {
    try {
        const usersRef = collection(db, 'users');
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const activeQuery = query(
            usersRef,
            where('lastActive', '>=', Timestamp.fromDate(daysAgo))
        );

        const activeSnapshot = await getDocs(activeQuery);
        return activeSnapshot.size;
    } catch (error) {
        console.error('Error getting active users:', error);
        throw error;
    }
};
