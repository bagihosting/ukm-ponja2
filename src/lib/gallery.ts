
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';
import { uploadImageToCloudinary } from './image-hosting';
import { categorizeImage } from '@/ai/flows/categorize-image-flow';
import { revalidatePath } from 'next/cache';


export interface GalleryImage {
  id: string;
  name: string;
  url: string;
  createdAt: string; // Changed to string for serialization
  category: string;
}

export interface GalleryImageInput {
  name: string;
  url: string;
  category: string;
}

// Helper to convert Firestore doc to a client-safe GalleryImage object
function toGalleryImage(docSnap: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>): GalleryImage {
  const data = docSnap.data();
  if (!data) throw new Error("Document data is empty");
  return {
    id: docSnap.id,
    name: data.name,
    url: data.url,
    category: data.category || 'Lain-lain',
    // Convert Timestamp to ISO string for safe serialization, with a fallback
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

/**
 * Adds a new gallery image record to Firestore.
 * This function is now simpler and only handles saving data.
 * @param imageData The data for the new image record, including the category.
 * @returns The ID of the newly created document.
 */
export const addGalleryImageRecord = async (imageData: GalleryImageInput): Promise<string> => {
  try {
    const db = getFirestore(getAdminApp());

    const docData = {
        name: imageData.name,
        url: imageData.url,
        category: imageData.category || 'Lain-lain', // Fallback just in case
        createdAt: FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('galleryImages').add(docData);
    
    revalidatePath('/dashboard/gallery');
    revalidatePath('/galeri');

    return docRef.id;
  } catch (error: any) {
    if (error.message.includes('Firebase Admin credentials')) {
      console.warn(`[Firebase Warning] ${error.message}`);
      throw new Error('Konfigurasi server Firebase tidak ditemukan.');
    }
    throw error;
  }
};


/**
 * Uploads an image file to Cloudinary and saves its metadata to Firestore.
 * This function orchestrates the entire upload process, including categorization.
 * @param file The image file to upload.
 * @returns A promise that resolves with the metadata of the newly added image.
 */
export const uploadGalleryImage = async (file: File): Promise<string> => {
  try {
    // 1. Upload to external host (Cloudinary) using the File object directly
    const url = await uploadImageToCloudinary(file);
    
    // 2. Categorize the image using its public URL
    const category = await categorizeImage({ imageUrl: url });

    // 3. Save metadata to Firestore (this will also revalidate the path)
    const recordId = await addGalleryImageRecord({
        name: file.name,
        url: url,
        category: category,
    });
    
    return recordId;

  } catch (e: any) {
    throw new Error(`Gagal mengunggah gambar dan menyimpan riwayat: ${e.message}`);
  }
};

/**
 * Retrieves all images from the 'galleryImages' collection in Firestore.
 * @returns A promise that resolves with an array of gallery images.
 */
export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const db = getFirestore(getAdminApp());
    const q = db.collection('galleryImages').orderBy("createdAt", "desc");
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(toGalleryImage);
  } catch (e: any) {
    if (e.message.includes('Firebase Admin credentials')) {
        console.warn("Firebase Admin credentials not set, returning empty array for getGalleryImages. This is expected during local development or build if server env vars are not set.");
    } else {
        console.error("Error fetching gallery images:", e);
    }
    return [];
  }
};

/**
 * Deletes an image metadata from Firestore.
 * This does not delete the image from the external host.
 * @param id The Firestore document ID of the image metadata.
 */
export const deleteGalleryImage = async (id: string): Promise<void> => {
  try {
    const db = getFirestore(getAdminApp());
    const docRef = db.collection('galleryImages').doc(id);
    await docRef.delete();
    
    revalidatePath('/dashboard/gallery');
    revalidatePath('/galeri');

  } catch (error: any)
{
    if (error.message.includes('Firebase Admin credentials')) {
      console.warn(`[Firebase Warning] ${error.message}`);
      throw new Error('Konfigurasi server Firebase tidak ditemukan.');
    }
    throw error;
  }
};
