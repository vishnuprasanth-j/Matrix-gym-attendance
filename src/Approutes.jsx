import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import ProtectedRouteAdmin from "./lib/ProtectedRouteAdmin";
import DashboardPage from "./pages/DashboardPage";
import { useContext } from "react";
import { AuthContext } from "./lib/AuthContext";
import AttendancePage from "./pages/AttendancePage";

const AppRoutes = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/Login/:type"
        element={
          currentUser != null ? (
            currentUser.role == "trainer" ? (
              <Navigate to={`/Members/${currentUser.branch}`} />
            ) : (
              <Navigate to="/Dashboard" />
            )
          ) : (
            <LoginPage />
          )
        }
      />

      <Route path="/Members/:branch" element={<MembersPage />} />

      <Route
        path="/Dashboard"
        element={currentUser != null ? <DashboardPage /> : <HomePage />}
      />
      <Route path="/Attendance" element={<AttendancePage/>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
