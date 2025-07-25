import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (
    location.pathname === '/user-management' &&
    userData.role !== 'super_admin'
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;