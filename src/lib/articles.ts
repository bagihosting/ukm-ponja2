
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
  Timestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

if (!app) {
  throw new Error("Firebase has not been initialized. Make sure your .env file is set up correctly.");
}

const storage = getStorage(app);
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
  imageFile?: File;
}

export interface ArticleUpdateInput {
  title?: string;
  content?: string;
  imageFile?: File;
}

// Fungsi untuk mengunggah gambar dan mendapatkan URL
const uploadImage = async (imageFile: File): Promise<string> => {
  const storageRef = ref(storage, `articles/${Date.now()}_${imageFile.name}`);
  const snapshot = await uploadBytes(storageRef, imageFile);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Create
export const addArticle = async (article: ArticleInput): Promise<string> => {
  try {
    const dataToAdd: { [key: string]: any } = {
      title: article.title,
      content: article.content,
      createdAt: serverTimestamp(),
    };

    if (article.imageFile) {
      dataToAdd.imageUrl = await uploadImage(article.imageFile);
    }
    
    const docRef = await addDoc(articlesCollection, dataToAdd);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Gagal menambahkan artikel");
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
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw new Error("Gagal mengambil daftar artikel");
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
  } catch (e) {
    console.error("Error getting document: ", e);
    throw new Error("Gagal mengambil data artikel");
  }
};

// Update
export const updateArticle = async (id: string, article: ArticleUpdateInput): Promise<void> => {
  try {
    const docRef = doc(db, 'articles', id);
    const dataToUpdate: { [key: string]: any } = {};

    if (article.title) dataToUpdate.title = article.title;
    if (article.content) dataToUpdate.content = article.content;
    
    if (article.imageFile) {
      dataToUpdate.imageUrl = await uploadImage(article.imageFile);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await updateDoc(docRef, dataToUpdate);
    }
  } catch (e) {
    console.error("Error updating document: ", e);
    throw new Error("Gagal memperbarui artikel");
  }
};

// Delete
export const deleteArticle = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'articles', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw new Error("Gagal menghapus artikel");
  }
};
