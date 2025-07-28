
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';
import { revalidatePath } from 'next/cache';

// This is the interface that will be exposed to client components
export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string; // Changed to string for serialization
}


export interface ArticleInput {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface ArticleUpdateInput {
  title?: string;
  content?: string;
  imageUrl?: string;
}

// Helper to convert Firestore doc to a client-safe Article object
function toArticle(docSnap: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>): Article {
  const data = docSnap.data();
  if (!data) throw new Error("Document data is empty");
  return {
    id: docSnap.id,
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl,
    // Convert Timestamp to ISO string for safe serialization, with a fallback
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

// Create
export const addArticle = async (article: ArticleInput): Promise<string> => {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  const db = getFirestore(app);
  try {
    const dataToAdd: { [key: string]: any } = {
      ...article,
      createdAt: FieldValue.serverTimestamp(),
    };
    
    if (!dataToAdd.imageUrl) {
      delete dataToAdd.imageUrl;
    }
      
    const docRef = await db.collection('articles').add(dataToAdd);
    
    revalidatePath('/');
    revalidatePath('/dashboard/articles');
    revalidatePath(`/artikel/${docRef.id}`);

    return docRef.id;
  } catch (error: any) {
    console.error("Error adding article:", error);
    throw new Error(`Gagal menambahkan artikel: ${error.message}`);
  }
};


// Read all
export const getArticles = async (): Promise<Article[]> => {
  const app = getAdminApp();
  if (!app) {
    console.warn("getArticles: Firebase Admin not configured. Returning empty array.");
    return [];
  }
  const db = getFirestore(app);
  try {
    const q = db.collection('articles').orderBy("createdAt", "desc");
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(toArticle);
  } catch (e: any) {
    console.error("Error fetching articles:", e);
    return [];
  }
};

// Read one
export const getArticle = async (id: string): Promise<Article | null> => {
  const app = getAdminApp();
  if (!app) {
    console.warn(`getArticle(${id}): Firebase Admin not configured. Returning null.`);
    return null;
  }
  const db = getFirestore(app);
  try {
    const docRef = db.collection('articles').doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return toArticle(docSnap);
    } else {
      return null;
    }
  } catch (e: any) {
    console.error(`Error fetching article ${id}:`, e);
    return null;
  }
};

// Update
export const updateArticle = async (id: string, article: ArticleUpdateInput): Promise<void> => {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  const db = getFirestore(app);
  try {
    const docRef = db.collection('articles').doc(id);
    
    const dataToUpdate: { [key: string]: any } = { ...article };

    if (article.imageUrl === '' || article.imageUrl === null) {
      dataToUpdate.imageUrl = FieldValue.delete();
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
      await docRef.update(dataToUpdate);
    }

    revalidatePath('/');
    revalidatePath('/dashboard/articles');
    revalidatePath(`/artikel/${id}`);

  } catch (error: any) {
    console.error("Error updating article:", error);
    throw new Error(`Gagal memperbarui artikel: ${error.message}`);
  }
};


// Delete
export const deleteArticle = async (id: string): Promise<void> => {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Konfigurasi server Firebase tidak ditemukan.');
  }
  const db = getFirestore(app);
  try {
    const docRef = db.collection('articles').doc(id);
    await docRef.delete();
    
    revalidatePath('/');
    revalidatePath('/dashboard/articles');
    revalidatePath(`/artikel/${id}`);

  } catch (error: any) {
    console.error("Error deleting article:", error);
    throw new Error(`Gagal menghapus artikel: ${error.message}`);
  }
};
