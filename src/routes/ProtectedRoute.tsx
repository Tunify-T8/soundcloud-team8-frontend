import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../features/auth/utils/token.utils';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getAccessToken();
  if (!token) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;