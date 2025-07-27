
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
}

const SEO_DOC_PATH = 'settings/seo';

/**
 * Retrieves SEO settings from Firestore.
 * @returns A promise that resolves with the SEO data, or null if it doesn't exist or on error.
 */
export async function getSEOSettings(): Promise<SEOData | null> {
  try {
    const db = getFirestore(getAdminApp());
    const seoSettingsRef = db.doc(SEO_DOC_PATH);
    const docSnap = await seoSettingsRef.get();
    
    if (docSnap.exists) {
      return docSnap.data() as SEOData;
    }
    return null;
  } catch (error: any) {
    // This will now catch the error from getAdminApp() if credentials are not set.
    if (error.message.includes('Firebase Admin credentials')) {
        console.warn("Firebase Admin credentials not set, returning null for getSEOSettings. This is expected during local development or build if server env vars are not set.");
    } else {
        console.error("Error fetching SEO settings:", error);
    }
    return null;
  }
}

/**
 * Updates SEO settings in Firestore. Creates the document if it doesn't exist.
 * @param data - The SEO data to save.
 */
export async function updateSEOSettings(data: SEOData): Promise<void> {
  const db = getFirestore(getAdminApp());
  const seoSettingsRef = db.doc(SEO_DOC_PATH);
  // Use setDoc with merge:true to create or update the document.
  await seoSettingsRef.set(data, { merge: true });
}
