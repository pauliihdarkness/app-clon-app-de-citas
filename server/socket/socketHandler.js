import { Server } from "socket.io";
import { db } from "../firebase.js";
import admin from "firebase-admin";
import { sendMessageNotification } from "../services/notificationService.js";

export const setupSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`⚡ Client connected: ${socket.id}`);

        // Join a chat room
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
        });

        // Send a message
        socket.on("send_message", async (data) => {
            const { roomId, author, message, time } = data;

            // 1. Send to everyone in the room (including sender)
            io.to(roomId).emit("receive_message", data);

            // 2. Save to Firestore for persistence
            try {
                // Assuming roomId is the matchId
                const matchRef = db.collection("matches").doc(roomId);

                // Get match data to find the recipient
                const matchDoc = await matchRef.get();
                const matchData = matchDoc.data();
                const recipientId = matchData?.users?.find(id => id !== author);

                const messagesRef = matchRef.collection("messages");

                await messagesRef.add({
                    senderId: author, // data.author should be the userId
                    text: message,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    read: false // New messages start as unread
                });

                // Update last message and increment unreadCount for recipient
                const updateData = {
                    lastMessage: message,
                    lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
                };

                // Increment unreadCount for the recipient
                if (recipientId) {
                    updateData[`unreadCount.${recipientId}`] = admin.firestore.FieldValue.increment(1);
                }

                await matchRef.update(updateData);

                console.log(`✅ Message saved to Firestore for room ${roomId}`);

                // Enviar notificación push al destinatario (no bloquea el flujo)
                sendMessageNotification(roomId, author, message).catch((error) => {
                    console.error("⚠️ Error enviando notificación push:", error);
                });

            } catch (error) {
                console.error("❌ Error saving message to Firestore:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });

    return io;
};
