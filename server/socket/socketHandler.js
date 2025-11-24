import { Server } from "socket.io";
import { db } from "../firebase.js";
import admin from "firebase-admin";

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
                const messagesRef = matchRef.collection("messages");

                await messagesRef.add({
                    senderId: author, // data.author should be the userId
                    text: message,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    // You might want to add more fields here like 'read' status
                });

                // Update last message in the match document
                await matchRef.update({
                    lastMessage: message,
                    lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
                });

                console.log(`✅ Message saved to Firestore for room ${roomId}`);

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
