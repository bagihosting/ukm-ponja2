
'use server';

import { getFirebaseServices } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  const { db } = getFirebaseServices();
  if (!db) {
    return null;
  }
  
  try {
    const seoSettingsRef = doc(db, SEO_DOC_PATH);
    const docSnap = await getDoc(seoSettingsRef);
    if (docSnap.exists()) {
      return docSnap.data() as SEOData;
    }
    return null;
  } catch (error) {
    console.error("Error getting SEO settings from Firestore: ", error);
    // Return null to allow fallback to default values in case of config error
    return null;
  }
}

/**
 * Updates SEO settings in Firestore. Creates the document if it doesn't exist.
 * @param data - The SEO data to save.
 */
export async function updateSEOSettings(data: SEOData): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db) {
    throw new Error("Layanan database tidak tersedia. Konfigurasi Firebase tidak lengkap.");
  }
  
  try {
    const seoSettingsRef = doc(db, SEO_DOC_PATH);
    // Use setDoc with merge:true to create or update the document.
    await setDoc(seoSettingsRef, data, { merge: true });
  } catch (error: any) {
    throw new Error(`Gagal memperbarui pengaturan SEO: ${error.message}`);
  }
}
