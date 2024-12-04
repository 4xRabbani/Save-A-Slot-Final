// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0XEyupQdLZ5K3Y1OLjxuvYQgdAg5Pacs",
  authDomain: "save-a-slot.firebaseapp.com",
  projectId: "save-a-slot",
  storageBucket: "save-a-slot.firebasestorage.app",
  messagingSenderId: "1046558210640",
  appId: "1:1046558210640:web:dcbd3a8d16f7972de5ef55",
  measurementId: "G-L60XJCD63K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
