
'use server';

import { getFirebaseServices } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
}

/**
 * Retrieves SEO settings from Firestore.
 * @returns A promise that resolves with the SEO data, or null if it doesn't exist.
 */
export async function getSEOSettings(): Promise<SEOData | null> {
  try {
    const { db } = getFirebaseServices();
    const seoSettingsRef = doc(db, 'settings', 'seo');
    const docSnap = await getDoc(seoSettingsRef);
    if (docSnap.exists()) {
      return docSnap.data() as SEOData;
    }
    return null;
  } catch (error) {
    console.error("Error getting SEO settings: ", error);
    // Return null to allow fallback to default values in case of config error
    return null;
  }
}

/**
 * Updates SEO settings in Firestore.
 * @param data - The SEO data to save.
 */
export async function updateSEOSettings(data: SEOData): Promise<void> {
  const { db } = getFirebaseServices();
  const seoSettingsRef = doc(db, 'settings', 'seo');
  try {
    // Use setDoc with merge:true to create the document if it doesn't exist,
    // or update it if it does.
    await setDoc(seoSettingsRef, data, { merge: true });
  } catch (error: any) {
    console.error("Error updating SEO settings: ", error);
    throw new Error(`Gagal memperbarui pengaturan SEO: ${error.message}`);
  }
}
