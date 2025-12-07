import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

/**
 * POST /api/fcm-tokens
 * Registra o actualiza el token FCM de un usuario
 * 
 * Request body: {
 *   token: "string" // Token FCM del dispositivo
 * }
 */
router.post("/", async (req, res) => {
    try {
        const userId = req.user.uid; // UID from verifyToken middleware
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "token is required" });
        }

        console.log(`📱 Registrando token FCM para usuario ${userId}`);

        const tokenDocRef = db
            .collection("users")
            .doc(userId)
            .collection("private")
            .doc("fcmTokens");

        // Usar arrayUnion para agregar el token solo si no existe
        await tokenDocRef.set(
            {
                tokens: admin.firestore.FieldValue.arrayUnion(token),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        console.log(`✅ Token FCM registrado exitosamente`);
        res.json({ success: true, message: "Token registered successfully" });
    } catch (error) {
        console.error("❌ Error registrando token FCM:", error);
        res.status(500).json({ error: "Failed to register token" });
    }
});

/**
 * DELETE /api/fcm-tokens
 * Elimina un token FCM de un usuario (logout/desinstalación)
 * 
 * Request body: {
 *   token: "string" // Token FCM a eliminar
 * }
 */
router.delete("/", async (req, res) => {
    try {
        const userId = req.user.uid; // UID from verifyToken middleware
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "token is required" });
        }

        console.log(`🗑️ Eliminando token FCM para usuario ${userId}`);

        const tokenDocRef = db
            .collection("users")
            .doc(userId)
            .collection("private")
            .doc("fcmTokens");

        // Usar arrayRemove para eliminar el token
        await tokenDocRef.update({
            tokens: admin.firestore.FieldValue.arrayRemove(token),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Token FCM eliminado exitosamente`);
        res.json({ success: true, message: "Token removed successfully" });
    } catch (error) {
        console.error("❌ Error eliminando token FCM:", error);
        res.status(500).json({ error: "Failed to remove token" });
    }
});

export default router;
