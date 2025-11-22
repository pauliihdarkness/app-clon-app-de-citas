import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Guardar un like y verificar si hay match
 * @param {string} fromUserId - Usuario que da el like
 * @param {string} toUserId - Usuario que recibe el like
 * @returns {Promise<{success: boolean, isMatch: boolean}>}
 */
export const saveLike = async (fromUserId, toUserId) => {
    try {
        // Guardar el like
        await addDoc(collection(db, "likes"), {
            fromUserId,
            toUserId,
            type: "like",
            createdAt: serverTimestamp()
        });

        // La lógica de match ahora se maneja en el backend (Render)
        // El cliente escuchará cambios en la colección 'matches'

        return { success: true };
    } catch (error) {
        console.error("Error saving like:", error);
        throw error;
    }
};

/**
 * Guardar un pass/dislike
 * @param {string} fromUserId - Usuario que da el pass
 * @param {string} toUserId - Usuario que recibe el pass
 * @returns {Promise<{success: boolean}>}
 */
export const savePass = async (fromUserId, toUserId) => {
    try {
        await addDoc(collection(db, "likes"), {
            fromUserId,
            toUserId,
            type: "pass",
            createdAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error saving pass:", error);
        throw error;
    }
};

/**
 * Verificar si hay like mutuo entre dos usuarios
 * @param {string} user1Id - ID del primer usuario
 * @param {string} user2Id - ID del segundo usuario
 * @returns {Promise<boolean>}
 */
export const checkMutualLike = async (user1Id, user2Id) => {
    try {
        // Verificar si user2 le dio like a user1
        const q = query(
            collection(db, "likes"),
            where("fromUserId", "==", user2Id),
            where("toUserId", "==", user1Id),
            where("type", "==", "like")
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking mutual like:", error);
        return false;
    }
};

/**
 * Crear un match entre dos usuarios
 * @param {string} user1Id - ID del primer usuario
 * @param {string} user2Id - ID del segundo usuario
 */
export const createMatch = async (user1Id, user2Id) => {
    try {
        // Ordenar IDs alfabéticamente para consistencia
        const [sortedUser1, sortedUser2] = [user1Id, user2Id].sort();

        // Crear match con ID compuesto
        const matchId = `${sortedUser1}_${sortedUser2}`;

        await setDoc(doc(db, "matches", matchId), {
            user1Id: sortedUser1,
            user2Id: sortedUser2,
            createdAt: serverTimestamp()
        });

        console.log("Match created:", matchId);
    } catch (error) {
        console.error("Error creating match:", error);
        throw error;
    }
};

/**
 * Obtener todos los likes dados por un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>}
 */
export const getUserLikes = async (userId) => {
    try {
        const q = query(
            collection(db, "likes"),
            where("fromUserId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const likes = [];

        querySnapshot.forEach((doc) => {
            likes.push({ id: doc.id, ...doc.data() });
        });

        return likes;
    } catch (error) {
        console.error("Error getting user likes:", error);
        return [];
    }
};

/**
 * Obtener IDs de usuarios con los que ya hubo interacción (like o pass)
 * @param {string} userId - ID del usuario
 * @returns {Promise<string[]>}
 */
export const getInteractedUserIds = async (userId) => {
    try {
        const likes = await getUserLikes(userId);
        return likes.map(like => like.toUserId);
    } catch (error) {
        console.error("Error getting interacted users:", error);
        return [];
    }
};
