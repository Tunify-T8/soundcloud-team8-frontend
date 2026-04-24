import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasValidSession } from '../features/auth/utils/token.utils';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!hasValidSession()) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;