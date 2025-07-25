import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAREqNnfZ7kwM9yxte0rfr1BvAywuxS_d4",
  authDomain: "ukmibu.firebaseapp.com",
  projectId: "ukmibu",
  storageBucket: "ukmibu.firebasestorage.app",
  messagingSenderId: "507639799551",
  appId: "1:507639799551:web:c09bec1cd7fe67812076ca",
  measurementId: "G-BKJSZ297VR"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
