import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem', fontFamily: 'sans-serif' }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <p>Logged in as: {user?.email} ({user?.role})</p>
      <Link to="/login" style={{ color: '#007bff' }}>Return to Login</Link>
    </div>
  );
};
