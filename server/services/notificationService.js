import admin from "firebase-admin";
import { db } from "../firebase.js";

/**
 * Servicio centralizado para gestionar notificaciones push
 */

/**
 * Obtiene los tokens FCM de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<string[]>} Array de tokens FCM
 */
async function getUserTokens(userId) {
    try {
        const tokensDoc = await db
            .collection("users")
            .doc(userId)
            .collection("private")
            .doc("fcmTokens")
            .get();

        if (!tokensDoc.exists) {
            console.log(`⚠️ Usuario ${userId} no tiene tokens FCM registrados`);
            return [];
        }

        const tokensData = tokensDoc.data();
        return tokensData.tokens || [];
    } catch (error) {
        console.error(`❌ Error obteniendo tokens de ${userId}:`, error);
        return [];
    }
}

/**
 * Limpia tokens FCM inválidos de un usuario
 * @param {string} userId - ID del usuario
 * @param {string[]} invalidTokens - Array de tokens a eliminar
 */
async function cleanInvalidTokens(userId, invalidTokens) {
    if (invalidTokens.length === 0) return;

    try {
        console.log(`🧹 Eliminando ${invalidTokens.length} token(s) inválido(s) de ${userId}`);
        await db
            .collection("users")
            .doc(userId)
            .collection("private")
            .doc("fcmTokens")
            .update({
                tokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
            });
    } catch (error) {
        console.error(`❌ Error limpiando tokens de ${userId}:`, error);
    }
}

/**
 * Envía notificación push cuando se recibe un nuevo mensaje
 * @param {string} matchId - ID del match/conversación
 * @param {string} senderId - ID del remitente
 * @param {string} messageText - Texto del mensaje
 */
export async function sendMessageNotification(matchId, senderId, messageText) {
    try {
        console.log(`📩 Preparando notificación de mensaje en match ${matchId}`);

        // Obtener información del match para saber quién es el destinatario
        const matchDoc = await db.collection("matches").doc(matchId).get();

        if (!matchDoc.exists) {
            console.error("❌ Match no encontrado");
            return;
        }

        const matchData = matchDoc.data();
        const users = matchData.users || [];

        // Encontrar el ID del destinatario (el que no es el sender)
        const recipientId = users.find((userId) => userId !== senderId);

        if (!recipientId) {
            console.error("❌ No se pudo identificar al destinatario");
            return;
        }

        console.log(`👤 Destinatario: ${recipientId}`);

        // Obtener información del remitente para la notificación
        const senderDoc = await db.collection("users").doc(senderId).get();

        if (!senderDoc.exists) {
            console.error("❌ Usuario remitente no encontrado");
            return;
        }

        const senderData = senderDoc.data();
        const senderName = senderData.name || "Alguien";
        const senderPhoto =
            senderData.photos && senderData.photos.length > 0
                ? senderData.photos[0]
                : null;

        // Obtener tokens FCM del destinatario
        const tokens = await getUserTokens(recipientId);

        if (tokens.length === 0) {
            console.log("⚠️ Destinatario no tiene tokens FCM activos");
            return;
        }

        console.log(`📱 Enviando notificación a ${tokens.length} dispositivo(s)`);

        // Preparar el mensaje de notificación
        const payload = {
            notification: {
                title: senderName,
                body:
                    messageText.length > 100
                        ? messageText.substring(0, 97) + "..."
                        : messageText,
                ...(senderPhoto && { imageUrl: senderPhoto }),
            },
            data: {
                conversationId: matchId,
                senderId: senderId,
                type: "chat_message",
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            },
            android: {
                priority: "high",
                notification: {
                    channelId: "chat_messages",
                    sound: "default",
                    priority: "high",
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        badge: 1,
                    },
                },
            },
        };

        // Enviar notificación a todos los tokens
        const response = await admin.messaging().sendEachForMulticast({
            tokens: tokens,
            ...payload,
        });

        console.log(
            `✅ Notificación enviada: ${response.successCount} éxitos, ${response.failureCount} fallos`
        );

        // Limpiar tokens inválidos
        if (response.failureCount > 0) {
            const tokensToRemove = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`❌ Error enviando a token ${idx}:`, resp.error);
                    // Si el token es inválido, marcarlo para eliminación
                    if (
                        resp.error.code === "messaging/invalid-registration-token" ||
                        resp.error.code === "messaging/registration-token-not-registered"
                    ) {
                        tokensToRemove.push(tokens[idx]);
                    }
                }
            });

            await cleanInvalidTokens(recipientId, tokensToRemove);
        }
    } catch (error) {
        console.error("❌ Error en sendMessageNotification:", error);
        // No lanzar error para no afectar el flujo del chat
    }
}

