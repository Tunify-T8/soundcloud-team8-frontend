import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser, hasValidSession } from '../features/auth/utils/token.utils';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	if (!hasValidSession()) {
		return <Navigate to="/signin" replace />;
	}

	const user = getStoredUser();
	const role = user?.role?.toLowerCase();
	const isAdmin = role === 'admin';

	if (!isAdmin) {
		return <Navigate to="/library" replace />;
	}

	return <>{children}</>;
};

export default AdminRoute;