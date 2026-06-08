import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Loader';

/**
 * Wraps routes that require authentication.
 * agentOnly   → borrowers are redirected to /apply
 * borrowerOnly → agents are redirected to /dashboard
 */
export default function ProtectedRoute({ children, agentOnly = false, borrowerOnly = false }) {
  const { isAuthenticated, isAgent, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (agentOnly && !isAgent) {
    return <Navigate to="/apply" replace />;
  }

  // Agents trying to reach borrower-only pages → redirect to dashboard
  if (borrowerOnly && isAgent) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
