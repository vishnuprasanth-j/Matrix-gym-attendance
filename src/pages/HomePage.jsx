import { Link } from "react-router-dom";
import '../styles/HomePage.css';
import { collection, query, getDocs, deleteDoc, doc, writeBatch} from "firebase/firestore";
import { db } from  '../lib/firebase';

const HomePage = () => {

  return (
    <>
    <h1>Matrix <span id="header-span">Fitness </span>Center</h1>
    <div className="background-image"></div>
    <div className="container-home">
        <div className="button-container">
          <div className="button-wrapper">
            <Link to="/Login/dashboard"><button id="dashboard-btn" className="glass-button"></button></Link>
            <p>Dashboard</p>
          </div>
          <div className="button-wrapper">
            <Link to="/Login/members"><button id="members-btn" className="glass-button"></button></Link> 
            <p>Members</p>
          </div>
          <div className="button-wrapper">
            <Link to="/Attendance"><button id="attendance-btn" className="glass-button"></button></Link>
            <p>Attendance</p>
          </div>
        </div>
      </div>
  </>
  );
};

export default HomePage;
