// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FirebaseKey,
  authDomain: "hacknite-2025.firebaseapp.com",
  projectId: "hacknite-2025",
  storageBucket: "hacknite-2025.firebasestorage.app",
  messagingSenderId: "315861829796",
  appId: "1:315861829796:web:1684b73a6f18d5bc2e3e31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider= new OAuthProvider("microsoft.com");


import { getStorage } from "firebase/storage";

const storage = getStorage(app);



export { auth, provider,storage };