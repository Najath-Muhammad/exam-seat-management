import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>⚡ ExamSystem</h1>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Dashboard Overview
          </NavLink>
          <NavLink 
            to="/admin/exams" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Exams & Sessions
          </NavLink>
          <NavLink 
            to="/admin/seats" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Physical Seats
          </NavLink>
          <NavLink 
            to="/admin/complaints" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            🔔 Complaints
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {getInitials(user?.name || 'A')}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Administrator'}</span>
              <span className="user-role">{user?.role || 'Admin'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="full-width btn-secondary"
            style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', marginTop: '0.5rem' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
