import { Link } from "react-router-dom";
import '../styles/HomePage.css';
import { faChartSimple,faClipboardUser,faDumbbell,faPerson } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { auth, db } from '../lib/firebase';
import { collection,addDoc,Timestamp, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect } from "react";
import { gsap } from "gsap";
import MatrixAnimation from "../components/MatrixAnimation";

const HomePage = () => {
  const updateAttendance = async () => {
    // Query all documents from the 'members' collection
    const membersQuerySnapshot = await getDocs(collection(db, 'members'));
  
    // Get the current date
    const currentDate = new Date();
  
    // Generate random dates for the last two months
    const randomDates = [];
    for (let i = 0; i < 60; i++) {
      const randomDate = new Date(currentDate);
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60));
      randomDates.push(randomDate);
    }
  
    // Update each document in the collection with the new 'attendance' field
    membersQuerySnapshot.forEach(async (doc) => {
      try {
        const memberId = doc.id;
        const attendanceData = {
          attendance: randomDates.filter(date => date < currentDate)
                                  .map(date => date.toISOString()), // Convert dates to ISO string format
        };
        await updateDoc(doc.ref, attendanceData);
        console.log(`Attendance updated for member with ID: ${memberId}`);
      } catch (error) {
        console.error(`Error updating attendance for member with ID: W`, error);
      }
    });
  };
  
  return (
    <main className='main-div'>
    <MatrixAnimation></MatrixAnimation>
      <div className='home-container'>
        <div className='rubik-doodle'>Matr<FontAwesomeIcon icon={faDumbbell}/>x Gym</div>
        <div className='buttons-div'>
          <button className='button-59'><Link to="/Login/dashboard">Dashboard</Link><FontAwesomeIcon icon={faChartSimple} /></button>
          <button className='button-59'><Link to="/Login/members">Members</Link> <FontAwesomeIcon icon={faPerson} /></button>
          <button className='button-59'><Link to="/Attendance">Attendance</Link><FontAwesomeIcon icon={faClipboardUser} /></button>
          <button className='button-59' onClick={updateAttendance}>Click</button>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
