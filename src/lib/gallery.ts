
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
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { uploadImageToFreeImage } from './image-hosting';


if (!db) {
  throw new Error("Firebase has not been initialized. Make sure your .env file is set up correctly.");
}

const galleryCollection = collection(db, 'galleryImages');

export interface GalleryImage {
  id: string;
  name: string;
  url: string; // URL from freeimage.host
  createdAt: Timestamp;
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
 * Uploads an image file to freeimage.host and saves its metadata to Firestore.
 * @param file The image file to upload.
 * @returns A promise that resolves with the metadata of the newly added image.
 */
export const uploadGalleryImage = async (file: File): Promise<GalleryImage> => {
  try {
    // 1. Convert file to data URI
    const dataUri = await fileToDataUri(file);

    // 2. Upload to external host
    const url = await uploadImageToFreeImage(dataUri);

    // 3. Save metadata to Firestore
    const docData = {
      name: file.name,
      url: url,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(galleryCollection, docData);

    return {
      id: docRef.id,
      ...docData,
      createdAt: new Timestamp(new Date().getTime() / 1000, 0) // Approximate timestamp
    } as GalleryImage;

  } catch (e: any) {
    console.error("Error uploading image and saving to Firestore: ", e);
    throw new Error(`Gagal mengunggah gambar dan menyimpan riwayat: ${e.message}`);
  }
};

/**
 * Retrieves all images from the 'galleryImages' collection in Firestore.
 * NOTE: To enable server-side sorting, you must create a composite index in Firestore.
 * The error message in the browser console will usually provide a direct link to create it.
 * For now, sorting is done on the client-side as a fallback.
 * @returns A promise that resolves with an array of gallery images.
 */
export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    // Server-side ordering is removed to prevent index-not-found errors.
    // If you create the index, you can uncomment the line below and remove client-side sorting.
    // const q = query(galleryCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(galleryCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryImage));
  } catch (e: any) {
    console.error("Error getting documents: ", e);
    throw new Error(`Gagal mengambil daftar gambar dari Firebase: ${e.message}`);
  }
};

/**
 * Deletes an image metadata from Firestore.
 * @param id The Firestore document ID of the image metadata.
 */
export const deleteGalleryImage = async (id: string): Promise<void> => {
    try {
        // Delete the document from Firestore
        const docRef = doc(db, 'galleryImages', id);
        await deleteDoc(docRef);

    } catch (e: any) {
        console.error("Error deleting image metadata: ", e);
        throw new Error(`Gagal menghapus riwayat gambar dari Firebase: ${e.message}`);
    }
};
