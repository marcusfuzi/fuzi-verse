import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Upload,
  Bell,
  User,
  LogOut,
  ShieldAlert,
  Sliders,
  Library,
  Check,
  Disc,
  Sparkles,
  Smartphone,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import FuziLogoOfficial from '../ui/FuziLogoOfficial.jsx';

export default function Navbar({ onNavigate, currentRoute, onSearch, onOpenDownload }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://') ||
      localStorage.getItem('fuzi_app_installed') === 'true'
    );
  });

  useEffect(() => {
    const handleInstalled = () => {
      localStorage.setItem('fuzi_app_installed', 'true');
      setIsAppInstalled(true);
    };
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('fuzi-app-installed', handleInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('fuzi-app-installed', handleInstalled);
    };
  }, []);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then((res) => {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
      onNavigate?.('explore');
    }
  };

  const markAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Official Brand Logo */}
      <div
        onClick={() => onNavigate('home')}
        className="cursor-pointer group"
      >
        <FuziLogoOfficial size="md" variant="round" showText={true} />
      </div>

      {/* Global Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-md hidden md:flex items-center relative"
      >
        <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, or genres..."
          className="w-full pl-10 pr-4 py-2 rounded-full glass-input text-sm placeholder-zinc-500 focus:ring-1 focus:ring-purple-500"
        />
      </form>

      {/* Actions & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Quick Search Button */}
        <button
          onClick={() => onNavigate('explore')}
          className="md:hidden p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
          aria-label="Search"
          title="Search songs and artists"
        >
          <Search className="w-4 h-4 text-amber-400" />
        </button>

        {/* Get ↗ App Download Button - Hidden when app is downloaded/installed */}
        {!isAppInstalled && (
          <button
            onClick={onOpenDownload}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-black px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
            title="Download FUZI VERSE App"
          >
            <span>Get</span>
            <span className="text-[11px] font-black">↗</span>
          </button>
        )}

        {/* Upload Button */}
        <button
          onClick={() => {
            if (!isAuthenticated) openAuthModal('login');
            else onNavigate('upload');
          }}
          className="btn-gradient-neon px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all hidden md:flex"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Track</span>
        </button>

        {isAuthenticated ? (
          <>
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-purple-500/50 text-zinc-300 hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 glass-panel-glow rounded-2xl p-4 shadow-2xl z-50 text-xs border border-white/10">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                    <span className="font-bold text-white text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-500 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-xl transition-colors ${
                            n.isRead ? 'bg-zinc-900/40' : 'bg-purple-900/20 border border-purple-500/30'
                          }`}
                        >
                          <p className="text-zinc-200">{n.message}</p>
                          <span className="text-[10px] text-zinc-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-full bg-zinc-900/80 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`
                  }
                  alt={user?.displayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden md:inline">
                  {user?.displayName}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 glass-panel-glow rounded-2xl p-2 shadow-2xl z-50 text-xs border border-white/10 space-y-1">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="font-bold text-white truncate">{user?.displayName}</p>
                    <p className="text-zinc-400 text-[11px] truncate">@{user?.username}</p>
                    {isAdmin ? (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 font-bold border border-red-500/40">
                        🛡️ Platform Administrator
                      </span>
                    ) : (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-medium">
                        🎵 Fuzi Verse Member
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left font-medium"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    My Profile & Photo
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('library');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <Library className="w-4 h-4 text-cyan-400" />
                    My Library & Likes
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('creator-dashboard');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Studio & Analytics
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors text-left font-bold border border-red-500/30"
                    >
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      Admin (Songs & Block IDs)
                    </button>
                  )}

                  <div className="border-t border-white/10 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="btn-gradient-gold px-4 py-1.5 rounded-full text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
