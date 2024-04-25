import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/SideBar";

const PlanEditPage = () => {
  const [plans, setPlans] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansRef = collection(db, "plans");
        const querySnapshot = await getDocs(plansRef);
        const plansData = [];
        querySnapshot.forEach((doc) => {
          plansData.push({ id: doc.id, ...doc.data() });
        });
        console.log(plansData);
        setPlans(plansData);
        localStorage.removeItem("plans")
        localStorage.setItem("plans",JSON.stringify(plansData))
      } catch (error) {
        console.error("Error fetching plans: ", error);
      }
    };

    fetchPlans();
  }, []);

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };
  return (
    <div>
     <div className="enquirypage-btn-container">
        <Button onClick={handleSidebarOpen}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
      </div>

      <Typography variant="h6" textAlign={"center"}>
       Plans
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ maxWidth: "80%", margin: "auto" }}
      >
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
              <TableCell>Plan ID</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.id}</TableCell>
                <TableCell>{plan.dn}</TableCell>
                <TableCell>{plan.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PlanEditPage;