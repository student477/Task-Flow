import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  CheckSquare,
  Users2,
  BarChart3,
  Settings,
  Layers,
  ChevronDown,
  Sparkles,
  LogOut,
  FolderPlus
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, projects = [] }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban, badge: projects.length > 0 ? String(projects.length) : undefined },
    { label: 'Kanban Board', path: '/board', icon: KanbanSquare },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || 'TaskFlow User';
  const displayRole = user?.organization || 'Personal Workspace';
  const displayInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                TaskFlow
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  MERN
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-slate-800/60">
          <div className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 text-slate-200 border border-slate-700/50">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded bg-brand-500/30 text-brand-300 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.organization ? user.organization[0].toUpperCase() : 'W'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.organization || 'Default Workspace'}
                </div>
                <div className="text-[11px] text-slate-400">Connected to MongoDB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Active Projects */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Active Projects</span>
              <button
                title="Create Project"
                onClick={() => navigate('/projects')}
                className="hover:text-white text-slate-400 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((proj) => (
                  <div
                    key={proj._id}
                    onClick={() => {
                      navigate(`/board?project=${proj._id}`);
                      if (onClose) onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color || '#4f46e5' }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {proj.progress !== undefined ? `${proj.progress}%` : proj.key}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-[11px] text-slate-500">
                  No projects yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <Avatar
              name={displayName}
              initials={displayInitials}
              bg={user?.avatarColor || 'bg-brand-600'}
              size="sm"
              status="online"
            />
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {displayRole}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Profile & Settings"
              onClick={() => {
                navigate('/settings');
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              title="Sign Out"
              onClick={handleSignOut}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
