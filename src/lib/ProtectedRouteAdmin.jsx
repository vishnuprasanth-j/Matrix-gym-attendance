import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const ProtectedRouteAdmin = () => {
  const { currentUser, authPending } = useContext(AuthContext);

  if (authPending) {
    return <div>Authenticating</div>;
  }
  if (currentUser?.role && currentUser.role == "admin") {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default ProtectedRouteAdmin;
