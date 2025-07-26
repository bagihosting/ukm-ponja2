
'use server';

import { 
  db
} from './firebase'; 
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  query
} from 'firebase/firestore';
import type { ProfileContent } from './constants';
import { defaultProfileContent } from './constants';


// Define types for profile data that include an ID
export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface TeamMemberInput {
  name: string;
  role: string;
}

const profileCollection = collection(db, 'profile');
const teamMembersCollection = collection(db, 'teamMembers');
const profileDocRef = doc(profileCollection, 'main'); // Use a known ID 'main'


/**
 * Retrieves the main profile content from Firestore.
 * If the document doesn't exist, it creates it with default content and returns it.
 * @returns A promise that resolves with the profile content.
 */
export const getProfileContent = async (): Promise<ProfileContent> => {
  try {
    const docSnap = await getDoc(profileDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProfileContent;
    } else {
      // Document does not exist, create it with default content.
      await setDoc(profileDocRef, defaultProfileContent);
      return defaultProfileContent;
    }
  } catch (e: any) {
    console.error("Error getting or creating profile content: ", e);
    // In case of error, returning default content can be a fallback,
    // though throwing an error is better to signal a problem.
    throw new Error('Gagal mengambil atau membuat konten profil.');
  }
};


/**
 * Creates or updates the main profile content in Firestore using set with merge.
 * This should only be called by an authenticated admin user.
 * @param content The profile content to save.
 */
export const updateProfileContent = async (content: Partial<ProfileContent>): Promise<void> => {
  try {
    // setDoc with merge: true will create the document if it doesn't exist,
    // or update the fields if it does. This is perfect for our use case.
    await setDoc(profileDocRef, content, { merge: true });
  } catch (e: any) {
    console.error("Error updating profile content: ", e);
    throw new Error('Gagal memperbarui konten profil.');
  }
};


// --- Team Members Management ---

/**
 * Retrieves all team members from Firestore, ordered by role.
 * Note: A composite index might be required in Firestore for this to work.
 * @returns A promise that resolves with an array of team members.
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const q = query(teamMembersCollection, orderBy("role"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TeamMember));
  } catch (e: any)
    {
    console.error("Error getting team members: ", e);
    // Fallback to fetching without ordering if index is missing
    try {
        const querySnapshot = await getDocs(teamMembersCollection);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as TeamMember));
    } catch (fallbackError: any) {
        console.error("Fallback fetch also failed:", fallbackError);
        throw new Error('Gagal mengambil daftar anggota tim.');
    }
  }
};

/**
 * Adds a new team member to Firestore.
 * @param memberData The data for the new team member (name and role).
 * @returns The ID of the newly created document.
 */
export const addTeamMember = async (memberData: TeamMemberInput): Promise<string> => {
  try {
    const docRef = await addDoc(teamMembersCollection, memberData);
    return docRef.id;
  } catch (e: any) {
    console.error("Error adding team member: ", e);
    throw new Error('Gagal menambahkan anggota tim.');
  }
};

/**
 * Updates an existing team member in Firestore.
 * @param id The document ID of the team member to update.
 * @param memberData The data to update (can be partial).
 */
export const updateTeamMember = async (id: string, memberData: Partial<TeamMemberInput>): Promise<void> => {
  try {
    const docRef = doc(db, 'teamMembers', id);
    await updateDoc(docRef, memberData);
  } catch (e: any) {
    console.error("Error updating team member: ", e);
    throw new Error('Gagal memperbarui anggota tim.');
  }
};

/**
 * Deletes a team member from Firestore.
 * @param id The document ID of the team member to delete.
 */
export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'teamMembers', id);
    await deleteDoc(docRef);
  } catch (e: any) {
    console.error("Error deleting team member: ", e);
    throw new Error('Gagal menghapus anggota tim.');
  }
};
