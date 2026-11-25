import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { getUserProfile } from '../redux/slices/authSlice';
import LoadingSpinner from './common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  /** Avoid dispatching getUserProfile in a tight loop if Redux and effect get out of sync */
  const profileFetchStartedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      profileFetchStartedForToken.current = null;
      return;
    }
    if (token && !user && profileFetchStartedForToken.current !== token) {
      profileFetchStartedForToken.current = token;
      dispatch(getUserProfile());
    }
  }, [dispatch, token, user]);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If still loading, show loading indicator
  if (loading) {
    return <LoadingSpinner message="Checking your session..." />;
  }

  // If we have role restrictions and the user doesn't have the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;