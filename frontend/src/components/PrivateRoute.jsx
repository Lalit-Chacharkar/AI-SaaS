// ─────────────────────────────────────────────
// components/PrivateRoute.jsx
// Job: Block unauthenticated users from protected pages
// React version of our authMiddleware from the backend
// ─────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
// Navigate = a component that redirects to another page

import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  // Get the token from our global auth context

  if (!token) {
    // No token = not logged in → redirect to login page
    // replace={true} = replaces history entry (can't go "back" to protected page)
    return <Navigate to="/login" replace />;
  }

  // Token exists → render the actual page component
  return children;
};

export default PrivateRoute;
