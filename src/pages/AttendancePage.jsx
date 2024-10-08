import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import "../styles/AttendancePage.css";
import { useState, useEffect, useRef } from "react";
import {
  arrayUnion,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import POINTS from "/points.png";
import { addMonths, differenceInDays, formatDistanceToNow } from "date-fns";
import Logo from "/logo_transparent.png";
import Logo2 from "/matrix logo.jpg";

const AttendancePage = () => {
  const [regNumber, setRegNumber] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [memberDoc, setMemberDoc] = useState();
  const regInputRef = useRef();

  useEffect(() => {
    return async () => {
      const membersRef = collection(db, "members");
      const querySnapshot = await getDocs(membersRef);
      const membersData = [];
      querySnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() });
      });
      localStorage.removeItem("absentees");
      localStorage.setItem("absentees", JSON.stringify(membersData));
    };
  }, []);
  const handleRegNumberChange = (event) => {
    setRegNumber(event.target.value);
  };

  const calculateDaysLeft = (plEnd) => {
    const currPlanEnd = plEnd.toDate();
    const now = new Date();
    const diffInDays = differenceInDays(currPlanEnd, now);
    console.log(diffInDays)
    if (diffInDays <= 0) {
      return "Expired";
    } else {
      return `${diffInDays}d`;
    }
  }
  // const calculateDaysLeft = (endDate, startDate) => {
  //   const end = endDate.toDate();
  //   const start = startDate.toDate();
  //   const difference = end.getTime() - start.getTime();
  //   const daysLeft = Math.ceil(difference / (1000 * 3600 * 24));

  //   if (daysLeft > 30) {
  //     const months = Math.floor(daysLeft / 30);
  //     return `${months} month${months > 1 ? "s" : ""}`;
  //   }
  //   return `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
  // };
  const handleAttendanceSubmit = async () => {
    try {
      const membersQuerySnapshot = await getDocs(
        query(collection(db, "members"), where("regno", "==", regNumber))
      );
      if (membersQuerySnapshot.empty) {
        setErrorMessage("Member not found");
        setTimeout(() => {
          setErrorMessage("");
        }, 6000);
        setRegNumber("");
        setTimeout(() => {
          regInputRef.current.focus();
        }, 100);
        return;
      }

      // Check if there are multiple documents
      const memberDocs = membersQuerySnapshot.docs;
      console.log(memberDocs)
      if (memberDocs.length > 1) {
        const branches = memberDocs.map(doc => doc.data().branch);

        // Prompt the user to select a branch
        const selectedBranch = await new Promise((resolve) => {
          setMemberDetails({ branches, resolve });
          setOpenDialog(true);
        });

        // Filter based on the selected branch
        const selectedDoc = memberDocs.find(doc => doc.data().branch === selectedBranch);

        if (!selectedDoc) {
          setErrorMessage("Selected branch not found");
          setTimeout(() => {
            setErrorMessage("");
          }, 6000);
          return;
        }

        setMemberDoc(selectedDoc);
        const planHistory = selectedDoc.data().planHistory;
        const currPlanStart = planHistory[planHistory.length - 1].planStart;
        const currPlanEnd = planHistory[planHistory.length - 1].planEnd;

        setMemberDetails({
          name: selectedDoc.data().name,
          planExpiryDate: currPlanEnd.toDate().toLocaleDateString("en-GB"),
          daysLeft: calculateDaysLeft(currPlanEnd),
          batch: selectedDoc.data().batch,
        });
        setOpenDialog(true);
      } else {
        // If only one document, proceed as before
        const memberDoc = memberDocs[0];
        const planHistory = memberDoc.data().planHistory;
        const currPlanStart = planHistory[planHistory.length - 1].planStart;
        const currPlanEnd = planHistory[planHistory.length - 1].planEnd;

        setMemberDoc(memberDoc);
        setMemberDetails({
          name: memberDoc.data().name,
          planExpiryDate: currPlanEnd.toDate().toLocaleDateString("en-GB"),
          daysLeft: calculateDaysLeft(currPlanEnd),
          batch: memberDoc.data().batch,
        });
        setOpenDialog(true);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setErrorMessage("Error marking attendance");
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 6000);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const today = new Date().toLocaleDateString('en-US');
      const attendanceArray = memberDoc.data().attendance || [];
      if (attendanceArray.includes(today)) {
        setErrorMessage("Attendance already marked for today");
        setOpenDialog(false);
        setRegNumber("");
        setTimeout(() => {
          regInputRef.current.focus();
        }, 100);
      } else {
        await updateDoc(memberDoc.ref, { attendance: arrayUnion(today) });
        setSuccessMessage("Attendance marked successfully");
        setRegNumber("");
        setOpenDialog(false);
        setTimeout(() => {
          regInputRef.current.focus();
        }, 100);
      }
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 6000);
    } catch (error) {
      console.error("Error marking attendance:", error);
      setErrorMessage("Error marking attendance");

      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 6000);
    }
  };

  return (
    <div className="attendance-container">
      <div className="l-ct">
        <img src={Logo2} className="ll-ct"></img>
      </div>

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
                    ref={regInputRef}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <br />
              <br></br>
              <button className="send-btn" onClick={handleAttendanceSubmit}>
                ENTER
              </button>
              {successMessage && (
                <Alert
                  severity="success"
                  sx={{
                    position: "realtive",
                    width: "100%",
                    marginTop: "30px",
                    borderRadius: "0px"
                  }}
                >
                  {successMessage}
                </Alert>
              )}
              {errorMessage && (
                <Alert
                  severity="error"
                  sx={{
                    position: "realtive",
                    width: "100%",
                    marginTop: "30px",
                    borderRadius: "0px"
                  }}
                >
                  {errorMessage}
                </Alert>
              )}
              {memberDetails && memberDetails.branches && (
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                  <DialogTitle>Select Branch</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Please select the branch for the registration number:
                      <ul>
                        {memberDetails.branches.map((branch, index) => (
                          <li key={index}>
                            <Button
                              onClick={() => {
                                memberDetails.resolve(branch);
                                setOpenDialog(false);
                              }}
                            >
                              {branch}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              {memberDetails && !memberDetails.branches && (
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                  <DialogTitle>Member Details</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      <p>Name: {memberDetails.name}</p>
                      <p>Plan Expiry Date: {memberDetails.planExpiryDate}</p>
                      <p>Days left: {memberDetails.daysLeft}</p>
                      <p>Batch: {memberDetails.batch}</p>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleMarkAttendance} color="primary" autoFocus>
                      Mark Attendance
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AttendancePage;
