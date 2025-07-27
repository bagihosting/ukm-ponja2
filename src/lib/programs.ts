
'use server';

import { 
  getFirebaseServices
} from './firebase'; 
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  deleteField,
  query,
  orderBy
} from 'firebase/firestore';
import type { ProgramCategory } from './constants';


export interface Program {
  id: string;
  name: string;
  category: ProgramCategory;
  description: string;
  imageUrl?: string;
  personInChargeName?: string;
  personInChargePhotoUrl?: string;
  createdAt: string; 
}

export interface ProgramInput {
  name: string;
  category: ProgramCategory;
  description: string;
  imageUrl?: string;
  personInChargeName?: string;
  personInChargePhotoUrl?: string;
}

export interface ProgramUpdateInput {
  name?: string;
  category?: ProgramCategory;
  description?: string;
  imageUrl?: string | null; // Allow null for deletion
  personInChargeName?: string | null;
  personInChargePhotoUrl?: string | null;
}

function toProgram(docSnap: any): Program {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    category: data.category,
    description: data.description,
    imageUrl: data.imageUrl,
    personInChargeName: data.personInChargeName,
    personInChargePhotoUrl: data.personInChargePhotoUrl,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

// Create
export async function addProgram(program: ProgramInput): Promise<string> {
  const { db } = getFirebaseServices();
  if (!db) {
    console.error("Firebase has not been initialized. Program functions will not work.");
    throw new Error("Layanan database tidak tersedia.");
  }
  
  const programsCollection = collection(db, 'programs');
  try {
    const dataToAdd: { [key: string]: any } = {
      name: program.name,
      category: program.category,
      description: program.description,
      createdAt: serverTimestamp(),
    };
    
    if (program.imageUrl && program.imageUrl.trim() !== '') {
        dataToAdd.imageUrl = program.imageUrl;
    }
    if (program.personInChargeName && program.personInChargeName.trim() !== '') {
        dataToAdd.personInChargeName = program.personInChargeName;
    }
    if (program.personInChargePhotoUrl && program.personInChargePhotoUrl.trim() !== '') {
        dataToAdd.personInChargePhotoUrl = program.personInChargePhotoUrl;
    }
    
    const docRef = await addDoc(programsCollection, dataToAdd);
    return docRef.id;
  } catch (e: any) {
    console.error("Error adding program: ", e);
    throw new Error(`Gagal menambahkan program: ${e.message}`);
  }
};

// Read all
export async function getPrograms(): Promise<Program[]> {
  const { db } = getFirebaseServices();
  if (!db) {
    console.error("Firebase has not been initialized. Program functions will not work.");
    return [];
  }

  try {
    const programsCollection = collection(db, 'programs');
    const q = query(programsCollection, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toProgram);
  } catch (e: any) {
    console.error("Error getting programs: ", e);
    return [];
  }
};

// Read one
export async function getProgram(id: string): Promise<Program | null> {
  const { db } = getFirebaseServices();
  if (!db) {
    console.error("Firebase has not been initialized. Program functions will not work.");
    return null;
  }

  try {
    const docRef = doc(db, 'programs', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return toProgram(docSnap);
    } else {
      console.log("No such program document!");
      return null;
    }
  } catch (e: any)
    {
    console.error("Error getting program: ", e);
    throw new Error(`Gagal mengambil data program: ${e.message}`);
  }
};

// Update
export async function updateProgram(id: string, program: ProgramUpdateInput): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db) {
    console.error("Firebase has not been initialized. Program functions will not work.");
    throw new Error("Layanan database tidak tersedia.");
  }
  
  try {
    const docRef = doc(db, 'programs', id);
    
    const dataToUpdate: { [key: string]: any } = {};

    // Assign only defined, non-null fields to the update object
    if (program.name !== undefined) dataToUpdate.name = program.name;
    if (program.category !== undefined) dataToUpdate.category = program.category;
    if (program.description !== undefined) dataToUpdate.description = program.description;
    
    // Handle optional fields that can be added, updated, or deleted
    if (program.imageUrl === null || program.imageUrl === '') {
        dataToUpdate.imageUrl = deleteField();
    } else if (program.imageUrl) {
        dataToUpdate.imageUrl = program.imageUrl;
    }

    if (program.personInChargeName === null || program.personInChargeName === '') {
        dataToUpdate.personInChargeName = deleteField();
    } else if (program.personInChargeName) {
        dataToUpdate.personInChargeName = program.personInChargeName;
    }

    if (program.personInChargePhotoUrl === null || program.personInChargePhotoUrl === '') {
        dataToUpdate.personInChargePhotoUrl = deleteField();
    } else if (program.personInChargePhotoUrl) {
        dataToUpdate.personInChargePhotoUrl = program.personInChargePhotoUrl;
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
      await updateDoc(docRef, dataToUpdate);
    }

  } catch (e: any) {
    console.error("Error updating program: ", e);
    throw new Error(`Gagal memperbarui program: ${e.message}`);
  }
};


// Delete
export async function deleteProgram(id: string): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db) {
    console.error("Firebase has not been initialized. Program functions will not work.");
    throw new Error("Layanan database tidak tersedia.");
  }

  try {
    const docRef = doc(db, 'programs', id);
    await deleteDoc(docRef);
  } catch (e: any) {
    console.error("Error deleting program: ", e);
    throw new Error(`Gagal menghapus program: ${e.message}`);
  }
};
