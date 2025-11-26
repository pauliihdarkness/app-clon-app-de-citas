import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

// GET /api/matches?userId=xxx - Get all matches for a specific user
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId query parameter is required" });
        }

        console.log(`📥 Fetching matches for userId: ${userId}`);

        // Query matches where the user is in the 'users' array
        const matchesSnapshot = await db.collection("matches")
            .where("users", "array-contains", userId)
            .get();

        if (matchesSnapshot.empty) {
            console.log(`   → No matches found`);
            return res.json([]);
        }

        const matches = matchesSnapshot.docs.map((doc) => {
            const data = doc.data();

            console.log(`🔍 Processing match ${doc.id}:`, {
                users: data.users,
                requestUserId: userId,
                usersType: typeof data.users,
                isArray: Array.isArray(data.users)
            });

            // Find the OTHER user in the match
            const otherUserId = data.users?.find(id => id !== userId);

            console.log(`   → otherUserId: ${otherUserId}`);

            // Read cached unreadCount (no expensive query needed!)
            const unreadCount = data.unreadCount?.[userId] || 0;

            return {
                id: doc.id,
                users: data.users || [],
                otherUserId, // ID of the other person in the match
                lastMessage: data.lastMessage || "",
                lastMessageTime: data.lastMessageTime ? data.lastMessageTime.toDate().toISOString() : null,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                matchedAt: data.matchedAt ? data.matchedAt.toDate().toISOString() : null,
                unreadCount // Cached value from match document
            };
        });

        // Sort by lastMessageTime (most recent first)
        matches.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });

        console.log(`✅ Returning ${matches.length} matches`);
        res.json(matches);

    } catch (error) {
        console.error("❌ Error fetching matches:", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});

// GET /api/matches/:matchId/messages
router.get("/:matchId/messages", async (req, res) => {
    try {
        const { matchId } = req.params;

        // Reference to the messages subcollection
        const messagesRef = db.collection("matches").doc(matchId).collection("messages");

        // Query messages ordered by timestamp
        const snapshot = await messagesRef.orderBy("timestamp", "asc").get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                roomId: matchId,
                author: data.senderId,
                message: data.text,
                // Convert Firestore Timestamp to readable time string or keep as ISO
                time: data.timestamp ? data.timestamp.toDate().toLocaleTimeString() : new Date().toLocaleTimeString(),
                timestamp: data.timestamp // Keep original for sorting if needed
            };
        });

        res.json(messages);

    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// POST /api/matches/:matchId/mark-read - Mark all messages as read for current user
router.post("/:matchId/mark-read", async (req, res) => {
    try {
        const { matchId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId is required in request body" });
        }

        const matchRef = db.collection("matches").doc(matchId);

        // Reset unreadCount for this user to 0
        await matchRef.update({
            [`unreadCount.${userId}`]: 0
        });

        console.log(`✅ Marked messages as read for user ${userId} in match ${matchId}`);
        res.json({ success: true });

    } catch (error) {
        console.error("❌ Error marking messages as read:", error);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
});

export default router;
