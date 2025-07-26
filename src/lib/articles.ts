
'use server';

import { 
  db,
  auth
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
  Timestamp,
  deleteField,
  query,
  orderBy
} from 'firebase/firestore';


if (!db) {
  throw new Error("Firebase has not been initialized. Make sure your .env file is set up correctly.");
}

const articlesCollection = collection(db, 'articles');

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
function toArticle(docSnap: any): Article {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl,
    // Convert Timestamp to ISO string for safe serialization
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

// Create
export const addArticle = async (article: ArticleInput): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error('7 PERMISSION_DENIED: Autentikasi diperlukan untuk menambahkan artikel.');
  }

  try {
    const dataToAdd: { [key: string]: any } = {
      title: article.title,
      content: article.content,
      createdAt: serverTimestamp(),
    };
    
    if (article.imageUrl) {
        dataToAdd.imageUrl = article.imageUrl;
    }
    
    const docRef = await addDoc(articlesCollection, dataToAdd);
    return docRef.id;
  } catch (e: any) {
    console.error("Error adding document: ", e);
    throw new Error(`Gagal menambahkan artikel: ${e.message}`);
  }
};


// Read all
export const getArticles = async (): Promise<Article[]> => {
  try {
    const q = query(articlesCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toArticle);
  } catch (e: any) {
    console.error("Error getting documents: ", e);
    throw new Error(`Gagal mengambil daftar artikel: ${e.message}`);
  }
};

// Read one
export const getArticle = async (id: string): Promise<Article | null> => {
  try {
    const docRef = doc(db, 'articles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return toArticle(docSnap);
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e: any) {
    console.error("Error getting document: ", e);
    throw new Error(`Gagal mengambil data artikel: ${e.message}`);
  }
};

// Update
export const updateArticle = async (id: string, article: ArticleUpdateInput): Promise<void> => {
   if (!auth.currentUser) {
    throw new Error('7 PERMISSION_DENIED: Autentikasi diperlukan untuk memperbarui artikel.');
  }

  try {
    const docRef = doc(db, 'articles', id);
    
    // Create a mutable copy to work with
    const dataToUpdate: { [key: string]: any } = { ...article };

    if (article.imageUrl === '' || article.imageUrl === null || article.imageUrl === undefined) {
        dataToUpdate.imageUrl = deleteField();
    }
    
    await updateDoc(docRef, dataToUpdate);

  } catch (e: any) {
    console.error("Error updating document: ", e);
    throw new Error(`Gagal memperbarui artikel: ${e.message}`);
  }
};


// Delete
export const deleteArticle = async (id: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('7 PERMISSION_DENIED: Autentikasi diperlukan untuk menghapus artikel.');
  }
  try {
    const docRef = doc(db, 'articles', id);
    await deleteDoc(docRef);
  } catch (e: any) {
    console.error("Error deleting document: ", e);
    throw new Error(`Gagal menghapus artikel: ${e.message}`);
  }
};
