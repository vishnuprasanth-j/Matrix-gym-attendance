import { useNavigate } from "react-router-dom";
import { createContext, useState, useEffect} from "react";
import { SignOutUser,userStateListener } from "./firebase";
import { db } from "./firebase";
import { getDocs,collection } from "firebase/firestore";

export const AuthContext = createContext({
  currentUser: {} ,
  setCurrentUser: (_user) => {},
  signOut: () => {}
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [authPending, setAuthPending] = useState(true);

  const navigate = useNavigate()
 
  useEffect(() => {
    const unsubscribe = userStateListener(async(user) => {
      console.log("....sate")
      if (user) {       
        const role=await getRole(user.email)
        setCurrentUser({...user,role:role})
        setAuthPending(false)
      }

    }); 
    return unsubscribe
  }, [setCurrentUser]);

  const getRole=async(email)=>{
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = querySnapshot.docs
        .map((doc) => doc.data())
        .find((data) => data.email === email);
      return userData ? userData.role : null;
    } catch (error) {
      console.error("Error getting user role:", error);
      throw error;
    }
  }

  const signOut = () => {
    SignOutUser()
    setCurrentUser(null)
    navigate('/')
  }

  const value = {
    currentUser, 
    setCurrentUser,
    signOut,
    authPending
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}