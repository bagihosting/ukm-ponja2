
'use server';

import { 
  getFirebaseServices
} from './firebase'; 
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { uploadImageToFreeImage } from './image-hosting';
import { categorizeImage } from '@/ai/flows/categorize-image-flow';


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
function toGalleryImage(docSnap: any): GalleryImage {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    url: data.url,
    category: data.category || 'Lain-lain',
    // Convert Timestamp to ISO string for safe serialization, with a fallback
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}


// Converts a File to a a data URI
function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Adds a new gallery image record to Firestore.
 * This function is now simpler and only handles saving data.
 * @param imageData The data for the new image record, including the category.
 * @returns The ID of the newly created document.
 */
export const addGalleryImageRecord = async (imageData: GalleryImageInput): Promise<string> => {
    const { db } = getFirebaseServices();
    if (!db) {
      throw new Error("Layanan database tidak tersedia. Konfigurasi Firebase tidak lengkap.");
    }

    try {
        const docData = {
            name: imageData.name,
            url: imageData.url,
            category: imageData.category || 'Lain-lain', // Fallback just in case
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'galleryImages'), docData);
        return docRef.id;
    } catch (e: any) {
        throw new Error(`Gagal menyimpan riwayat gambar ke Firestore: ${e.message}`);
    }
};


/**
 * Uploads an image file to freeimage.host and saves its metadata to Firestore.
 * This function orchestrates the entire upload process, including categorization.
 * @param file The image file to upload.
 * @returns A promise that resolves with the metadata of the newly added image.
 */
export const uploadGalleryImage = async (file: File): Promise<string> => {
  const { db } = getFirebaseServices();
  if (!db) {
    throw new Error("Layanan database tidak tersedia. Konfigurasi Firebase tidak lengkap.");
  }
  
  try {
    // 1. Upload to external host (freeimage.host) using the File object directly
    const url = await uploadImageToFreeImage(file);
    
    // 2. Categorize the image using its public URL
    const category = await categorizeImage({ imageUrl: url });

    // 3. Save metadata to Firestore
    return await addGalleryImageRecord({
        name: file.name,
        url: url,
        category: category,
    });
  } catch (e: any) {
    throw new Error(`Gagal mengunggah gambar dan menyimpan riwayat: ${e.message}`);
  }
};

/**
 * Retrieves all images from the 'galleryImages' collection in Firestore.
 * @returns A promise that resolves with an array of gallery images.
 */
export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  const { db } = getFirebaseServices();
  if (!db) {
    return [];
  }

  try {
    const q = query(collection(db, 'galleryImages'), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toGalleryImage);
  } catch (e: any) {
    console.error("Error getting gallery images from Firestore: ", e);
    return [];
  }
};

/**
 * Deletes an image metadata from Firestore.
 * This does not delete the image from the external host.
 * @param id The Firestore document ID of the image metadata.
 */
export const deleteGalleryImage = async (id: string): Promise<void> => {
    const { db } = getFirebaseServices();
    if (!db) {
      throw new Error("Layanan database tidak tersedia. Konfigurasi Firebase tidak lengkap.");
    }

    try {
        const docRef = doc(db, 'galleryImages', id);
        await deleteDoc(docRef);
    } catch (e: any) {
        throw new Error(`Gagal menghapus riwayat gambar dari Firebase: ${e.message}`);
    }
};
