import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TablePagination,
  Tabs,
  Tab,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/SideBar";
import "../styles/EnquiryPage.css";

const AbsenteesPage = () => {
  const { branch } = useParams();
  const [absentees, setAbsentees] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedBatch, setSelectedBatch] = useState("Morning"); // State to manage the selected batch tab

  useEffect(() => {
    const fetchAbsentees = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = branch
          ? query(membersRef, where("branch", "==", branch))
          : membersRef;
        const querySnapshot = await getDocs(q);
        const absenteesData = [];
        querySnapshot.forEach((doc) => {
          const member = doc.data();
          const today = new Date();
          const todayDateString = today.toISOString().split("T")[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDateString = yesterday.toISOString().split("T")[0];
          if (
            // Check if the member belongs to the selected batch
            member.batch === selectedBatch &&
            (!member.attendance ||
              (!member.attendance.includes(todayDateString) &&
                !member.attendance.includes(yesterdayDateString)))
          ) {
            absenteesData.push({
              id: doc.id,
              name: member.name,
              phone: member.phone,
              gender: member.gender,
            });
          }
        });
        setAbsentees(absenteesData);
      } catch (error) {
        console.error("Error fetching absentees: ", error);
      }
    };

    fetchAbsentees();
  }, [branch, selectedBatch]); // Update the effect when branch or selectedBatch changes

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedBatch(newValue);
  };

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="enquirypage-container">
      <div className="enquirypage-btn-container">
        <Button onClick={handleSidebarOpen}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
      </div>
      <Tabs value={selectedBatch} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Morning" value="Morning" />
        <Tab label="Evening" value="Evening" />
      </Tabs>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">
                  Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">
                  Phone
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">
                  Gender
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontWeight="bold">
                  Reminder
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {absentees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((absentee) => (
                <TableRow key={absentee.id}>
                  <TableCell>{absentee.name}</TableCell>
                  <TableCell>{absentee.phone}</TableCell>
                  <TableCell>{absentee.gender}</TableCell>
                  <TableCell align="center">
                    <Link
                      to={`https://wa.me/91${absentee.phone}?text=Hi%20this%20is%20Matrix%20Gym.%20We%20missed%20you%20at%20the%20gym!%20Remember,%20consistency%20is%20key%20–%20looking%20forward%20to%20seeing%20you%20back%20soon!`}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={absentees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
};

export default AbsenteesPage;
