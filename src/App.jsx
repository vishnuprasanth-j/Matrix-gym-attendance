import { useState } from 'react'
import { collection,getDocs } from 'firebase/firestore'
import {db} from './lib/firebase'
import HomePage from './pages/HomePage'

function App() {
  const [user,setusers]=useState();

  // const allUsers=async()=>{
  //   const querySnapshot = await getDocs(collection(db, "users"));
  //   querySnapshot.forEach((doc) => {
  //     // doc.data() is never undefined for query doc snapshots
  //     console.log(doc.id, " => ", doc.data());
  //   });

  // } 

  return (<>
        <HomePage/>
          </>
 )
}

export default App
