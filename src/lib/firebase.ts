
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
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
    storage: FirebaseStorage | null;
}

let services: FirebaseServices | null = null;

/**
 * Initializes and/or returns Firebase services.
 * This function ensures that Firebase is initialized only once (singleton pattern).
 * It will not throw an error if config is missing, but will return null services.
 * @returns An object containing the initialized Firebase services, or nulls if not configured.
 */
export function getFirebaseServices(): FirebaseServices {
    if (services) {
        return services;
    }

    const allConfigPresent = Object.values(firebaseConfig).every(value => !!value);
    
    if (!allConfigPresent) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn("Firebase configuration is incomplete. Firebase services will be disabled. Check your .env file.");
        }
        services = { app: null, auth: null, db: null, storage: null };
        return services;
    }

    try {
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);
        
        services = { app, auth, db, storage };
        return services;

    } catch (error) {
        console.error("Error initializing Firebase:", error);
        services = { app: null, auth: null, db: null, storage: null };
        return services;
    }
}

/**
 * Specifically gets the Auth instance for client-side components.
 * Returns null if Firebase is not configured.
 * @returns The Auth instance or null.
 */
export function getClientAuth(): Auth | null {
    return getFirebaseServices().auth;
}

export { firebaseConfig };
