import * as admin from 'firebase-admin';

console.log('[Firebase Admin] Module loaded');

/**
 * Returns the Firebase Admin App instance.
 * Using a singleton pattern that is robust across SSR and hot-reloads.
 */
function getAdminApp() {
    const apps = admin.apps as (admin.app.App | null)[];
    console.log('[Firebase Admin] getAdminApp entry. Apps:', apps.map(a => a?.name));

    // 1. Try to find the default app first
    const defaultApp = apps.find(app => app?.name === '[DEFAULT]');
    if (defaultApp) {
        console.log('[Firebase Admin] Returning existing [DEFAULT] app');
        return defaultApp;
    }

    // 2. If no [DEFAULT] app found, initialize it.
    console.log('[Firebase Admin] No [DEFAULT] app found. Initializing...');

    const rawKey = process.env.VOICE_PRIVATE_KEY;
    const clientEmail = process.env.VOICE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    // Log env presence without revealing secrets
    console.log('[Firebase Admin] Env Presense:', {
        hasKey: !!rawKey,
        hasEmail: !!clientEmail,
        projectId,
        storageBucket
    });

    if (rawKey && clientEmail && projectId) {
        try {
            const privateKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').replace(/'/g, '').trim();
            console.log('[Firebase Admin] Initializing with Service Account...');
            return admin.initializeApp({
                credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
                storageBucket,
            });
        } catch (err) {
            console.error('[Firebase Admin] Cert init failed:', err);
        }
    }

    // fallback for Cloud Functions / Cloud Run
    console.log('[Firebase Admin] Initializing with Default Application Credentials...');
    try {
        return admin.initializeApp({ storageBucket });
    } catch (err) {
        console.error('[Firebase Admin] Default init failed:', err);
        // Last resort: if an app exists, just use it even if it's not the "default" named one
        if (apps.length > 0 && apps[0]) {
            console.log('[Firebase Admin] EMERGENCY FALLBACK: Using first available app');
            return apps[0];
        }
        throw err;
    }
}

/**
 * Returns the Firebase Admin Storage instance.
 * Lazy-loaded to prevent initialization crashes during top-level imports.
 */
export function getAdminStorage() {
    const app = getAdminApp();
    return admin.storage(app);
}
