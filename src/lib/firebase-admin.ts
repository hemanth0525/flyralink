import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
    if (getApps().length === 0) {
        const serviceAccount: ServiceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle escaped newlines
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        initializeApp({
            credential: cert(serviceAccount),
        });
    }
    return getFirestore();
}

// Export the Firestore instance
export const db = initializeFirebaseAdmin();