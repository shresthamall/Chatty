import { useAuthenticationStatus } from '@nhost/react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    // While Nhost is checking the auth status, show a loading indicator.
    // This is crucial for preventing race conditions.
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the login page.
    return <Navigate to="/auth" replace />;
  }

  // If the user is authenticated, render the nested routes.
  return <Outlet />;
};

export default ProtectedRoute;
