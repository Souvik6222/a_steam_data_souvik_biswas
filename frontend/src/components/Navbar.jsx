import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../store/uiSlice';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggle: toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border-light" style={{ background: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(20px)' }}>
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary opacity-60" />

      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left: Menu toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="md:hidden w-9 h-9 rounded-xl bg-surface-light border border-border-light flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg nexus-btn-gradient flex items-center justify-center shadow-glow">
              <span className="material-symbols-outlined text-white text-lg">hub</span>
            </div>
            <span className="font-headline font-bold text-base tracking-tight text-text-primary hidden sm:block group-hover:text-primary-light transition-colors">
              NEXUS
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-surface-light border border-border-light flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            <span className="material-symbols-outlined text-lg">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 ml-2">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-headline font-semibold text-text-primary">{user.name}</span>
                <span className="text-[10px] text-text-muted">{user.role || 'user'}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-headline font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl bg-surface-light border border-border-light flex items-center justify-center text-text-secondary hover:text-danger hover:border-danger/30 transition-all cursor-pointer"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
