import { Alert, Button, Grid, TextField } from "@mui/material";
import "../styles/AttendancePage.css";
import { useState } from "react";
import {
  arrayUnion,
  collection,
  getDocs,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";

const AttendancePage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleAttendanceSubmit = async () => {
    try {
      // Query Firestore to find member by phone number
      const membersQuerySnapshot = await getDocs(
        query(collection(db, "members"), where("phone", "==", phoneNumber))
      );
      if (membersQuerySnapshot.empty) {
        setErrorMessage("Member not found");
        return;
      }

      // Get the first member document
      const memberDoc = membersQuerySnapshot.docs[0];

      // Check if today's date is already in the attendance array
      const today = new Date().toLocaleDateString();
      const attendanceArray = memberDoc.data().attendance || [];
      if (attendanceArray.includes(today)) {
        setErrorMessage("Attendance already marked for today");
      } else {
        // Add today's date to the attendance array in Firestore
        await updateDoc(memberDoc.ref, { attendance: arrayUnion(today) });
        setSuccessMessage("Attendance added successfully");
      }

      // Calculate plan expiry date
      const currentPlan = memberDoc.data().currentPlan;
      const currPlanStart = memberDoc.data().currPlanStart.toDate();
      const planExpiryDate = new Date(currPlanStart);
      if (currentPlan === "plan1") {
        planExpiryDate.setMonth(planExpiryDate.getMonth() + 1);
      } else if (currentPlan === "plan2") {
        planExpiryDate.setMonth(planExpiryDate.getMonth() + 4);
      } else if (currentPlan === "plan3") {
        planExpiryDate.setMonth(planExpiryDate.getMonth() + 6);
      } else if (currentPlan === "plan4") {
        planExpiryDate.setMonth(planExpiryDate.getMonth() + 12);
      }

      // Set member details to display
      setMemberDetails({
        name: memberDoc.data().name,
        planExpiryDate: planExpiryDate.toLocaleDateString(),
      });

      // Clear messages after 2 seconds
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error marking attendance:", error);
      setErrorMessage("Error marking attendance");

      // Clear messages after 2 seconds
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
    }
  };

  return (
    <main className="at-outercontainer">
      <div className="at-innercontainer">
        <div className="at-header">
          <p>Matrix Gym</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
        <div className="at-body">
          <TextField
            label="Phone Number"
            variant="outlined"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            sx={{
              width: "500px",
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#fff",
                  borderWidth: "2px",
                },
              },
              "& .MuiInputLabel-outlined": {
                color: "#fff",
              },
            }}
          />
          <Button
            variant="outlined"
            sx={{
              width: "500px",
              marginTop: "10px",
            }}
            onClick={handleAttendanceSubmit}
          >
            Submit
          </Button>
          {memberDetails && (
            <div>
              <p>Name: {memberDetails.name}</p>
              <p>Plan Expiry Date: {memberDetails.planExpiryDate}</p>
            </div>
          )}
          {successMessage && (
            <Alert
              severity="success"
              sx={{ position: "absolute",bottom: 0, width: "500px" ,marginBottom:"10px"}}
            >
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert
              severity="error"
              sx={{ position: "absolute", bottom: 0, width: "500px",marginBottom:"10px" }}
            >
              {errorMessage}
            </Alert>
          )}
        </div>
        <div className="at-bd-footer">
            <Button variant="outlined" component={Link} to="/">
                Go to Home
              </Button>
        </div>
      </div>
    </main>
  );
};

export default AttendancePage;
