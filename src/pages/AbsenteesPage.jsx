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
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/SideBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/AbsenteesPage.css";

const AbsenteesPage = () => {
  const { branch } = useParams();
  const [absentees, setAbsentees] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedBatch, setSelectedBatch] = useState("Morning");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceOption, setAttendanceOption] = useState("Absent");

  useEffect(() => {
    const fetchAbsentees = async () => {
      try {
        let absenteesData = [];

        const localMembers = localStorage.getItem("absentees");
        if (localMembers) {
          const membersData = JSON.parse(localMembers);
          membersData.forEach((member) => {
            const formattedDate = formatDate(selectedDate);
            if (
              member.branch === branch &&
              member.batch === selectedBatch &&
              (attendanceOption === "Present"
                ? member.attendance && member.attendance.includes(formattedDate)
                : !member.attendance ||
                  !member.attendance.includes(formattedDate))
            ) {
              absenteesData.push({
                id: member.id,
                name: member.name,
                phone: member.phone,
                regno: member.regno,
                attendance: member.attendance,
              });
            }
          });
        } else {
          const membersRef = collection(db, "members");
          let q = query(membersRef);
          if (branch) {
            q = query(q, where("branch", "==", branch));
          }
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const member = doc.data();
            const formattedDate = formatDate(selectedDate);

            if (
              member.batch === selectedBatch &&
              (attendanceOption === "Present"
                ? member.attendance && member.attendance.includes(formattedDate)
                : !member.attendance ||
                  !member.attendance.includes(formattedDate))
            ) {
              absenteesData.push({
                id: doc.id,
                name: member.name,
                phone: member.phone,
                regno: member.regno,
                attendance: member.attendance,
              });
            }
          });
        }

        setAbsentees(absenteesData);
      } catch (error) {
        console.error("Error fetching absentees: ", error);
      }
    };

    fetchAbsentees();
  }, [branch, selectedBatch, selectedDate, attendanceOption]);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAttendanceOptionChange = (event) => {
    setAttendanceOption(event.target.value);
  };

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const calculateDaysSinceLastPresent = (attendance) => {
    if (!attendance || attendance.length === 0) return "N/A";

    const lastAttendanceDate = new Date(attendance[attendance.length - 1]);
    const today = new Date();

    const differenceInTime = today.getTime() - lastAttendanceDate.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays-1;
  };

  return (
    <div className="enquirypage-container">
      <div className="enquirypage-btn-container">
        <Button onClick={handleSidebarOpen}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
      </div>
      <Tabs
        value={selectedBatch}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ marginBottom: "10px" }}
      >
        <Tab label="Morning" value="Morning" />
        <Tab label="Evening" value="Evening" />
      </Tabs>

      <div className="attendance-options">
        <div className="date-picker-container">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="date-picker"
          />
        </div>

        <div className="filter-container">
          <Typography variant="body1" sx={{ marginRight: "10px" }}>
            Filter :-
          </Typography>
          <RadioGroup
            row
            aria-label="attendance-options"
            name="attendance-options"
            value={attendanceOption}
            onChange={handleAttendanceOptionChange}
          >
            <FormControlLabel
              value="Present"
              control={<Radio />}
              label="Present"
            />
            <FormControlLabel
              value="Absent"
              control={<Radio />}
              label="Absent"
            />
          </RadioGroup>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">
                  RegNo.
                </Typography>
              </TableCell>
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
              {attendanceOption === "Absent" && (
                <>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                    Days Absent
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                    Last Attendance
                    </Typography>
                  </TableCell>
                </>
              )}
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
                  <TableCell>{absentee.regno}</TableCell>
                  <TableCell>{absentee.name}</TableCell>
                  <TableCell>{absentee.phone}</TableCell>
                  {attendanceOption === "Absent" && (
                    <>
                      <TableCell>
                        {calculateDaysSinceLastPresent(absentee.attendance)}{" "}
                        days 
                      </TableCell>
                      <TableCell>
                        {absentee.attendance[absentee.attendance.length - 1]}
                      </TableCell>
                    </>
                  )}

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
