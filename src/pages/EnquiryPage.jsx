import React, { useState, useEffect } from "react";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import Sidebar from "../components/SideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; // Assuming 'db' is your Firestore instance
import "../styles/EnquiryPage.css";
import AddEnquiryModal from "../components/AddEnquiryModal";
import { Link } from "react-router-dom";

const EnquiryPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const enquiriesRef = collection(db, "enquiry");
        const querySnapshot = await getDocs(enquiriesRef);
        const enquiriesData = [];
        querySnapshot.forEach((doc) => {
          const enquiryData = doc.data();
          enquiryData.date = enquiryData.date.toDate().toLocaleDateString();
          enquiriesData.push({ id: doc.id, ...enquiryData });
        });
        setEnquiries(enquiriesData);
      } catch (error) {
        console.error("Error fetching enquiries: ", error);
      }
    };

    fetchEnquiries();
  }, []);

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleAddEnquiry = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleSubmitEnquiry = async (newEnquiryData) => {
    try {
      await addDoc(collection(db, "enquiry"), newEnquiryData);
      const updatedEnquiriesRef = collection(db, "enquiry");
      const updatedQuerySnapshot = await getDocs(updatedEnquiriesRef);
      const updatedEnquiriesData = [];
      updatedQuerySnapshot.forEach((doc) => {
        const enquiryData = doc.data();
        enquiryData.date = enquiryData.date.toDate().toLocaleDateString();
        updatedEnquiriesData.push({ id: doc.id, ...enquiryData });
      });
      setEnquiries(updatedEnquiriesData);
      setOpenModal(false);
    } catch (error) {
      console.error("Error adding enquiry:", error);
    }
  };

  return (
    <div className="enquirypage-container">
    <div  className="enquirypage-btn-container">
    <Button onClick={handleSidebarOpen}>
        <FontAwesomeIcon icon={faBars} />
      </Button>
      <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
      <Button onClick={handleAddEnquiry} variant="contained" color="primary">
        Add Enquiry
      </Button>
    </div>
   
      <TableContainer component={Paper}>
        <Table
          sx={{
            marginTop: "10px",
            minWidth: 650,
            "& > .MuiTableBody-root > .MuiTableRow-root:hover": {
              backgroundColor: "#f0eeee",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="center">Reminder</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell>{enquiry.name}</TableCell>
                <TableCell>{enquiry.address}</TableCell>
                <TableCell>{enquiry.date}</TableCell>
                <TableCell>{enquiry.phone}</TableCell>
                <TableCell
                  align="center"
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  <Link
                    to={`https://web.whatsapp.com/send?phone=+91${enquiry.phone}&text=Hi%20this%20is%20matrix%20gym`}
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
      <AddEnquiryModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEnquiry}
      />
    </div>
  );
};

export default EnquiryPage;
