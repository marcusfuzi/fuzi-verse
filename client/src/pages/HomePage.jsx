import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Play,
  Pause,
  Flame,
  Heart,
  Plus,
  ArrowRight,
  Headphones,
  Music2,
  Sparkles,
  TrendingUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  Disc,
  Clock,
  Sun,
  Moon,
  Sunset,
  Radio,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { api } from '../services/api.js';

export default function HomePage({
  tracks = [],
  creators = [],
  playlists = [],
  historyTracks = [],
  onNavigate,
  onOpenShare,
  onOpenAddToPlaylist,
  onOpenDownload,
}) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [followingMap, setFollowingMap] = useState({});
  const [likedMap, setLikedMap] = useState({});

  // Hero Carousel State & Theme Configuration
  const heroTracks = (tracks || []).filter((t) => !t.isBlocked && t.audioUrl).slice(0, 6);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const safeHeroIndex = heroTracks.length > 0 ? activeHeroIndex % heroTracks.length : 0;
  const activeHeroTrack = heroTracks[safeHeroIndex] || (tracks && tracks[0]) || null;
  const nextHeroIndex = heroTracks.length > 1 ? (safeHeroIndex + 1) % heroTracks.length : null;
  const nextHeroTrack = nextHeroIndex !== null ? heroTracks[nextHeroIndex] : null;

  const isHeroPlaying = isPlaying && currentTrack?._id === activeHeroTrack?._id;
  const isHeroLiked = activeHeroTrack ? (likedMap[activeHeroTrack._id] ?? activeHeroTrack.isLiked) : false;

  // Ultra-vibrant ambient lighting presets
  const AMBIENT_THEMES = [
    {
      tag: 'Trending Worldwide 🔥',
      vibe: 'Lossless 24-Bit Studio',
      glowAura: 'rgba(168, 85, 247, 0.45)',
      glowOrb1: 'bg-purple-600/40',
      glowOrb2: 'bg-pink-500/30',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20',
      accentColor: '#c084fc',
      playGradient: 'from-purple-500 via-indigo-600 to-purple-600',
    },
    {
      tag: 'Fuzi Spotlight ⭐',
      vibe: 'Top Charting Release',
      glowAura: 'rgba(245, 158, 11, 0.45)',
      glowOrb1: 'bg-amber-500/40',
      glowOrb2: 'bg-orange-600/30',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20',
      accentColor: '#fbbf24',
      playGradient: 'from-amber-400 via-orange-500 to-amber-500',
    },
    {
      tag: 'Fresh Drop ⚡',
      vibe: 'Independent Masterpiece',
      glowAura: 'rgba(16, 185, 129, 0.42)',
      glowOrb1: 'bg-emerald-500/40',
      glowOrb2: 'bg-teal-500/30',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20',
      accentColor: '#34d399',
      playGradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    },
    {
      tag: 'Curated Verse 🎧',
      vibe: 'Editorial Sound Selection',
      glowAura: 'rgba(59, 130, 246, 0.45)',
      glowOrb1: 'bg-blue-600/40',
      glowOrb2: 'bg-cyan-500/30',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/20',
      accentColor: '#60a5fa',
      playGradient: 'from-blue-500 via-indigo-600 to-cyan-500',
    },
    {
      tag: 'Midnight Lo-Fi ✨',
      vibe: 'Deep Focus & Chillout',
      glowAura: 'rgba(236, 72, 153, 0.45)',
      glowOrb1: 'bg-pink-600/40',
      glowOrb2: 'bg-purple-600/30',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-pink-500/20',
      accentColor: '#f472b6',
      playGradient: 'from-pink-500 via-rose-500 to-purple-600',
    },
  ];

  const currentTheme = AMBIENT_THEMES[safeHeroIndex % AMBIENT_THEMES.length];

  const handlePrevSlide = (e) => {
    e?.stopPropagation?.();
    if (heroTracks.length <= 1) return;
    setActiveHeroIndex((prev) => (prev === 0 ? heroTracks.length - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    e?.stopPropagation?.();
    if (heroTracks.length <= 1) return;
    setActiveHeroIndex((prev) => (prev + 1) % heroTracks.length);
  };

  // Auto-slide every 5 seconds smoothly, pause when user hovers or interacts
  useEffect(() => {
    if (heroTracks.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroTracks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroTracks.length, isHovered]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun, color: 'text-amber-400' };
    if (hour < 18) return { text: 'Good afternoon', icon: Sunset, color: 'text-orange-400' };
    return { text: 'Good evening', icon: Moon, color: 'text-indigo-400' };
  };

  const greeting = getTimeGreeting();
  const GreetingIcon = greeting.icon;

  // Interactive Genre / Vibe Chips
  const vibeChips = [
    { name: 'All', label: 'All Sounds', icon: Sparkles, iconColor: 'text-purple-400' },
    { name: 'Hip-Hop', label: 'Hip-Hop', icon: Flame, iconColor: 'text-orange-400' },
    { name: 'Lo-Fi', label: 'Chill Lo-Fi', icon: Headphones, iconColor: 'text-emerald-400' },
    { name: 'Synthwave', label: 'Synthwave 80s', icon: Disc, iconColor: 'text-pink-400' },
    { name: 'EDM', label: 'EDM & Bass', icon: TrendingUp, iconColor: 'text-blue-400' },
    { name: 'Indie', label: 'Indie Verse', icon: Music2, iconColor: 'text-amber-400' },
    { name: 'Acoustic', label: 'Acoustic Soul', icon: Heart, iconColor: 'text-rose-400' },
  ];

  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredTracks =
    selectedGenre === 'All' ? tracks : tracks.filter((t) => t.genre === selectedGenre);

  const handleFollowToggle = async (creatorId) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleFollow(creatorId);
      setFollowingMap((prev) => ({
        ...prev,
        [creatorId]: res.following,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeToggle = async (track, e) => {
    e?.stopPropagation?.();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleLike(track._id);
      setLikedMap((prev) => ({
        ...prev,
        [track._id]: res.liked,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return '3:05';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-28">
      {/* Header Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GreetingIcon className={`w-5 h-5 ${greeting.color} animate-pulse`} />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAuthenticated ? `${greeting.text}, ${user?.displayName}` : 'Welcome to Fuzi Verse'}
            </h1>
            {isAuthenticated && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                PRO CREATOR
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Discover original indie sounds, studio masters, and trending releases.
          </p>
        </div>

        {/* Studio Hi-Fi Status Badge */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0e111a]/80 border border-white/10 backdrop-blur-md text-xs shadow-sm">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-zinc-300 font-medium">Studio Audio Engine:</span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">320kbps Lossless</span>
        </div>
      </div>

      {/* Dynamic Vibe / Genre Interactive Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {vibeChips.map((chip) => {
          const isSelected = selectedGenre === chip.name;
          const ChipIcon = chip.icon;
          return (
            <button
              key={chip.name}
              onClick={() => setSelectedGenre(chip.name)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 border cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                  : 'bg-[#0f1118]/80 hover:bg-[#161a26] text-zinc-400 hover:text-white border-white/[0.08] hover:border-white/20 backdrop-blur-md'
              }`}
            >
              <ChipIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : chip.iconColor}`} />
              <span>{chip.label}</span>
              {isSelected && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold ml-0.5">
                  {filteredTracks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Animated Hero Carousel with Deluxe Vinyl Sleeve Showcase */}
      {activeHeroTrack && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative rounded-3xl overflow-hidden border border-white/[0.14] p-6 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] transition-all duration-1000 group select-none"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.glowAura} 0%, rgba(10, 11, 18, 0.94) 65%, #07080c 100%)`,
          }}
        >
          {/* Dynamic Ambient Background Blur Image (Smooth 1000ms transition) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              key={`bg-${activeHeroTrack._id}`}
              src={activeHeroTrack.coverArtUrl}
              alt=""
              className="w-full h-full object-cover scale-150 blur-[100px] opacity-35 brightness-75 transition-all duration-1000 animate-fade-in"
            />
            {/* Shifting Colorful Neon Lighting Spheres */}
            <div className={`absolute -top-28 -left-28 w-96 h-96 ${currentTheme.glowOrb1} rounded-full blur-[110px] transition-all duration-1000 animate-pulse`} />
            <div className={`absolute -bottom-28 right-1/4 w-[420px] h-[420px] ${currentTheme.glowOrb2} rounded-full blur-[130px] transition-all duration-1000`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-black/40 to-black/20" />
          </div>

          {/* Left / Right Slide Navigation Buttons with Glass Backdrop */}
          {heroTracks.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 hover:border-white/40 backdrop-blur-xl transition-all duration-200 active:scale-90 shadow-2xl flex items-center justify-center cursor-pointer hover:shadow-purple-500/20"
                title="Previous Song"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 hover:border-white/40 backdrop-blur-xl transition-all duration-200 active:scale-90 shadow-2xl flex items-center justify-center cursor-pointer hover:shadow-purple-500/20"
                title="Next Song"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Left Content Area */}
            <div key={`content-${activeHeroTrack._id}`} className="max-w-xl text-center lg:text-left animate-fade-in flex-1">
              {/* Dynamic Theme Badge with Live Equalizer Waves */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-3.5 flex-wrap">
                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide border shadow-md backdrop-blur-md transition-all duration-500 ${currentTheme.badgeBg}`}>
                  {/* Live Equalizer Bars */}
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className={`w-0.75 rounded-full bg-current ${isHeroPlaying ? 'animate-soundwave-1' : 'h-1.5'}`} />
                    <span className={`w-0.75 rounded-full bg-current ${isHeroPlaying ? 'animate-soundwave-2' : 'h-3'}`} />
                    <span className={`w-0.75 rounded-full bg-current ${isHeroPlaying ? 'animate-soundwave-3' : 'h-2'}`} />
                    <span className={`w-0.75 rounded-full bg-current ${isHeroPlaying ? 'animate-soundwave-4' : 'h-3.5'}`} />
                  </div>
                  <span>{currentTheme.tag}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                  {currentTheme.vibe}
                </span>

                <span className="text-[10px] text-zinc-400 font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  {safeHeroIndex + 1} / {heroTracks.length}
                </span>
              </div>

              {/* Song Title with Dynamic Text Glow */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                {activeHeroTrack.title}
              </h2>

              {/* Artist Name & Stats with Artist Avatar Chip */}
              <div className="mt-3.5 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <div
                  onClick={() => onNavigate('profile', activeHeroTrack.artist?._id || activeHeroTrack.artist)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all duration-200 group/artist"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30 bg-zinc-800 flex-shrink-0">
                    <img
                      src={activeHeroTrack.artist?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeHeroTrack.artistName || 'artist'}`}
                      alt={activeHeroTrack.artistName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${activeHeroTrack.artistName || 'artist'}`;
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white group-hover/artist:underline">
                    {activeHeroTrack.artistName}
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[8px] font-black">
                    ✓
                  </span>
                </div>

                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-zinc-400" />
                  {activeHeroTrack.playsCount || 0} plays
                </span>

                {activeHeroTrack.likesCount > 0 && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      {activeHeroTrack.likesCount}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-300/85 mt-3.5 leading-relaxed line-clamp-2 max-w-lg">
                {activeHeroTrack.description || 'Streaming now in studio HD lossless sound on Fuzi Verse.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                {/* Play Now Button with Pulsing Shadow Ring */}
                <button
                  onClick={() => {
                    if (isHeroPlaying) togglePlay();
                    else playTrack(activeHeroTrack, tracks);
                  }}
                  className={`px-7 py-3 rounded-full text-xs font-extrabold text-black transition-all duration-300 flex items-center gap-2.5 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 ${
                    isHeroPlaying
                      ? 'bg-white shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                      : 'bg-white shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                  }`}
                >
                  {isHeroPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-black text-black" />
                      <span>Pause Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                      <span>Play in Studio Sound</span>
                    </>
                  )}
                </button>

                {/* Like / Heart Button */}
                <button
                  onClick={(e) => handleLikeToggle(activeHeroTrack, e)}
                  className={`p-3 rounded-full border transition-all duration-200 active:scale-90 backdrop-blur-md cursor-pointer ${
                    isHeroLiked
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-300 hover:text-white'
                  }`}
                  title={isHeroLiked ? 'Liked' : 'Like Song'}
                >
                  <Heart className={`w-4 h-4 ${isHeroLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* Save to Playlist */}
                <button
                  onClick={() => onOpenAddToPlaylist?.(activeHeroTrack)}
                  className="px-5 py-3 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save to Playlist</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => onOpenShare?.(activeHeroTrack)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  title="Share Track"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Showcase: Deluxe Vinyl Sleeve + Slipping Grooved LP Disc */}
            <div
              key={`art-${activeHeroTrack._id}`}
              onClick={() => {
                if (isHeroPlaying) togglePlay();
                else playTrack(activeHeroTrack, tracks);
              }}
              className="relative flex-shrink-0 flex items-center justify-center cursor-pointer select-none py-3 pr-6 sm:pr-10 animate-fade-in group/vinyl"
            >
              {/* Photorealistic Grooved Vinyl LP Disc Slipping Out */}
              <div
                className={`absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2.5 transition-all duration-700 ease-out z-10 ${
                  isHeroPlaying
                    ? 'translate-x-12 sm:translate-x-16 rotate-45'
                    : 'translate-x-6 sm:translate-x-8 group-hover/vinyl:translate-x-10'
                }`}
                style={{
                  background:
                    'radial-gradient(circle, #27282b 0%, #15161a 30%, #08090b 60%, #1a1b22 85%, #050608 100%)',
                  boxShadow: isHeroPlaying
                    ? `0 20px 45px rgba(0,0,0,0.9), 0 0 35px ${currentTheme.glowAura}, inset 0 0 10px rgba(255,255,255,0.2)`
                    : '0 15px 35px rgba(0,0,0,0.85), inset 0 0 5px rgba(255,255,255,0.1)',
                }}
              >
                {/* Concentric Micro-Groove Rings */}
                <div className="absolute inset-2.5 rounded-full border border-white/[0.07] pointer-events-none" />
                <div className="absolute inset-5 rounded-full border border-white/[0.05] pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/[0.06] pointer-events-none" />
                <div className="absolute inset-11 rounded-full border border-white/[0.05] pointer-events-none" />
                <div className="absolute inset-14 rounded-full border border-white/[0.07] pointer-events-none" />

                {/* Specular Light Reflection Cones (Realistic LP Sheen) */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-screen"
                  style={{
                    background:
                      'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.2) 40deg, transparent 80deg, transparent 180deg, rgba(255,255,255,0.2) 220deg, transparent 260deg)',
                  }}
                />

                {/* Center Spinning Label Sticker with Album Artwork */}
                <div
                  className={`absolute inset-0 m-auto w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-zinc-950 shadow-inner ${
                    isHeroPlaying ? 'animate-spin-slow' : ''
                  }`}
                >
                  <img
                    src={activeHeroTrack.coverArtUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Spindle hole */}
                  <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-[#06070a] border border-white/40 shadow-inner" />
                </div>
              </div>

              {/* Front Album Sleeve (Jacket) with Glossy Film & Badges */}
              <div className="relative z-20 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-2 border-white/20 bg-zinc-900 group-hover/vinyl:scale-102 transition-all duration-300">
                <img
                  src={activeHeroTrack.coverArtUrl}
                  alt={activeHeroTrack.title}
                  className="w-full h-full object-cover"
                />

                {/* Diagonal Plastic Jacket Reflection */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)',
                  }}
                />

                {/* Hover Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/vinyl:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform scale-80 group-hover/vinyl:scale-100 transition-transform">
                    {isHeroPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                  </div>
                </div>

                {/* Bottom Badge Bar */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-white px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 shadow-lg">
                  <span className="capitalize">{activeHeroTrack.genre || 'Music'}</span>
                  <span>{formatTime(activeHeroTrack.duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Slide Progress Indicators (Stories Style) + Up Next Teaser */}
          {heroTracks.length > 1 && (
            <div className="relative z-20 mt-8 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              {/* Progress Bars */}
              <div className="flex items-center gap-2 flex-1 max-w-md">
                {heroTracks.map((ht, idx) => {
                  const isActive = idx === safeHeroIndex;
                  return (
                    <button
                      key={ht._id}
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 relative overflow-hidden cursor-pointer ${
                        isActive ? 'flex-1 bg-white/30' : 'w-5 bg-white/15 hover:bg-white/30'
                      }`}
                      title={ht.title}
                    >
                      {isActive && (
                        <div
                          className={`h-full rounded-full transition-all ${isHovered ? '' : 'animate-progress-timer'}`}
                          style={{
                            backgroundColor: currentTheme.accentColor,
                            boxShadow: `0 0 10px ${currentTheme.accentColor}`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status and Up Next Preview Pill */}
              <div className="flex items-center gap-3 text-xs">
                {isHovered ? (
                  <span className="text-amber-400 font-bold text-[11px]">⏸ Auto-slide Paused</span>
                ) : (
                  nextHeroTrack && (
                    <button
                      onClick={handleNextSlide}
                      className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer group/next"
                      title={`Up Next: ${nextHeroTrack.title}`}
                    >
                      <span className="text-zinc-500 font-medium">Up Next:</span>
                      <img
                        src={nextHeroTrack.coverArtUrl}
                        alt=""
                        className="w-4 h-4 rounded-xs object-cover"
                      />
                      <span className="font-semibold truncate max-w-[130px]">{nextHeroTrack.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover/next:translate-x-0.5 transition-transform" />
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Featured Artists / Creators */}
      {creators.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Featured Artists & Creators</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Top musicians sharing original verses & beats</p>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer"
            >
              Explore all →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {creators.slice(0, 8).map((creator) => {
              const isFollowed = followingMap[creator._id] ?? creator.isFollowing;
              return (
                <div
                  key={creator._id}
                  className="bg-[#10121a]/90 hover:bg-[#151824] rounded-2xl p-4 border border-white/[0.06] hover:border-purple-500/40 transition-all duration-300 flex flex-col items-center text-center group shadow-md hover:shadow-purple-500/10"
                >
                  <div
                    onClick={() => onNavigate('profile', creator._id)}
                    className="relative cursor-pointer mb-3"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-purple-500/40 via-transparent to-amber-500/40 group-hover:from-purple-500 group-hover:to-amber-500 transition-all">
                      <img
                        src={creator.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.username}`}
                        alt={creator.displayName}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.username || 'artist'}`;
                        }}
                      />
                    </div>
                    {creator.isVerified && (
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#10121a] shadow">
                        ✓
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => onNavigate('profile', creator._id)}
                    className="text-sm font-bold text-white truncate max-w-full cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    {creator.displayName}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {(creator.followersCount || 0).toLocaleString()} followers
                  </p>

                  <button
                    onClick={() => handleFollowToggle(creator._id)}
                    className={`mt-3.5 w-full py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isFollowed
                        ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
                        : 'bg-white text-black hover:bg-purple-100 font-bold shadow-md hover:scale-[1.02]'
                    }`}
                  >
                    {isFollowed ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Fresh Releases & Trending Tracks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span>Fresh Releases & Trending Tracks</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {selectedGenre === 'All'
                ? 'Top stream songs and popular releases'
                : `Filtered by ${selectedGenre}`}
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer"
          >
            Show all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTracks.map((track) => {
            const isThisPlaying = isPlaying && currentTrack?._id === track._id;
            const isTrackLiked = likedMap[track._id] ?? track.isLiked;

            return (
              <div
                key={track._id}
                className={`rounded-2xl p-3 border transition-all duration-300 flex items-center gap-3.5 group cursor-pointer ${
                  isThisPlaying
                    ? 'border-purple-500/70 bg-gradient-to-r from-purple-950/40 to-[#121422] shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'bg-[#10121a]/90 hover:bg-[#161824] border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                {/* Cover Art with Hover Play */}
                <div
                  onClick={() => playTrack(track, filteredTracks)}
                  className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 shadow-md"
                >
                  <img
                    src={track.coverArtUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Track Details */}
                <div
                  onClick={() => playTrack(track, filteredTracks)}
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {track.title}
                    </h4>
                    {isThisPlaying && (
                      <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                        <span className="w-0.5 rounded-full bg-purple-400 animate-soundwave-1" />
                        <span className="w-0.5 rounded-full bg-purple-400 animate-soundwave-2" />
                        <span className="w-0.5 rounded-full bg-purple-400 animate-soundwave-3" />
                      </div>
                    )}
                  </div>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('profile', track.artist?._id || track.artist);
                    }}
                    className="text-[11px] text-zinc-400 truncate hover:text-white mt-0.5"
                  >
                    {track.artistName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                    <span className="capitalize">{track.genre || 'Sound'}</span>
                    <span>•</span>
                    <span>{formatTime(track.duration)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleLikeToggle(track, e)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isTrackLiked
                        ? 'text-rose-500'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                    title={isTrackLiked ? 'Liked' : 'Like'}
                  >
                    <Heart className={`w-4 h-4 ${isTrackLiked ? 'fill-rose-500' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddToPlaylist?.(track);
                    }}
                    className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Add to Playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenShare?.(track);
                    }}
                    className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Share Track"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curated Playlists */}
      {playlists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Disc className="w-5 h-5 text-purple-400" />
                <span>Curated Playlists</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Hand-picked mixes and themed soundscapes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl._id}
                onClick={() => onNavigate('playlist', pl._id)}
                className="bg-[#10121a]/90 hover:bg-[#161824] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-purple-500/40 cursor-pointer transition-all duration-300 group shadow-md"
              >
                <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={pl.coverArtUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-black/30 to-transparent" />
                  {pl.mood && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-zinc-200 backdrop-blur-md border border-white/10 uppercase tracking-wide">
                      {pl.mood}
                    </span>
                  )}
                  {/* Play icon overlay */}
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {pl.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{pl.description}</p>
                  <p className="text-[11px] text-zinc-500 mt-2 font-medium">
                    {pl.tracks?.length || 0} songs • Curated by Fuzi Verse
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Played Section */}
      {historyTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              <span>Recently Played</span>
            </h3>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {historyTracks.slice(0, 8).map((track) => {
              const isHistPlaying = isPlaying && currentTrack?._id === track._id;
              return (
                <div
                  key={track._id}
                  onClick={() => playTrack(track, historyTracks)}
                  className={`w-36 flex-shrink-0 bg-[#10121a] hover:bg-[#161822] rounded-2xl p-2.5 border transition-all cursor-pointer group ${
                    isHistPlaying
                      ? 'border-purple-500/60 bg-purple-950/20'
                      : 'border-white/[0.05] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-900 shadow-sm">
                    <img
                      src={track.coverArtUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isHistPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isHistPlaying ? (
                        <Pause className="w-5 h-5 fill-white text-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>
                  <h5 className="text-xs font-semibold text-white truncate">{track.title}</h5>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artistName}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
