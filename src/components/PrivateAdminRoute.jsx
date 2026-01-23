import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { getUser, isAuthenticated } from "@/lib/auth";

const PrivateAdminRoute = ({ children }) => {
  const location = useLocation();
  const user = getUser();  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (!user || !['ADMIN', 'EDITOR', 'VIEWER'].includes(user.role)) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

PrivateAdminRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default PrivateAdminRoute;
