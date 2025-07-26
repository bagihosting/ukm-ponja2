
import { 
  db,
  storage
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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

if (!db || !storage) {
  throw new Error("Firebase has not been initialized. Make sure your .env file is set up correctly.");
}

const galleryCollection = collection(db, 'galleryImages');

export interface GalleryImage {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  createdAt: Timestamp;
}

/**
 * Uploads an image file to Firebase Storage and saves its metadata to Firestore.
 * @param file The image file to upload.
 * @returns A promise that resolves with the metadata of the newly added image.
 */
export const uploadGalleryImage = async (file: File): Promise<GalleryImage> => {
  try {
    // 1. Create a unique path in Firebase Storage
    const storagePath = `gallery/${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, storagePath);

    // 2. Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // 3. Get the public URL
    const url = await getDownloadURL(snapshot.ref);

    // 4. Save metadata to Firestore
    const docData = {
      name: file.name,
      url: url,
      storagePath: storagePath,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(galleryCollection, docData);

    return {
      id: docRef.id,
      ...docData,
      createdAt: new Timestamp(new Date().getTime() / 1000, 0) // Approximate timestamp
    } as GalleryImage;

  } catch (e) {
    console.error("Error uploading image: ", e);
    throw new Error("Gagal mengunggah gambar ke Firebase.");
  }
};

/**
 * Retrieves all images from the 'galleryImages' collection in Firestore, ordered by creation date.
 * @returns A promise that resolves with an array of gallery images.
 */
export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const q = query(galleryCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryImage));
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw new Error("Gagal mengambil daftar gambar dari Firebase.");
  }
};

/**
 * Deletes an image from Firebase Storage and its metadata from Firestore.
 * @param id The Firestore document ID of the image metadata.
 * @param storagePath The path of the image file in Firebase Storage.
 */
export const deleteGalleryImage = async (id: string, storagePath: string): Promise<void> => {
    try {
        // 1. Delete the file from Firebase Storage
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);

        // 2. Delete the document from Firestore
        const docRef = doc(db, 'galleryImages', id);
        await deleteDoc(docRef);

    } catch (e: any) {
        console.error("Error deleting image: ", e);
        // If file not found in storage, still try to delete from DB
        if (e.code === 'storage/object-not-found') {
            console.warn('File not found in storage, deleting from Firestore anyway.');
            const docRef = doc(db, 'galleryImages', id);
            await deleteDoc(docRef);
            return;
        }
        throw new Error("Gagal menghapus gambar dari Firebase.");
    }
};
