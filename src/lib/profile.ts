
'use server';

import { 
  db
} from './firebase'; 
import { 
  doc, 
  getDoc, 
  setDoc,
} from 'firebase/firestore';
import type { ProfileContent } from './constants';
import { defaultProfileContent } from './constants';

// Use a known ID 'main' for the single profile document.
const profileDocRef = doc(db, 'profile', 'main');

/**
 * Retrieves the main profile content from Firestore.
 * If the document doesn't exist, it returns the default content.
 * @returns A promise that resolves with the profile content.
 */
export const getProfileContent = async (): Promise<ProfileContent> => {
  try {
    const docSnap = await getDoc(profileDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProfileContent;
    } else {
      // Document does not exist, return default content.
      // The document will be created on the first admin update.
      return defaultProfileContent;
    }
  } catch (e: any) {
    console.error("Error getting profile content: ", e);
    throw new Error('Gagal mengambil konten profil dari database.');
  }
};


/**
 * Creates or updates the main profile content in Firestore.
 * @param content The profile content to save.
 */
export const updateProfileContent = async (content: Partial<ProfileContent>): Promise<void> => {
  try {
    // setDoc with merge: true will create the document if it doesn't exist,
    // or update the specified fields if it does. This is robust and safe.
    await setDoc(profileDocRef, content, { merge: true });
  } catch (e: any) {
    console.error("Error updating profile content: ", e);
    throw new Error('Gagal memperbarui konten profil di database.');
  }
};
