
import { storage } from './firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image from a data URI to Firebase Storage.
 * @param dataUri The data URI of the image to upload.
 * @returns The public download URL of the uploaded image.
 */
export async function uploadImageFromDataUri(dataUri: string): Promise<string> {
  if (!storage) {
    throw new Error(
      'Firebase Storage tidak terkonfigurasi. Pastikan .env sudah benar.'
    );
  }

  // Extract content type and base64 data from data URI
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error('Format data URI tidak valid.');
  }

  const contentType = match[1]; // e.g., 'image/png'
  const base64Data = match[2];
  const fileExtension = contentType.split('/')[1];

  // Create a unique file name
  const fileName = `images/${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, fileName);

  try {
    // Upload the base64 string
    const snapshot = await uploadString(storageRef, base64Data, 'base64', {
      contentType: contentType,
    });

    // Get the public download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw new Error('Gagal mengunggah gambar