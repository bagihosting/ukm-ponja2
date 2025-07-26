
'use server';

import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

if (!db) {
  console.error("Firebase has not been initialized. Make sure your .env file is set up correctly. SEO functions will not work.");
}

const seoSettingsRef = doc(db, 'settings', 'seo');

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
  if (!db) return null;
  try {
    const docSnap = await getDoc(seoSettingsRef);
    if (docSnap.exists()) {
      return docSnap.data() as SEOData;
    }
    return null;
  } catch (error) {
    console.error("Error getting SEO settings: ", error);
    // Return null to allow fallback to default values
    return null;
  }
}

/**
 * Updates SEO settings in Firestore.
 * @param data - The SEO data to save.
 */
export async function updateSEOSettings(data: SEOData): Promise<void> {
  if (!db) throw new Error("Koneksi Firebase gagal. Tidak dapat memperbarui pengaturan SEO.");
  try {
    // Use setDoc with merge:true to create the document if it doesn't exist,
    // or update it if it does.
    await setDoc(seoSettingsRef, data, { merge: true });
  } catch (error: any) {
    console.error("Error updating SEO settings: ", error);
    throw new Error(`Gagal memperbarui pengaturan SEO: ${error.message}`);
  }
}
