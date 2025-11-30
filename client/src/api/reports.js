import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Reportar a un usuario
 * @param {string} reporterId - ID del usuario que reporta
 * @param {string} reportedId - ID del usuario reportado
 * @param {string} reason - Motivo del reporte
 * @param {string} details - Detalles adicionales (opcional)
 */
export const reportUser = async (reporterId, reportedId, reason, details = "") => {
    try {
        await addDoc(collection(db, "reports"), {
            reporterId,
            reportedId,
            reason,
            details,
            status: "pending",
            createdAt: serverTimestamp()
        });
        console.log("User reported successfully");
    } catch (error) {
        console.error("Error reporting user:", error);
        throw error;
    }
};
