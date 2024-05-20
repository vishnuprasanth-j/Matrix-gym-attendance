import { useState, useEffect, useContext, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../lib/AuthContext";
import { SignOutUser, db } from "../lib/firebase";
import {
  Button,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import SidebarDashboard from "../components/SidebarDashboard";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(AuthContext);
  const [jyData, setJyData] = useState({
    maleCount: 0,
    femaleCount: 0,
  });
  const [ksData, setKsData] = useState({
    maleCount: 0,
    femaleCount: 0,
  });

  const jyChartRef = useRef(null);
  const ksChartRef = useRef(null);
  const jyChartInstance = useRef(null);
  const ksChartInstance = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyEarnings, setMonthlyEarnings] = useState(Array(12).fill(0));
  const earningsChartRef = useRef(null);
  const earningsChartInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [plansCount, setPlansCount] = useState(null);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      let memData = [];
      try {
        const localMembers = localStorage.getItem("absentees");
        if (localMembers) {
          memData = JSON.parse(localMembers);
        } else {
          const querySnapshot = await getDocs(collection(db, "members"));
          querySnapshot.forEach((doc) => {
            memData.push({ id: doc.id, ...doc.data() });
          });
          localStorage.setItem("absentees", JSON.stringify(memData));
        }
        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear, 11, 31);
        let earningsByMonth = Array(12).fill(0);
        let plansObj = {};
        let plansArr = [];
        memData.forEach((member) => {
          member.planHistory?.forEach((plan) => {
            const start = new Date(plan.planStart.seconds * 1000);
            const end = new Date(plan.planEnd.seconds * 1000);
            const amount = parseFloat(plan.amount);

            if (start >= startOfYear && end <= endOfYear) {
              const month = start.getMonth();
              earningsByMonth[month] += amount;
            }

            if (!plansArr.includes(plan.plan)) {
              plansArr.push(plan.plan);
              plansObj[plan.plan] = 0;
            } else {
              plansObj[plan.plan] += 1;
            }
            console.log(plansArr, plansObj);
            setPlansCount(plansObj);
          });
        });
        setMonthlyEarnings(earningsByMonth);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedYear]);
  useEffect(() => {
    const fetchData = async () => {
      let memData = [];
      try {
        const localMembers = localStorage.getItem("absentees");
        if (localMembers) {
          memData = JSON.parse(localMembers);
        } else {
          const querySnapshot = await getDocs(collection(db, "members"));
          querySnapshot.forEach((doc) => {
            memData.push({ id: doc.id, ...doc.data() });
          });
        }
        let jyMale = 0,
          jyFemale = 0,
          ksMale = 0,
          ksFemale = 0;
        memData.forEach((doc) => {
          const { gender, branch } = doc;

          if (branch === "branch1") {
            if (gender === "Male") jyMale++;
            else if (gender === "Female") jyFemale++;
          } else if (branch === "branch2") {
            if (gender === "Male") ksMale++;
            else if (gender === "Female") ksFemale++;
          }
        });
        setJyData({ maleCount: jyMale, femaleCount: jyFemale });
        setKsData({ maleCount: ksMale, femaleCount: ksFemale });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateChart = (chartRef, chartInstance, data) => {
      if (chartRef.current) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        chartInstance.current = new Chart(chartRef.current, {
          type: "pie",
          data: {
            labels: ["Male", "Female"],
            datasets: [
              {
                data: [data.maleCount, data.femaleCount],
                backgroundColor: ["blue", "pink"],
              },
            ],
          },
          options: { responsive: true },
        });
      }
    };

    updateChart(jyChartRef, jyChartInstance, jyData);
    updateChart(ksChartRef, ksChartInstance, ksData);
  }, [jyData, ksData]);

  useEffect(() => {
    if (earningsChartRef.current) {
      if (earningsChartInstance.current) {
        earningsChartInstance.current.destroy();
      }

      earningsChartInstance.current = new Chart(earningsChartRef.current, {
        type: "bar",
        data: {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Monthly Earnings",
              data: monthlyEarnings,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [monthlyEarnings]);
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
      <SidebarDashboard
        isOpen={isSidebarOpen}
        handleClose={handleSidebarClose}
      />
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: "300px" }}
          className="chart-ct"
        >
          <canvas ref={jyChartRef}></canvas>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: "300px" }}
          className="chart-ct"
        >
          <canvas ref={ksChartRef}></canvas>
        </Grid>
      </Grid>
      <Typography sx={{backgroundColor:"black",color:"white",textAlign:"center",marginTop:"20px"}}>Earnings</Typography>
      <Grid
        container
        spacing={3}
        sx={{
          marginTop: "30px",
        }}
        xs={12}
      >
        <Grid
          item
          xs={12}
          sm={6}
          style={{
            height: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
          >
            {Array.from(
              { length: new Date().getFullYear() - 2023 + 1 },
              (_, i) => 2023 + i
            ).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
          {loading ? (
            <CircularProgress />
          ) : (
            <canvas ref={earningsChartRef}></canvas>
          )}
        </Grid>
        <Grid xs={12} sm={6}  item sx={{
          display:"flex",
          justifyContent:"center",
        }}>
          {" "}
          <TableContainer
            sx={{
              marginTop: "30px",
              width: "300px",
              height: "300px",
            }}
            component={Paper}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Earnings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyEarnings.map((earnings, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(selectedYear, index).toLocaleString("default", {
                        month: "long",
                      })}
                    </TableCell>
                    <TableCell>{earnings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>  
      <Typography sx={{backgroundColor:"black",color:"white",textAlign:"center",marginTop:"20px"}}>Plans</Typography>
      <Grid xs={12} sx={{
        display:"flex",
        justifyContent:"center"
      }}>
        <Grid xs={12} sm={6}>
          <TableContainer
            sx={{
              marginTop: "30px",
              width: "300px",
              height: "300px",
              marginBottom: "30px"
            }}
            component={Paper}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plansCount &&
                  Object.entries(plansCount).map(([plan, count]) => (
                    <TableRow key={plan}>
                      <TableCell>{plan}</TableCell>
                      <TableCell>{count}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;
