
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
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Firebase Admin credentials are not set in environment variables.');
  }

  // The private key from the environment variable might have escaped newlines.
  // We need to replace them with actual newline characters.
  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

/**
 * Initializes and/or returns the Firebase Admin App instance.
 * This function ensures that the app is initialized only once (singleton pattern),
 * which is crucial for serverless environments.
 *
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
      // Add other configurations like databaseURL or storageBucket if needed.
    }, APP_NAME);
  } catch (error: any) {
    // If initialization fails, log the error and re-throw it.
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    throw new Error('Firebase Admin SDK initialization failed. Check your credentials and server environment.');
  }
}
