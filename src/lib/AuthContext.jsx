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
    const unsubscribe = userStateListener(async (user) => {
      if (user) {
        const { email } = user;
        const { role, branch } = await getRoleAndBranch(email);
        setCurrentUser({ ...user, role: role, branch: branch || "" });
        setAuthPending(false);
      }
    });
    setAuthPending(false);
    return unsubscribe;
  }, [setCurrentUser]);
  
  const getRoleAndBranch = async (email) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = querySnapshot.docs
        .map((doc) => doc.data())
        .find((data) => data.email === email);
      const role = userData ? userData.role : null;
      const branch = userData ? userData.branch : null;
      return { role, branch };
    } catch (error) {
      console.error("Error getting user role and branch:", error);
      throw error;
    }
  };
  
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