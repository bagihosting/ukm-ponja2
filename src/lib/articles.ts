
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';

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
  try {
    const db = getFirestore(getAdminApp());

    const dataToAdd: { [key: string]: any } = {
      ...article,
      createdAt: FieldValue.serverTimestamp(),
    };
    
    // Ensure optional fields are not 'undefined'
    if (!dataToAdd.imageUrl) {
      delete dataToAdd.imageUrl;
    }
      
    const docRef = await db.collection('articles').add(dataToAdd);
    return docRef.id;
  } catch (error: any) {
    if (error.message.includes('Firebase Admin credentials')) {
      console.warn(`[Firebase Warning] ${error.message}`);
      throw new Error('Konfigurasi server Firebase tidak ditemukan.');
    }
    throw error;
  }
};


// Read all
export const getArticles = async (): Promise<Article[]> => {
  try {
    const db = getFirestore(getAdminApp());
    const q = db.collection('articles').orderBy("createdAt", "desc");
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(toArticle);
  } catch (e: any) {
    if (e.message.includes('Firebase Admin credentials')) {
        console.warn("Firebase Admin credentials not set, returning empty array for getArticles. This is expected during local development or build if server env vars are not set.");
    } else {
        console.error("Error fetching articles:", e);
    }
    return [];
  }
};

// Read one
export const getArticle = async (id: string): Promise<Article | null> => {
  try {
    const db = getFirestore(getAdminApp());
    const docRef = db.collection('articles').doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return toArticle(docSnap);
    } else {
      return null;
    }
  } catch (e: any) {
    if (e.message.includes('Firebase Admin credentials')) {
        console.warn(`Firebase Admin credentials not set, returning null for getArticle(${id}).`);
    } else {
        console.error(`Error fetching article ${id}:`, e);
    }
    return null;
  }
};

// Update
export const updateArticle = async (id: string, article: ArticleUpdateInput): Promise<void> => {
  try {
    const db = getFirestore(getAdminApp());
    const docRef = db.collection('articles').doc(id);
    
    const dataToUpdate: { [key: string]: any } = { ...article };

    // Handle imageUrl separately for deletion. Use FieldValue.delete() for robust removal.
    if (article.imageUrl === '' || article.imageUrl === null) {
      dataToUpdate.imageUrl = FieldValue.delete();
    }
    
    // Only update if there's something to update
    if (Object.keys(dataToUpdate).length > 0) {
      await docRef.update(dataToUpdate);
    }
  } catch (error: any) {
    if (error.message.includes('Firebase Admin credentials')) {
      console.warn(`[Firebase Warning] ${error.message}`);
      throw new Error('Konfigurasi server Firebase tidak ditemukan.');
    }
    throw error;
  }
};


// Delete
export const deleteArticle = async (id: string): Promise<void> => {
  try {
    const db = getFirestore(getAdminApp());
    const docRef = db.collection('articles').doc(id);
    await docRef.delete();
  } catch (error: any) {
    if (error.message.includes('Firebase Admin credentials')) {
      console.warn(`[Firebase Warning] ${error.message}`);
      throw new Error('Konfigurasi server Firebase tidak ditemukan.');
    }
    throw error;
  }
};

