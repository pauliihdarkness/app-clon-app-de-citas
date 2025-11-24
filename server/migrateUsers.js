import admin from "firebase-admin";
import { db } from "./firebase.js";

/**
 * Migration script to add 'active' and 'popularity' fields to existing users
 * Run this once to fix users created before these fields were added
 */
async function migrateUsers() {
    console.log("🔄 Starting user migration...");

    try {
        // Get all users
        const usersSnapshot = await db.collection("users").get();

        if (usersSnapshot.empty) {
            console.log("⚠️  No users found in database");
            return;
        }

        console.log(`📊 Found ${usersSnapshot.size} users to migrate`);

        let updated = 0;
        let skipped = 0;

        // Update each user
        const batch = db.batch();

        usersSnapshot.forEach((doc) => {
            const userData = doc.data();

            // Check if fields already exist
            if (userData.active !== undefined && userData.popularity !== undefined) {
                skipped++;
                return;
            }

            // Add missing fields
            const updates = {};
            if (userData.active === undefined) {
                updates.active = true;
            }
            if (userData.popularity === undefined) {
                updates.popularity = 0;
            }

            batch.update(doc.ref, updates);
            updated++;
        });

        // Commit the batch
        await batch.commit();

        console.log("✅ Migration completed!");
        console.log(`   - Updated: ${updated} users`);
        console.log(`   - Skipped: ${skipped} users (already had fields)`);
        console.log(`   - Total: ${usersSnapshot.size} users`);

    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
}

// Run the migration
migrateUsers()
    .then(() => {
        console.log("\n✨ Migration script finished successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Migration script failed:", error);
        process.exit(1);
    });
