
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
  } catch (error) {
    // Fail gracefully during build or if firebase is not configured
    console.error("Could not fetch SEO settings, returning null. Error: ", error);
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
