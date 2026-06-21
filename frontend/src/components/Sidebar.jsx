import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarOpen } from '../store/uiSlice';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/dashboard/overview', label: 'Overview', icon: 'monitoring' },
  { to: '/dashboard/registry', label: 'Registry', icon: 'stacks' },
  { to: '/dashboard/game/create', label: 'Add Game', icon: 'add_circle' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: 'insights' },
  { to: '/dashboard/admin', label: 'Admin', icon: 'admin_panel_settings' },
];

const Sidebar = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 w-64 z-40 bg-nexus-sidebar border-r border-border-light flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => dispatch(setSidebarOpen(false))}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-primary/10 text-primary border border-primary/15 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-light border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-xl transition-colors ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-light">
        <div className="nexus-glass-light rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">System Online</span>
          </div>
          <p className="text-[10px] font-mono text-text-muted/60">
            NEXUS v2.0 — Steam Analytics
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
