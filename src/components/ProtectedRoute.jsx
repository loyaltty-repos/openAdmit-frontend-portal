import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isPublicRoute, getUser } from '@/lib/auth';
import PropTypes from 'prop-types';
import { canAccessDashboard } from '@/lib/paymentGuard';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const currentPath = location.pathname;
  const user = getUser();

  if (!isPublicRoute(currentPath) && !isAuth) {
    return <Navigate to="/signin" state={{ from: currentPath }} replace />;
  }

  if (currentPath.startsWith('/dashboard')) {
    if (user?.role === 'ADMIN' || user?.role === 'EDITOR' || user?.role === 'VIEWER') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role !== 'STUDENT') {
      return <Navigate to="/signin" replace />;
    }

    // Check payment and verification status for student dashboard access
    if (!canAccessDashboard()) {
      return <Navigate to="/pricing" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;