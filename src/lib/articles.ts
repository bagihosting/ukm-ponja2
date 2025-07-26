
'use server';

import { 
  db
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
  try {
    const dataToAdd: { [key: string]: any } = {
      title: article.title,
      content: article.content,
      createdAt: serverTimestamp(),
    };
    
    // Only add imageUrl if it's a non-empty string
    if (article.imageUrl && article.imageUrl.trim() !== '') {
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
  try {
    const docRef = doc(db, 'articles', id);
    
    const dataToUpdate: { [key: string]: any } = { ...article };

    // If imageUrl is explicitly set to be removed (empty string), use deleteField
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
  try {
    const docRef = doc(db, 'articles', id);
    await deleteDoc(docRef);
  } catch (e: any) {
    console.error("Error deleting document: ", e);
    throw new Error(`Gagal menghapus artikel: ${e.message}`);
  }
};
