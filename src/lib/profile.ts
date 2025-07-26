
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
  deleteDoc
} from 'firebase/firestore';

// Define types for profile data
export interface ProfileContent {
  about: string;
  vision: string;
  mission: string;
}

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

// Default content to be used if the profile document doesn't exist yet.
export const defaultProfileContent: ProfileContent = {
  about: "Unit Kegiatan Mahasiswa Pondok Lanjut Usia (UKM PONJA) adalah sebuah organisasi mahasiswa yang berdedikasi untuk memberikan kontribusi positif kepada masyarakat, khususnya para lansia. Kami percaya bahwa setiap individu, tanpa memandang usia, berhak mendapatkan kualitas hidup yang baik, perhatian, dan kebahagiaan.",
  vision: "Menjadi wadah bagi mahasiswa untuk mengembangkan kepedulian sosial dan menjadi pelopor dalam upaya peningkatan kesejahteraan lansia.",
  mission: "Menyelenggarakan kegiatan-kegiatan yang bermanfaat seperti pemeriksaan kesehatan rutin, senam bersama, penyuluhan, serta kegiatan rekreasi untuk menjaga kesehatan fisik dan mental para lansia."
};

/**
 * Retrieves the main profile content from Firestore.
 * If the document doesn't exist, it returns the default content without writing to the DB.
 * This prevents permission errors for unauthenticated users.
 * @returns A promise that resolves with the profile content.
 */
export const getProfileContent = async (): Promise<ProfileContent> => {
  try {
    const docSnap = await getDoc(profileDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProfileContent;
    } else {
      // Document does not exist, return default content without trying to create it here.
      return defaultProfileContent;
    }
  } catch (e: any) {
    console.error("Error getting profile content: ", e);
    // Throw an error to be handled by the calling component (e.g., ProfilePage)
    throw new Error('Gagal mengambil data profil.');
  }
};


/**
 * Creates or updates the main profile content in Firestore using set with merge.
 * This will create the document if it doesn't exist, or update it if it does.
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
 * Retrieves all team members from Firestore.
 * @returns A promise that resolves with an array of team members.
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const querySnapshot = await getDocs(teamMembersCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TeamMember));
  } catch (e: any)
    {
    console.error("Error getting team members: ", e);
    throw new Error('Gagal mengambil daftar anggota tim.');
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
