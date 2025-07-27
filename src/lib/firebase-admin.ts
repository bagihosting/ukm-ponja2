
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
// Throws an error if any of the required variables are missing.
function getServiceAccount(): ServiceAccount {
  const privateKeyBase64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKeyBase64 || !clientEmail || !projectId) {
    throw new Error('Firebase Admin credentials (including private key as Base64) are not set in environment variables.');
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
 * This function ensures that the app is initialized only once (singleton pattern),
 * which is crucial for serverless environments.
 * It will throw an error if initialization fails, which should be caught by the calling function.
 * @returns The initialized Firebase Admin App.
 */
export function getAdminApp(): admin.app.App {
  // Check if an app with our custom name already exists.
  const existingApp = admin.apps.find((app) => app?.name === APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  // If it doesn't exist, initialize a new app with our credentials and name.
  try {
    const serviceAccount = getServiceAccount();
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    }, APP_NAME);
  } catch (error: any) {
    // This makes the error catchable by the caller, allowing for graceful degradation.
    if (error.message.includes('Firebase Admin credentials')) {
       console.warn(`[Firebase Admin Warning] ${error.message}. Server-side Firebase features will be disabled.`);
    } else {
       console.error('Failed to initialize Firebase Admin SDK:', error.message);
    }
    // Re-throw the error to be handled by the calling function's try-catch block.
    throw error;
  }
}
