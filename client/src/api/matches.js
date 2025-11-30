// Likes y matches
// Aquí puedes implementar las funciones relacionadas con los likes y los matches.

import { doc, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Ocultar un match para un usuario específico (borrado lógico)
 * @param {string} matchId - ID del match
 * @param {string} userId - ID del usuario que quiere ocultar el match
 */
export const hideMatchForUser = async (matchId, userId) => {
    try {
        const matchRef = doc(db, "matches", matchId);
        await updateDoc(matchRef, {
            hiddenFor: arrayUnion(userId)
        });
    } catch (error) {
        console.error("Error hiding match:", error);
        throw error;
    }
};

/**
 * Deshacer un match (borrado físico - para ambos usuarios)
 * @param {string} matchId - ID del match
 */
export const unmatchUser = async (matchId) => {
    try {
        await deleteDoc(doc(db, "matches", matchId));
    } catch (error) {
        console.error("Error unmatching user:", error);
        throw error;
    }
};