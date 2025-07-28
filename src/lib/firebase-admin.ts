
import * as admin from 'firebase-admin';

// This is the name we'll give to our Admin App instance.
const APP_NAME = 'firebase-frameworks';

// Define the service account credentials structure.
interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

// Function to get the service account credentials from environment variables.
// Returns null if any of the required variables are missing.
function getServiceAccount(): ServiceAccount | null {
  const privateKeyBase64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKeyBase64 || !clientEmail || !projectId) {
    return null;
  }

  // Decode the Base64 private key back to its original PEM format.
  const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

/**
 * Initializes and/or returns the Firebase Admin App instance.
 * This function ensures that the app is initialized only once (singleton pattern).
 * It will NOT throw an error if initialization fails, but will return null.
 * @returns The initialized Firebase Admin App, or null if credentials are not set.
 */
export function getAdminApp(): admin.app.App | null {
  // Check if an app with our custom name already exists.
  const existingApp = admin.apps.find((app) => app?.name === APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    console.warn('[Firebase Warning] Firebase Admin credentials are not set in environment variables. Server-side Firebase features will be disabled during build or if variables are missing.');
    return null;
  }

  // If it doesn't exist, initialize a new app with our credentials and name.
  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    }, APP_NAME);
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    // Return null on failure to prevent build crashes.
    return null;
  }
}
