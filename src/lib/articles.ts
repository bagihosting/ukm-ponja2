
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
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { deleteField } from 'firebase/firestore';


if (!db) {
  throw new Error("Firebase has not been initialized. Make sure your .env file is set up correctly.");
}

const articlesCollection = collection(db, 'articles');

// This interface is now used internally for data from Firestore
interface ArticleFromFirestore {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Timestamp; // Firestore Timestamp
}

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
  imageUrl?: string | FieldValue;
}

// Helper to convert Firestore doc to a client-safe Article object
function toArticle(doc: any): Article {
  const data = doc.data() as ArticleFromFirestore;
  return {
    id: doc.id,
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
      ...article,
      createdAt: serverTimestamp(),
    };
    
    // Only include imageUrl if it's a non-empty string
    if (!article.imageUrl) {
        delete dataToAdd.imageUrl;
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
    const querySnapshot = await getDocs(articlesCollection);
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
    
    const dataToUpdate: ArticleUpdateInput = { ...article };

    // Handle empty imageUrl string to remove it from the document.
    if (article.imageUrl === '' || article.imageUrl === null) {
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
