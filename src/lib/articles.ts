
import { 
  db, 
  app 
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


if (!app) {
  throw new Error("Firebase has not been initialized. Make sure your .env file is set up correctly.");
}

const articlesCollection = collection(db, 'articles');

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Timestamp;
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

// Create
export const addArticle = async (article: ArticleInput): Promise<string> => {
  try {
    const dataToAdd: { [key: string]: any } = {
      ...article,
      createdAt: serverTimestamp(),
    };
    
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article));
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
      return { id: docSnap.id, ...docSnap.data() } as Article;
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

    // Firestore does not allow updating with undefined values.
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === undefined) {
        delete dataToUpdate[key];
      }
    });

    // Handle empty imageUrl string to remove it from the document.
    if (article.imageUrl === '') {
        dataToUpdate.imageUrl = deleteField();
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
      await updateDoc(docRef, dataToUpdate);
    }
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
