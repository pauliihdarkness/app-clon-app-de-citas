import { db } from "../firebase.js";
import admin from "firebase-admin";

export function startMatchWorker() {
    console.log("❤️  Match Worker started... listening for new likes.");

    db.collection("likes").onSnapshot(
        (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === "added") {
                    const likeData = change.doc.data();
                    const likeId = change.doc.id;

                    console.log(`💝 New like detected: ${likeData.fromUserId} → ${likeData.toUserId} (type: ${likeData.type})`);

                    // Only process actual likes, not passes
                    if (likeData.type !== "like") {
                        console.log(`⏭️  Skipping non-like interaction`);
                        return;
                    }

                    // Optional: Check timestamp to avoid processing old events on restart
                    // if (Date.now() - likeData.createdAt > 60000) return;

                    try {
                        await checkForMatch(likeData.fromUserId, likeData.toUserId, likeId);
                    } catch (error) {
                        console.error("Error checking match:", error);
                    }
                }
            });
        },
        (error) => {
            console.error("Error listening to likes:", error);
        }
    );
}

async function checkForMatch(fromUserId, toUserId, currentLikeId) {
    console.log(`🔍 Checking for reciprocal like: ${toUserId} → ${fromUserId}`);

    const reciprocalLikeQuery = await db
        .collection("likes")
        .where("fromUserId", "==", toUserId)
        .where("toUserId", "==", fromUserId)
        .where("type", "==", "like")
        .limit(1)
        .get();

    console.log(`📊 Reciprocal query result: ${reciprocalLikeQuery.empty ? 'NOT FOUND' : 'FOUND!'}`);

    if (!reciprocalLikeQuery.empty) {
        console.log(`✨ MATCH FOUND! ${fromUserId} ↔️ ${toUserId}`);

        const matchId = [fromUserId, toUserId].sort().join("_");
        const matchRef = db.collection("matches").doc(matchId);

        const matchDoc = await matchRef.get();

        if (!matchDoc.exists) {
            await matchRef.set({
                users: [fromUserId, toUserId],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastMessage: null,
                lastMessageTime: null,
            });
            console.log(`✅ Match document created: ${matchId}`);
        } else {
            console.log(`ℹ️  Match already exists: ${matchId}`);
        }
    } else {
        console.log(`❌ No reciprocal like found yet`);
    }
}
