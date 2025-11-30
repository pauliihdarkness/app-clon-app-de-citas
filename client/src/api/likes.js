import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Saves a like directly to Firestore.
 * @param {string} fromUserId - The user ID giving the like.
 * @param {string} toUserId - The user ID receiving the like.
 * @returns {Promise<any>}
 */
export const saveLike = async (fromUserId, toUserId) => {
    try {
        const likeDoc = await addDoc(collection(db, "likes"), {
            fromUserId,
            toUserId,
            type: "like",
            createdAt: serverTimestamp()
        });

        return { success: true, id: likeDoc.id };
    } catch (error) {
        console.error("Error saving like:", error);
        throw error;
    }
};

/**
 * Saves a pass/dislike directly to Firestore.
 * NOTE: This should be migrated to a secure endpoint similar to saveLike.
 * @param {string} fromUserId - The user ID giving the pass.
 * @param {string} toUserId - The user ID receiving the pass.
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
 * Gets IDs of users with whom there has already been an interaction (like or pass).
 * This is still needed by the client's feed logic to filter profiles.
 * @param {string} userId - The current user's ID.
 * @returns {Promise<string[]>}
 */
export const getInteractedUserIds = async (userId) => {
    try {
        const q = query(collection(db, "likes"), where("fromUserId", "==", userId));
        const querySnapshot = await getDocs(q);
        const interactedIds = new Set();
        querySnapshot.forEach((doc) => {
            interactedIds.add(doc.data().toUserId);
        });
        return Array.from(interactedIds);
    } catch (error) {
        console.error("Error getting interacted users:", error);
        return [];
    }
};

