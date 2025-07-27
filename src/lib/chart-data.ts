
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';
import { revalidatePath } from 'next/cache';

export interface ChartData {
  targetData: string;
}

const CHART_DATA_DOC_PATH = 'settings/chartData';

/**
 * Retrieves chart data from Firestore.
 * @returns A promise that resolves with the chart data, or null if it doesn't exist or on error.
 */
export async function getChartData(): Promise<ChartData | null> {
  try {
    const db = getFirestore(getAdminApp());
    const chartDataRef = db.doc(CHART_DATA_DOC_PATH);
    const docSnap = await chartDataRef.get();
    
    if (docSnap.exists) {
      return docSnap.data() as ChartData;
    }
    return null;
  } catch (error: any) {
    if (error.message.includes('Firebase Admin credentials')) {
        console.warn("Firebase Admin credentials not set, returning null for getChartData.");
    } else {
        console.error("Error fetching chart data:", error);
    }
    return null;
  }
}

/**
 * Updates chart data in Firestore. Creates the document if it doesn't exist.
 * @param data - The chart data to save.
 */
export async function updateChartData(data: ChartData): Promise<void> {
  try {
    const db = getFirestore(getAdminApp());
    const chartDataRef = db.doc(CHART_DATA_DOC_PATH);
    await chartDataRef.set(data, { merge: true });
    
    // Revalidate the home page to show updated chart
    revalidatePath('/');
    
  } catch (error: any) {
    if (error.message.includes('Firebase Admin credentials')) {
      console.warn(`[Firebase Warning] ${error.message}`);
      throw new Error('Konfigurasi server Firebase tidak ditemukan.');
    }
    throw error;
  }
}
