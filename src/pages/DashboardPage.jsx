import { useState, useEffect, useContext, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../lib/AuthContext";
import { SignOutUser, db } from "../lib/firebase";
import { Button, Grid } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/SideBar";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(AuthContext);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const genderChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const genderChartInstance = useRef(null);
  const statusChartInstance = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "members"));
        let maleCount = 0;
        let femaleCount = 0;
        let activeCount = 0;
        let expiredCount = 0;

        querySnapshot.forEach((doc) => {
          const { gender, currentPlan, currPlanStart } = doc.data();
          if (gender === "Male") {
            maleCount++;
          } else if (gender === "Female") {
            femaleCount++;
          }

          const planDuration = {
            plan1: 1,
            plan2: 4,
            plan3: 6,
            plan4: 12,
          };

          const expirationDate = new Date(currPlanStart.toDate());
          expirationDate.setMonth(
            expirationDate.getMonth() + planDuration[currentPlan]
          );

          if (expirationDate < new Date()) {
            expiredCount++;
          } else {
            activeCount++;
          }
        });

        setMaleCount(maleCount);
        setFemaleCount(femaleCount);
        setActiveCount(activeCount);
        setExpiredCount(expiredCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (genderChartRef.current && statusChartRef.current) {
      if (genderChartInstance.current) {
        genderChartInstance.current.destroy();
      }
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }

      const genderChartCanvas = genderChartRef.current;
      genderChartInstance.current = new Chart(genderChartCanvas, {
        type: "pie",
        data: {
          labels: ["Male", "Female"],
          datasets: [
            {
              data: [maleCount, femaleCount],
              backgroundColor: ["blue", "pink"],
            },
          ],
        },
        options: {
          responsive: true,
        },
      });

      const statusChartCanvas = statusChartRef.current;
      statusChartInstance.current = new Chart(statusChartCanvas, {
        type: "pie",
        data: {
          labels: ["Active", "Expired"],
          datasets: [
            {
              data: [activeCount, expiredCount],
              backgroundColor: ["green", "red"],
            },
          ],
        },
        options: {
          responsive: true,
        },
      });
    }
  }, [maleCount, femaleCount, activeCount, expiredCount]);

  const handleSignOut = async () => {
    try {
      await SignOutUser();
      navigate("/");
      setCurrentUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dbpage-container">
      <Button onClick={handleSidebarOpen}>
        <FontAwesomeIcon icon={faBars} />
      </Button>
      <Sidebar isOpen={isSidebarOpen} handleClose={handleSidebarClose} />
      <Button onClick={handleSignOut}>
        Logout
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </Button>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4} style={{ width: "100%", height: "300px" }}>
          <canvas ref={genderChartRef}></canvas>
        </Grid>
        <Grid item xs={12} sm={4} style={{ width: "100%", height: "300px" }}>
          <canvas ref={statusChartRef}></canvas>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;
