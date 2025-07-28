
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';
import { uploadImageToCloudinary } from './image-hosting';
import { revalidatePath } from 'next/cache';


export interface GalleryImage {
  id: string;
  name: string;
  url: string;
  createdAt: string; // Changed to string for serialization
  category: 'Gambar' | 'Video' | 'Lain-lain';
  fileType: string;
}

export interface GalleryImageInput {
  name: string;
  url: string;
  category: 'Gambar' | 'Video' | 'Lain-lain';
  fileType: string;
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
    fileType: data.fileType || 'unknown',
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
  const app = getAdminApp();
  if (!app) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  const db = getFirestore(app);
  try {
    const docData = {
        name: imageData.name,
        url: imageData.url,
        category: imageData.category,
        fileType: imageData.fileType,
        createdAt: FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('galleryImages').add(docData);
    
    revalidatePath('/dashboard/gallery');
    revalidatePath('/galeri');

    return docRef.id;
  } catch (error: any) {
    console.error("Error adding gallery image record:", error);
    throw new Error(`Gagal menyimpan riwayat media: ${error.message}`);
  }
};


/**
 * Orchestrates the entire process of uploading an image or video, categorizing it,
 * and saving a record to the gallery in Firestore.
 * @param source The media source, which must be a File object.
 * @param fileName The name to be used for the media file record.
 * @returns A promise that resolves with the public URL of the uploaded media.
 */
export const uploadImageAndCreateGalleryRecord = async (source: File, fileName: string): Promise<string> => {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  try {
    // 1. Upload to external host (Cloudinary)
    const publicUrl = await uploadImageToCloudinary(source);
    
    // 2. Determine category based on file type
    const fileType = source.type;
    let category: 'Gambar' | 'Video' | 'Lain-lain';
    if (fileType.startsWith('image/')) {
        category = 'Gambar';
    } else if (fileType.startsWith('video/')) {
        category = 'Video';
    } else {
        category = 'Lain-lain';
    }

    // 3. Save metadata record to Firestore (this also revalidates paths)
    await addGalleryImageRecord({
        name: fileName,
        url: publicUrl,
        category: category,
        fileType: fileType
    });
    
    // 4. Return the public URL for the client to use
    return publicUrl;

  } catch (e: any) {
    console.error(`Error in uploadImageAndCreateGalleryRecord: ${e.message}`);
    // Re-throw a more user-friendly error
    throw new Error(`Gagal mengunggah media dan menyimpan riwayat: ${e.message}`);
  }
};


/**
 * Retrieves all images from the 'galleryImages' collection in Firestore.
 * @returns A promise that resolves with an array of gallery images.
 */
export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  const app = getAdminApp();
  if (!app) {
    console.warn("getGalleryImages: Firebase Admin not configured. Returning empty array.");
    return [];
  }
  const db = getFirestore(app);
  try {
    const q = db.collection('galleryImages').orderBy("createdAt", "desc");
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(toGalleryImage);
  } catch (e: any) {
    console.error("Error fetching gallery images:", e);
    return [];
  }
};

/**
 * Deletes an image metadata from Firestore.
 * This does not delete the image from the external host.
 * @param id The Firestore document ID of the image metadata.
 */
export const deleteGalleryImage = async (id: string): Promise<void> => {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  const db = getFirestore(app);
  try {
    const docRef = db.collection('galleryImages').doc(id);
    await docRef.delete();
    
    revalidatePath('/dashboard/gallery');
    revalidatePath('/galeri');

  } catch (error: any)
{
    console.error("Error deleting gallery image:", error);
    throw new Error(`Gagal menghapus riwayat gambar: ${error.message}`);
  }
};
