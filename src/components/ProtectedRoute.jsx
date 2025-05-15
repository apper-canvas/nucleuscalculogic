import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to the login page with a return URL
    return <Navigate to={`/login?redirect=${location.pathname}${location.search}`} replace />;
  }

  return children;
};

export default ProtectedRoute;