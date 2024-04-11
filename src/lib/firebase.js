// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut} from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBZC2HdKWMVV21Jm7_mbLal9-GberwRp5Q",
  authDomain: "tste-b6fc1.firebaseapp.com",
  projectId: "tste-b6fc1",
  storageBucket: "tste-b6fc1.appspot.com",
  messagingSenderId: "434146404883",
  appId: "1:434146404883:web:6b5cbe463493abac80ede6",
  measurementId: "G-17QBT6E46J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db=getFirestore(app);



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
