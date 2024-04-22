import { Alert, Button, TextField } from "@mui/material";
import "../styles/AttendancePage.css";
import { useState } from "react";
import {
  arrayUnion,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";
import POINTS from "/points.png";

const AttendancePage = () => {
  const [regNumber, setRegNumber] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegNumberChange = (event) => {
    setRegNumber(event.target.value);
  };

  const calculateDaysLeft = (endDate, startDate) => {
    const end = endDate.toDate();
    const start = startDate.toDate();
    const difference = end.getTime() - start.getTime();
    const daysLeft = Math.ceil(difference / (1000 * 3600 * 24));

    if (daysLeft > 30) {
      const months = Math.floor(daysLeft / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    return `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
  };
  const handleAttendanceSubmit = async () => {
    try {
      const membersQuerySnapshot = await getDocs(
        query(collection(db, "members"), where("regno", "==", regNumber))
      );
      if (membersQuerySnapshot.empty) {
        setErrorMessage("Member not found");
        setTimeout(() => {
          setErrorMessage("");
        }, 2000);
        return;
      }
      const memberDoc = membersQuerySnapshot.docs[0];

      const today = new Date().toLocaleDateString();
      const attendanceArray = memberDoc.data().attendance || [];
      if (attendanceArray.includes(today)) {
        setErrorMessage("Attendance already marked for today");
      } else {
        await updateDoc(memberDoc.ref, { attendance: arrayUnion(today) });
        setSuccessMessage("Attendance added successfully");
      }

      const planHistory = memberDoc.data().planHistory;
      const currPlanStart = planHistory[planHistory.length - 1].planStart;
      const currPlanEnd = planHistory[planHistory.length - 1].planEnd;

      setMemberDetails({
        name: memberDoc.data().name,
        planExpiryDate: currPlanEnd.toDate().toLocaleDateString(),
        daysLeft: calculateDaysLeft(currPlanEnd, currPlanStart),
      });

      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error marking attendance:", error);
      setErrorMessage("Error marking attendance");

      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
    }
  };

  return (
    <div className="attendance-container">
      <section id="contact">
        <h1 className="contact-title">
          Attendance <span> Registration</span>
        </h1>
        <div className="contact-container">
          <div className="contact-london">
            <h2>
              Gym <span id="header-span"> Rules</span>
            </h2>
            <ul>
              <li>
                <img src={POINTS} alt="" />
                Re-Rack Weights: Put weights back in place after use.
              </li>
              <li>
                <img src={POINTS} alt="" />
                Share Equipment: Be considerate of others waiting.
              </li>
              <li>
                <img src={POINTS} alt="" />
                Respect Personal Space: Give others room to work out.
              </li>
              <li>
                <img src={POINTS} alt="" />
                Keep Noise Down: Avoid loud disturbances.
              </li>
            </ul>
          </div>
          <div className="contact-form-bg">
            <div className="contact-form">
              <div className="first-row">
                <div className="name">
                  <p className="input-text">Registration ID</p>
                  <input
                    type="text"
                    name="reg-id"
                    value={regNumber}
                    onChange={handleRegNumberChange}
                    required
                  />
                </div>
              </div>
              <br />
              <br></br>
              <button className="send-btn" onClick={handleAttendanceSubmit}>
                Enter
              </button>
              {memberDetails && (
                <div className="details">
                  <p>Name: {memberDetails.name}</p>
                  <p>Plan Expiry Date: {memberDetails.planExpiryDate}</p>
                  <p>Days left: {memberDetails.daysLeft}</p>
                </div>
              )}
            </div>
          </div>
          {successMessage && (
            <Alert
              severity="success"
              sx={{
                position: "absolute",
                bottom: 0,
                width: "500px",
                marginBottom: "10px",
              }}
            >
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                position: "absolute",
                bottom: 0,
                width: "500px",
                marginBottom: "10px",
              }}
            >
              {errorMessage}
            </Alert>
          )}
        </div>
      </section>
    </div>
  );
};

export default AttendancePage;
