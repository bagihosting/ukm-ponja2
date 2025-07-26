
'use server';

import { 
  db
} from './firebase'; 
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc,
} from 'firebase/firestore';
import type { ProfileContent } from './constants';
import { defaultProfileContent } from './constants';

const profileCollection = collection(db, 'profile');
const profileDocRef = doc(profileCollection, 'main'); // Use a known ID 'main'


/**
 * Retrieves the main profile content from Firestore.
 * If the document doesn't exist, it returns the default (empty) content without writing to the DB.
 * @returns A promise that resolves with the profile content.
 */
export const getProfileContent = async (): Promise<ProfileContent> => {
  try {
    const docSnap = await getDoc(profileDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProfileContent;
    } else {
      // Document does not exist, return default content.
      return defaultProfileContent;
    }
  } catch (e: any) {
    console.error("Error getting profile content: ", e);
    throw new Error('Gagal mengambil konten profil.');
  }
};


/**
 * Creates or updates the main profile content in Firestore.
 * This should only be called by an authenticated admin user from the dashboard.
 * @param content The profile content to save.
 */
export const updateProfileContent = async (content: Partial<ProfileContent>): Promise<void> => {
  try {
    // setDoc with merge: true will create the document if it doesn't exist,
    // or update the fields if it does. This is robust for our use case.
    await setDoc(profileDocRef, content, { merge: true });
  } catch (e: any) {
    console.error("Error updating profile content: ", e);
    throw new Error('Gagal memperbarui konten profil.');
  }
};