/**
 * Envía notificación push cuando se crea un nuevo match
 * @param {string} matchId - ID del match
 * @param {string} userId1 - ID del primer usuario
 * @param {string} userId2 - ID del segundo usuario
 */
export async function sendMatchNotification(matchId, userId1, userId2) {
    try {
        console.log(`💕 Preparando notificaciones de match: ${userId1} ↔️ ${userId2}`);

        // Obtener información de ambos usuarios
        const [user1Doc, user2Doc] = await Promise.all([
            db.collection("users").doc(userId1).get(),
            db.collection("users").doc(userId2).get(),
        ]);

        if (!user1Doc.exists || !user2Doc.exists) {
            console.error("❌ No se pudieron obtener los datos de los usuarios");
            return;
        }

        const user1Data = user1Doc.data();
        const user2Data = user2Doc.data();

        // Obtener tokens de ambos usuarios
        const [tokens1, tokens2] = await Promise.all([
            getUserTokens(userId1),
            getUserTokens(userId2),
        ]);

        // Función helper para enviar notificación a un usuario
        const sendToUser = async (recipientId, recipientTokens, matchedUserData) => {
            if (recipientTokens.length === 0) {
                console.log(`⚠️ Usuario ${recipientId} no tiene tokens FCM`);
                return;
            }

            const matchedUserName = matchedUserData.name || "Alguien";
            const matchedUserPhoto =
                matchedUserData.photos && matchedUserData.photos.length > 0
                    ? matchedUserData.photos[0]
                    : null;

            const payload = {
                notification: {
                    title: "¡Nuevo Match! 💕",
                    body: `¡Hiciste match con ${matchedUserName}!`,
                    ...(matchedUserPhoto && { imageUrl: matchedUserPhoto }),
                },
                data: {
                    conversationId: matchId,
                    matchedUserId: matchedUserData.uid || recipientId,
                    type: "new_match",
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                },
                android: {
                    priority: "high",
                    notification: {
                        channelId: "chat_messages",
                        sound: "default",
                        priority: "high",
                        tag: "match",
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: "default",
                            badge: 1,
                        },
                    },
                },
            };

            console.log(`📱 Enviando notificación de match a ${recipientId}`);
            const response = await admin.messaging().sendEachForMulticast({
                tokens: recipientTokens,
                ...payload,
            });

            console.log(
                `✅ Match notification: ${response.successCount} éxitos, ${response.failureCount} fallos`
            );

            // Limpiar tokens inválidos
            if (response.failureCount > 0) {
                const tokensToRemove = [];
                response.responses.forEach((resp, idx) => {
                    if (
                        !resp.success &&
                        (resp.error.code === "messaging/invalid-registration-token" ||
                            resp.error.code === "messaging/registration-token-not-registered")
                    ) {
                        tokensToRemove.push(recipientTokens[idx]);
                    }
                });

                await cleanInvalidTokens(recipientId, tokensToRemove);
            }
        };

        // Enviar notificaciones a ambos usuarios en paralelo
        await Promise.all([
            sendToUser(userId1, tokens1, user2Data),
            sendToUser(userId2, tokens2, user1Data),
        ]);

        console.log("✅ Notificaciones de match enviadas a ambos usuarios");
    } catch (error) {
        console.error("❌ Error en sendMatchNotification:", error);
        // No lanzar error para no afectar el flujo de matches
    }
}
