import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { UserRole } from '../features/auth/types/auth.types';

interface Props {
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
