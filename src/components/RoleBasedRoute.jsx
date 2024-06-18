// src/components/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

const RoleBasedRoute = ({ children, requiredRoles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!requiredRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;
