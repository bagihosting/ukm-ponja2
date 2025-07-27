
// THIS FILE IS FOR CLIENT-SIDE FIREBASE SDKs ONLY
// DO NOT IMPORT/USE IN SERVER-SIDE CODE (e.g., in /lib/*-admin.ts files)

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

interface FirebaseClientServices {
    app: FirebaseApp | null;
    auth: Auth | null;
}

let clientServices: FirebaseClientServices | null = null;

/**
 * Initializes and/or returns Firebase CLIENT services.
 * This should only be used in client components ('use client').
 * It will not throw an error if config is missing, but will return null services.
 * @returns An object containing the initialized Firebase client services, or nulls if not configured.
 */
export function getFirebaseClientServices(): FirebaseClientServices {
    if (clientServices) {
        return clientServices;
    }

    const allConfigPresent = Object.values(firebaseConfig).every(value => !!value);
    
    if (!allConfigPresent) {
        console.warn("Client-side Firebase configuration is incomplete. Firebase services will be disabled. Check your .env file.");
        clientServices = { app: null, auth: null };
        return clientServices;
    }

    try {
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        
        clientServices = { app, auth };
        return clientServices;

    } catch (error) {
        console.error("Error initializing client-side Firebase:", error);
        clientServices = { app: null, auth: null };
        return clientServices;
    }
}

/**
 * Specifically gets the Auth instance for client-side components.
 * Returns null if Firebase is not configured.
 * @returns The Auth instance or null.
 */
export function getClientAuth(): Auth | null {
    return getFirebaseClientServices().auth;
}

export { firebaseConfig };
