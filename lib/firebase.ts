import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth as getFirebaseAuth } from "firebase/auth";
import { getFirestore as getFirebaseFirestore } from "firebase/firestore";
import { getStorage as getFirebaseStorage } from "firebase/storage";

console.log('[Firebase Client] Module loaded');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
    console.log('[Firebase Client] getFirebaseApp called. Apps count:', getApps().length);
    if (getApps().length > 0) return getApp();

    console.log('[Firebase Client] Initializing new App. Project ID:', firebaseConfig.projectId);
    return initializeApp(firebaseConfig);
}

export const getAuth = () => getFirebaseAuth(getFirebaseApp());
export const getFirestore = () => getFirebaseFirestore(getFirebaseApp());
export const getStorage = () => getFirebaseStorage(getFirebaseApp());
