
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';
import type { ProgramCategory } from './constants';
import { revalidatePath } from 'next/cache';


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

function toProgram(docSnap: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>): Program {
  const data = docSnap.data();
  if (!data) throw new Error("Document data is empty");
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
  const db = getFirestore(getAdminApp()!);
  if (!db) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  try {
    const dataToAdd: { [key: string]: any } = {
      ...program,
      createdAt: FieldValue.serverTimestamp(),
    };
      
    if (!dataToAdd.imageUrl) delete dataToAdd.imageUrl;
    if (!dataToAdd.personInChargeName) delete dataToAdd.personInChargeName;
    if (!dataToAdd.personInChargePhotoUrl) delete dataToAdd.personInChargePhotoUrl;
    
    const docRef = await db.collection('programs').add(dataToAdd);

    revalidatePath('/');
    revalidatePath('/dashboard/programs');
    revalidatePath('/program-ukm');

    return docRef.id;
  } catch (error: any) {
    console.error("Error adding program:", error);
    throw new Error(`Gagal menambahkan program: ${error.message}`);
  }
};

// Read all
export async function getPrograms(): Promise<Program[]> {
  const db = getFirestore(getAdminApp());
  if (!db) {
    console.warn("getPrograms: Firebase Admin not configured. Returning empty array.");
    return [];
  }
  try {
    const q = db.collection('programs').orderBy("name", "asc");
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(toProgram);
  } catch (e: any) {
    console.error("Error fetching programs:", e);
    return [];
  }
};

// Read one
export async function getProgram(id: string): Promise<Program | null> {
  const db = getFirestore(getAdminApp());
  if (!db) {
    console.warn(`getProgram(${id}): Firebase Admin not configured. Returning null.`);
    return null;
  }
  try {
    const docRef = db.collection('programs').doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return toProgram(docSnap);
    } else {
      return null;
    }
  } catch (e: any) {
    console.error(`Error fetching program ${id}:`, e);
    return null;
  }
};

// Update
export async function updateProgram(id: string, program: ProgramUpdateInput): Promise<void> {
  const db = getFirestore(getAdminApp()!);
  if (!db) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  try {
    const docRef = db.collection('programs').doc(id);
      
    const dataToUpdate: { [key: string]: any } = { ...program };

    if (program.imageUrl === null || program.imageUrl === '') {
        dataToUpdate.imageUrl = FieldValue.delete();
    }
    if (program.personInChargeName === null || program.personInChargeName === '') {
        dataToUpdate.personInChargeName = FieldValue.delete();
    }
    if (program.personInChargePhotoUrl === null || program.personInChargePhotoUrl === '') {
        dataToUpdate.personInChargePhotoUrl = FieldValue.delete();
    }
      
    if (Object.keys(dataToUpdate).length > 0) {
      await docRef.update(dataToUpdate);
    }

    revalidatePath('/');
    revalidatePath('/dashboard/programs');
    revalidatePath('/program-ukm');

  } catch (error: any) {
    console.error("Error updating program:", error);
    throw new Error(`Gagal memperbarui program: ${error.message}`);
  }
};


// Delete
export async function deleteProgram(id: string): Promise<void> {
  const db = getFirestore(getAdminApp()!);
  if (!db) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  try {
    const docRef = db.collection('programs').doc(id);
    await docRef.delete();

    revalidatePath('/');
    revalidatePath('/dashboard/programs');
    revalidatePath('/program-ukm');
    
  } catch (error: any) {
    console.error("Error deleting program:", error);
    throw new Error(`Gagal menghapus program: ${error.message}`);
  }
}
