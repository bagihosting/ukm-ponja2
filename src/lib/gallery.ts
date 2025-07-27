
'use server';

import { 
  db
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


if (!db) {
  throw new Error("Firebase has not been initialized. Make sure your .env file is set up correctly.");
}

const galleryCollection = collection(db, 'galleryImages');

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
    // Convert Timestamp to ISO string for safe serialization
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
 * The categorization logic has been moved to the calling components.
 * @param imageData The data for the new image record, including the category.
 * @returns The ID of the newly created document.
 */
export const addGalleryImageRecord = async (imageData: GalleryImageInput): Promise<string> => {
    try {
        const docData = {
            name: imageData.name,
            url: imageData.url,
            category: imageData.category || 'Lain-lain', // Fallback just in case
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(galleryCollection, docData);
        return docRef.id;
    } catch (e: any) {
        console.error("Error adding document to gallery: ", e);
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
  try {
    // 1. Convert file to data URI
    const dataUri = await fileToDataUri(file);

    // 2. Upload to external host (freeimage.host)
    const url = await uploadImageToFreeImage(dataUri);
    
    // 3. Categorize the image
    const category = await categorizeImage({ imageUrl: url });

    // 4. Save metadata to Firestore
    return await addGalleryImageRecord({
        name: file.name,
        url: url,
        category: category,
    });
  } catch (e: any) {
    console.error("Error uploading image and saving to Firestore: ", e);
    throw new Error(`Gagal mengunggah gambar dan menyimpan riwayat: ${e.message}`);
  }
};

/**
 * Retrieves all images from the 'galleryImages' collection in Firestore.
 * @returns A promise that resolves with an array of gallery images.
 */
export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const q = query(galleryCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toGalleryImage);
  } catch (e: any) {
    console.error("Error getting documents: ", e);
    // On failure, return an empty array to prevent the page from crashing.
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
        const docRef = doc(db, 'galleryImages', id);
        await deleteDoc(docRef);
    } catch (e: any) {
        console.error("Error deleting image metadata: ", e);
        throw new Error(`Gagal menghapus riwayat gambar dari Firebase: ${e.message}`);
    }
};
