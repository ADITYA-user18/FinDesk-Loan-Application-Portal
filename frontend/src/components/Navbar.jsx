import { NavLink, useNavigate } from 'react-router-dom';
import { Landmark, LayoutDashboard, FilePlus, ClipboardList, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, isAgent, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo — Landmark icon representing FinDesk */}
        <NavLink to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Landmark size={18} strokeWidth={2.5} color="#000" />
          </div>
          <span className="navbar-logo-text">Fin<span>Desk</span></span>
        </NavLink>

        {/* Nav links */}
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              {!isAgent && (
                <NavLink to="/apply" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <FilePlus size={16} /> <span>Apply</span>
                </NavLink>
              )}
              {isAgent && (
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <LayoutDashboard size={16} /> <span>Dashboard</span>
                </NavLink>
              )}
              {!isAgent && (
                <NavLink to="/my-applications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <ClipboardList size={16} /> <span>My Applications</span>
                </NavLink>
              )}
            </>
          ) : null}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggle} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <div className="user-pill">
              <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
              <div className="user-info" style={{ lineHeight: 1.2 }}>
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-logout" style={{ marginLeft: 2 }}>
                <LogOut size={14} /> <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">Get Started</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
