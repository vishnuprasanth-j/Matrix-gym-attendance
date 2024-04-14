import { db, auth } from "../lib/firebase";
import { useState, useEffect, useContext} from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";
import { SignOutUser } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../lib/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState([]);
  const{currentUser,authPending,setCurrentUser}=useContext(AuthContext)
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // Check if revenue data for the selected year exists in local storage
        const cachedData = localStorage.getItem(`revenueData_${year}`);
        if (cachedData) {
          setRevenueData(JSON.parse(cachedData));
          return;
        }

        const q = query(
          collection(db, "members"),
          where("createdAt", ">=", new Date(`${year}-01-01`)),
          where("createdAt", "<=", new Date(`${year}-12-31`))
        );
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => doc.data());
        const monthlyRevenue = Array.from({ length: 12 }, () => 0);

        data.forEach((user) => {
          const planPrice = getPlanPrice(user.plan);
          const month = user.createdAt.toDate().getMonth();
          monthlyRevenue[month] += planPrice;
        });

        // Cache the revenue data in local storage
        localStorage.setItem(
          `revenueData_${year}`,
          JSON.stringify(monthlyRevenue)
        );

        setRevenueData(monthlyRevenue);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };

    fetchRevenueData();
  }, [year]);

  const getPlanPrice = (plan) => {
    switch (plan) {
      case "Plan1":
        return 1000;
      case "Plan2":
        return 3000;
      case "Plan3":
        return 10000;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const ctx = document.getElementById("revenueChart").getContext("2d");
    let chart = null;

    if (chart) {
      chart.destroy(); // Destroy the existing chart
    }

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
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

    return () => {
      if (chart) {
        chart.destroy(); // Clean up the chart when component unmounts
      }
    };
  }, [revenueData]);
  const handleChangeYear = (e) => {
    setYear(e.target.value);
  };
  const handleSignOut = async () => {
    try {
      await SignOutUser();
      navigate('/');
      setCurrentUser();
     } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      <button onClick={handleSignOut}>lout</button>
      <label>Select Year:</label>
      <select value={year} onChange={handleChangeYear}>
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        {/* Add more years as needed */}
      </select>
      <canvas id="revenueChart" width="400" height="400"></canvas>
    </div>
  );
};

export default DashboardPage;
