import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanDuplicateMatches() {
    console.log('🔍 Scanning for duplicate matches...\n');

    try {
        const matchesSnapshot = await db.collection('matches').get();

        console.log(`📊 Total matches found: ${matchesSnapshot.size}\n`);

        let duplicates = 0;
        let valid = 0;

        for (const doc of matchesSnapshot.docs) {
            const data = doc.data();
            const matchId = doc.id;
            const users = data.users || [];

            // Check if it's a duplicate (same user twice)
            if (users.length === 2 && users[0] === users[1]) {
                console.log(`❌ DUPLICATE MATCH: ${matchId}`);
                console.log(`   Users: [${users[0]}, ${users[1]}]`);
                console.log(`   Deleting...`);

                await doc.ref.delete();
                duplicates++;
            } else if (users.length === 2 && users[0] !== users[1]) {
                console.log(`✅ Valid match: ${matchId}`);
                console.log(`   Users: [${users[0]}, ${users[1]}]`);
                valid++;
            } else {
                console.log(`⚠️  Invalid match structure: ${matchId}`);
                console.log(`   Users: ${JSON.stringify(users)}`);
            }
            console.log('');
        }

        console.log('\n📈 Summary:');
        console.log(`   ✅ Valid matches: ${valid}`);
        console.log(`   ❌ Duplicates deleted: ${duplicates}`);
        console.log(`   ⚠️  Invalid: ${matchesSnapshot.size - valid - duplicates}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }

    process.exit(0);
}

cleanDuplicateMatches();
