import { Link } from "react-router-dom";
import '../styles/HomePage.css';
import { auth, db } from '../lib/firebase';
import { collection,addDoc,Timestamp } from 'firebase/firestore';
import { faChartSimple,faClipboardUser,faPerson } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from "react";


const HomePage = () => {
  const [addStatus, setAddStatus] = useState(null);

  const generateRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  
  const generateRandomPlans = () => {
    const plans = ["plan1", "plan2", "plan3"];
    return plans[Math.floor(Math.random() * plans.length)];
  };

  const generateRandomPlanHistory = () => {
    const planHistory = [];
    const numPlans = Math.floor(Math.random() * 3) + 1; // Generate 1 to 3 previous plans
    for (let i = 0; i < numPlans; i++) {
      planHistory.push(generateRandomPlans());
    }
    return planHistory;
  };

  const generateRandomPhoneNumber = () => {
    const digits = Math.floor(Math.random() * (9999999999 - 1000000000) + 1000000000);
    return digits.toString();
  };
  const generateRandomBloodGroup = () => {
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    return bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
  };
  const generateRandomName = () => {
    const names = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack", "Katie", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Ryan", "Sophia", "Thomas", "Uma", "Victor", "Willow", "Xavier", "Yara", "Zach"];
    return names[Math.floor(Math.random() * names.length)];
  };
  const generateRandomMembers = async () => {
    try {
      const branch = ["branch1", "branch2"];
      const now = new Date();
      const gymStartDate = new Date("January 1, 2023");
      
      for (let i = 0; i < 10; i++) {
        const dob = generateRandomDate(new Date("January 1, 1950"), now);
        const age = Math.floor((now - dob) / (1000 * 60 * 60 * 24 * 365));
        const currPlanStart = generateRandomDate(gymStartDate, now);
        const planHistory = generateRandomPlanHistory();
        const phoneNumber = generateRandomPhoneNumber();
        const bloodgroup=generateRandomBloodGroup();
        const name=generateRandomName();
        const data= {
          age: age.toString(),
          branch: branch[Math.floor(Math.random() * branch.length)],
          currentPlan: generateRandomPlans(),
          currPlanStart: Timestamp.fromDate(currPlanStart),
          dob: Timestamp.fromDate(dob),
          gender: Math.random() < 0.5 ? "male" : "female",
          height: Math.floor(Math.random() * (200 - 140) + 140).toString(),
          name: name,
          phone: phoneNumber,
          photo: "#",
          planHistory: planHistory,
          weight: Math.floor(Math.random() * (100 - 40) + 40).toString(),
          bloodgroup:bloodgroup
        }
        console.log(data)
        await addDoc(collection(db, 'members'), {
          age: age.toString(),
          branch: branch[Math.floor(Math.random() * branch.length)],
          currentPlan: generateRandomPlans(),
          currPlanStart: Timestamp.fromDate(currPlanStart),
          dob: Timestamp.fromDate(dob),
          gender: Math.random() < 0.5 ? "male" : "female",
          height: Math.floor(Math.random() * (200 - 140) + 140).toString(),
          name: name,
          phone: phoneNumber,
          photo: "#",
          planHistory: planHistory,
          weight: Math.floor(Math.random() * (100 - 40) + 40).toString(),
          bloodgroup:bloodgroup
        });
      }
      setAddStatus("10 random documents added successfully.");
    } catch (error) {
      setAddStatus("Error occurred while adding documents: " + error.message);
    }
  };
  return (<main className='main-div'>
  <div className='home-container'>
  <div className='rubik-doodle'>Matrix Gym</div>
    <div className='buttons-div'>
      <button className='button-59'><Link to="/Login/dashboard">Dashboard</Link><FontAwesomeIcon icon={faChartSimple} /></button>
      <button className='button-59'><Link to="/Login/members">Members</Link> <FontAwesomeIcon icon={faPerson} /></button>
      <button className='button-59'><Link to="/Attendance">Attendance</Link><FontAwesomeIcon icon={faClipboardUser} /></button>
      <button className='button-59' onClick={generateRandomMembers}>Click</button>
    </div>
  </div>

     </main>
  )
}

export default HomePage