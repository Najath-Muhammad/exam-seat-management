import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#343a40', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Exam System Admin</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user?.name || 'Admin'}</span>
          <button 
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: '250px', backgroundColor: '#f8f9fa', padding: '1rem', borderRight: '1px solid #dee2e6' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Navigation</li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>Dashboard Overview</Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/admin/exams" style={{ textDecoration: 'none', color: '#007bff' }}>Exams & Sessions</Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/admin/seats" style={{ textDecoration: 'none', color: '#007bff' }}>Physical Seats</Link>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', backgroundColor: '#ffffff' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
