
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
}

/**
 * Initializes and/or returns Firebase services.
 * This function ensures that Firebase is initialized only once (singleton pattern).
 * @returns An object containing the initialized Firebase services.
 * @throws An error if the Firebase configuration is incomplete.
 */
export function getFirebaseServices(): FirebaseServices {
    const allConfigPresent = Object.values(firebaseConfig).every(value => !!value);
    if (!allConfigPresent) {
        throw new Error("Firebase configuration is incomplete. Please check your .env file.");
    }

    let app: FirebaseApp;
    if (getApps().length) {
        app = getApp();
    } else {
        app = initializeApp(firebaseConfig);
    }

    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    return { app, auth, db, storage };
}

// For client-side usage where you might not want to throw an error immediately,
// you can retrieve the auth object specifically.
export function getClientAuth(): Auth {
    return getFirebaseServices().auth;
}

// You can still export the raw config if needed elsewhere, though it's less common.
export { firebaseConfig };
