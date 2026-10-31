import React from 'react';
import { Home, Compass, Plus, Globe, Music2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MobileNav({ currentRoute, onNavigate }) {
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      onNavigate('upload');
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-3 left-4 right-4 z-40 bg-[#0e121b]/90 backdrop-blur-xl border border-white/10 rounded-3xl px-4 py-2 flex items-center justify-between shadow-2xl shadow-black/80">
      {/* Home / Feed */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
          currentRoute === 'home' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        aria-label="Feed"
      >
        <Home className="w-5 h-5" />
      </button>

      {/* Explore / Search */}
      <button
        onClick={() => onNavigate('explore')}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
          currentRoute === 'explore' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        aria-label="Explore"
      >
        <Compass className="w-5 h-5" />
      </button>

      {/* Central Elevated Gold Action Button (+) */}
      <button
        onClick={handleUploadClick}
        className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 hover:scale-110 active:scale-95 transition-transform"
        aria-label="Upload Music"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Beat Tools / Globe */}
      <button
        onClick={() => onNavigate('create')}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
          currentRoute === 'create' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        aria-label="Beat Tools"
      >
        <Globe className="w-5 h-5" />
      </button>

      {/* Library */}
      <button
        onClick={() => onNavigate('library')}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
          currentRoute === 'library' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        aria-label="Library"
      >
        <Music2 className="w-5 h-5" />
      </button>
    </nav>
  );
}
