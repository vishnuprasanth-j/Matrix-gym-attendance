import { Link } from "react-router-dom";
import '../styles/HomePage.css';
import { faChartSimple,faClipboardUser,faPerson } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';



const HomePage = () => {

  return (<main className='main-div'>
  <div className='home-container'>
  <div className='rubik-doodle'>Matrix Gym</div>
    <div className='buttons-div'>
      <button className='button-59'><Link to="/Login/dashboard">Dashboard</Link><FontAwesomeIcon icon={faChartSimple} /></button>
      <button className='button-59'><Link to="/Login/members">Members</Link> <FontAwesomeIcon icon={faPerson} /></button>
      <button className='button-59'><Link to="/Attendance">Attendance</Link><FontAwesomeIcon icon={faClipboardUser} /></button>
      {/* <button className='button-59' onClick={generateRandomMembers}>Click</button> */}
    </div>
  </div>

     </main>
  )
}

export default HomePage