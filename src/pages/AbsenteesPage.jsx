import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/SideBar";
import '../styles/EnquiryPage.css'

const AbsenteesPage = () => {
  const { branch } = useParams();
  const [absentees, setAbsentees] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    const fetchAbsentees = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = branch ? query(membersRef, where("branch", "==", branch)) : membersRef;
        const querySnapshot = await getDocs(q);
        const absenteesData = [];
        querySnapshot.forEach((doc) => {
          const member = doc.data();
          // Check if the attendance array contains yesterday's date or today's date
          const today = new Date();
          const todayDateString = today.toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDateString = yesterday.toISOString().split('T')[0];
          if (!member.attendance || (!member.attendance.includes(todayDateString) && !member.attendance.includes(yesterdayDateString))) {
            absenteesData.push({
              id: doc.id,
              name: member.name,
              phone: member.phone,
              gender: member.gender
            });
          }
        });
        setAbsentees(absenteesData);
      } catch (error) {
        console.error("Error fetching absentees: ", error);
      }
    };

    fetchAbsentees();
  }, [branch]);
  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };


  return (
    <div className="enquirypage-container">
    <div  className="enquirypage-btn-container">
    <Button onClick={handleSidebarOpen}>
        <FontAwesomeIcon icon={faBars} />
      </Button>
      <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
    </div>
      <Typography variant="h6" textAlign={"center"}>ABSENTEES</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">Name</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">Phone</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">Gender</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontWeight="bold">Reminder</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {absentees.map((absentee) => (
              <TableRow key={absentee.id}>
                <TableCell>{absentee.name}</TableCell>
                <TableCell>{absentee.phone}</TableCell>
                <TableCell>{absentee.gender}</TableCell>
                <TableCell
                  align="center"
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  <Link
                    to={`https://wa.me/91${absentee.phone}?text=Hi%20this%20is%20matrix%20gym`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon icon={faBell} shake />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AbsenteesPage;
