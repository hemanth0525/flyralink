import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';

function initializeFirebaseAdmin() {
    try {
        // Validate required environment variables
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error(
                'Missing Firebase configuration. Please check your environment variables: ' +
                'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
            );
        }

        // Only initialize if no apps exist
        if (getApps().length === 0) {
            const serviceAccount: ServiceAccount = {
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            };

            initializeApp({
                credential: cert(serviceAccount)
            });
        }

        return getFirestore();
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw new Error('Failed to initialize Firebase Admin SDK');
    }
}

// Export a lazy-initialized instance
let dbInstance: ReturnType<typeof getFirestore> | null = null;

export function getDb() {
    if (!dbInstance) {
        dbInstance = initializeFirebaseAdmin();
    }
    return dbInstance;
}

export const db = getDb();