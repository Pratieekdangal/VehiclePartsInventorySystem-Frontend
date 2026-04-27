import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/auth';

export default function ProtectedRoute({ children, allow }) {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
