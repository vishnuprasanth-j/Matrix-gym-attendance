// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId:import.meta.env.VITE_PROJECT_ID,
  storageBucket:import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId:import.meta.env.VITE_APP_ID,
  measurementId:import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db=getFirestore(app);
export const storage=getStorage(app);


export const signInUser = async (
  email, 
  password
) => {
  if (!email && !password) return;

  return await signInWithEmailAndPassword(auth, email, password)
}

export const userStateListener = (callback) => {
  return onAuthStateChanged(auth, callback)
}

export const SignOutUser = async () => await signOut(auth);
