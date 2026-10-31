import React from 'react';
import {
  Home,
  Compass,
  Wand2,
  Library,
  Flame,
  ListMusic,
  BarChart3,
  ShieldCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar({ currentRoute, onNavigate, collapsed, setCollapsed, onOpenDownload }) {
  const { isAuthenticated, isAdmin, isCreator } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'create', label: 'Beat Studio', icon: Wand2 },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col glass-panel border-r border-white/10 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <div className="p-4 flex items-center justify-end border-b border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-zinc-900/60 border border-white/10 hover:border-purple-500/50 text-zinc-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-3 py-1">
          {!collapsed && 'Discover'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/40 shadow-lg shadow-purple-500/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-purple-400' : 'text-zinc-400'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Studio Section for all logged-in members */}
        {isAuthenticated && (
          <>
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-3 pt-5 pb-1">
              {!collapsed && 'Creator Studio'}
            </div>
            <button
              onClick={() => onNavigate('creator-dashboard')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                currentRoute === 'creator-dashboard'
                  ? 'bg-purple-600/30 text-white border border-purple-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? 'Studio & Analytics' : undefined}
            >
              <BarChart3 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              {!collapsed && <span>Studio & Analytics</span>}
            </button>
          </>
        )}

        {/* Admin Section */}
        {isAuthenticated && isAdmin && (
          <>
            <div className="text-[10px] uppercase font-bold tracking-wider text-red-500 px-3 pt-5 pb-1">
              {!collapsed && 'Moderation & Safety'}
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                currentRoute === 'admin'
                  ? 'bg-red-600/30 text-white border border-red-500/40'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              }`}
              title={collapsed ? 'Admin Moderation' : undefined}
            >
              <ShieldCheck className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              {!collapsed && <span>Admin (Moderation)</span>}
            </button>
          </>
        )}
      </div>

      {/* Footer Creator Badge */}
      {!collapsed && (
        <div className="p-3.5 m-3 rounded-2xl bg-zinc-900/50 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Fuzi Verse</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed mb-2">
            Stream, create, and share your sound.
          </p>
          <button
            onClick={() => onNavigate('legal-terms')}
            className="text-[10px] text-zinc-400 hover:text-amber-300 underline transition-colors"
          >
            Copyright & Guidelines
          </button>
        </div>
      )}
    </aside>
  );
}
