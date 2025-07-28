
'use server';

import { getFirestore } from 'firebase-admin/firestore';
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
  const db = getFirestore(getAdminApp());
  if (!db) {
    console.warn("getSEOSettings: Firebase Admin not configured. Returning null.");
    return null;
  }
  try {
    const seoSettingsRef = db.doc(SEO_DOC_PATH);
    const docSnap = await seoSettingsRef.get();
    
    if (docSnap.exists) {
      return docSnap.data() as SEOData;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching SEO settings:", error);
    return null;
  }
}

/**
 * Updates SEO settings in Firestore. Creates the document if it doesn't exist.
 * @param data - The SEO data to save.
 */
export async function updateSEOSettings(data: SEOData): Promise<void> {
  const db = getFirestore(getAdminApp()!);
  if (!db) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  try {
    const seoSettingsRef = db.doc(SEO_DOC_PATH);
    // Use setDoc with merge:true to create or update the document.
    await seoSettingsRef.set(data, { merge: true });
  } catch (error: any) {
    console.error("Error updating SEO settings:", error);
    throw new Error(`Gagal memperbarui pengaturan SEO: ${error.message}`);
  }
}
