import express from "express";
import { db } from "../firebase.js";
import admin from "../firebase.js";

const router = express.Router();

// Firestore collection for rate limiting
const rateLimitsRef = db.collection("rateLimits");

/**
 * POST /api/likes
 * Creates a 'like' from one user to another after verifying the rate limit.
 * The user's UID is extracted from the authenticated token by the verifyToken middleware.
 *
 * Request body: {
 *   toUserId: "string" // The UID of the user being liked
 * }
 */
router.post("/", async (req, res) => {
    const fromUserId = req.user.uid; // UID from verifyToken middleware
    const { toUserId } = req.body;

    if (!toUserId) {
        return res.status(400).json({ error: "toUserId is required" });
    }

    if (fromUserId === toUserId) {
        return res.status(400).json({ error: "User cannot like themselves" });
    }

    const rateLimitDocRef = rateLimitsRef.doc(fromUserId);

    try {
        await db.runTransaction(async (transaction) => {
            const now = Date.now();
            const windowStart = now - (60 * 60 * 1000); // 1 hour window
            const likeLimit = 40; // 40 likes per hour

            const rateLimitDoc = await transaction.get(rateLimitDocRef);

            let state = rateLimitDoc.exists ? rateLimitDoc.data() : { likes: [] };

            // Filter out timestamps older than the 1-hour window
            state.likes = state.likes.filter(timestamp => timestamp > windowStart);

            // Check if the user has exceeded the limit
            if (state.likes.length >= likeLimit) {
                // By throwing an error inside a transaction, it automatically rolls back.
                throw new Error("Rate limit exceeded. You can like up to 40 profiles per hour.");
            }

            // Add the new like timestamp
            state.likes.push(now);

            // Update the document in the transaction
            transaction.set(rateLimitDocRef, state);
        });

        // If the transaction is successful, proceed to create the like
        const likeData = {
            fromUserId,
            toUserId,
            type: "like",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("likes").add(likeData);

        res.status(201).json({ success: true, message: "Like saved successfully." });

    } catch (error) {
        console.error("Error in like transaction:", error);
        if (error.message.includes("Rate limit exceeded")) {
            return res.status(429).json({ error: error.message }); // 429 Too Many Requests
        }
        return res.status(500).json({ error: "An internal server error occurred." });
    }
});

export default router;
