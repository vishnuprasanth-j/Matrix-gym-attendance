import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import ProtectedRouteAdmin from "./lib/ProtectedRouteAdmin";
import DashboardPage from "./pages/DashboardPage";
import { useContext } from "react";
import { AuthContext } from "./lib/AuthContext";
import AttendancePage from "./pages/AttendancePage";
import EnquiryPage from "./pages/EnquiryPage";
import { CircularProgress } from "@mui/material";
import AbsenteesPage from "./pages/AbsenteesPage";
import PlanEditPage from "./pages/PlanEditPage";

const AppRoutes = () => {
  const { currentUser,authPending } = useContext(AuthContext);
  console.log(currentUser)
  if (authPending) {
    return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />;
  }
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/Login/:type"
        element={
          currentUser != null ? (
            currentUser.role == "trainer" ? (
              <Navigate to={`/Members/${currentUser.branch}`} replace />
            ) : (
              <Navigate to="/Dashboard" />
            )
          ) : (
            <LoginPage />
          )
        }
      />

      <Route  path="/Members/:branch?"  element={<MembersPage />} />

      <Route
        path="/Dashboard"
        element={currentUser != null ? <DashboardPage /> : <HomePage />}
      />
      <Route
        path="/Enquiry/:branch"
        element={currentUser != null ? <EnquiryPage /> : <HomePage />}
      />
      <Route
        path="/Absentee/:branch"
        element={currentUser != null ? <AbsenteesPage /> : <HomePage />}
      />
      <Route
        path="/Plan/:branch"
        element={currentUser != null ? <PlanEditPage /> : <HomePage />}
      />
      <Route path="/Attendance" element={<AttendancePage/>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
