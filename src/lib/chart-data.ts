
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';

export interface ChartData {
  targetData: string;
}

const CHART_DOC_PATH = 'settings/charts';

/**
 * Retrieves chart settings from Firestore.
 * @returns A promise that resolves with the chart data, or null if it doesn't exist or on error.
 */
export async function getChartData(): Promise<ChartData | null> {
  const app = getAdminApp();
  if (!app) {
    console.warn("getChartData: Firebase Admin not configured. Returning null.");
    return null;
  }
  const db = getFirestore(app);
  try {
    const chartDataRef = db.doc(CHART_DOC_PATH);
    const docSnap = await chartDataRef.get();
    
    if (docSnap.exists) {
      return docSnap.data() as ChartData;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching chart settings:", error);
    return null;
  }
}

/**
 * Updates chart data in Firestore. Creates the document if it doesn't exist.
 * @param data - The chart data to save.
 */
export async function updateChartData(data: ChartData): Promise<void> {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  const db = getFirestore(app);
  try {
    const chartDataRef = db.doc(CHART_DOC_PATH);
    await chartDataRef.set(data, { merge: true });
  } catch (error: any) {
    console.error("Error updating chart data:", error);
    throw new Error(`Gagal memperbarui data grafik: ${error.message}`);
  }
}
