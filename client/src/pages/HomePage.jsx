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

  // Hero Carousel State & Theme Configuration
  const heroTracks = (tracks || []).filter((t) => !t.isBlocked && t.audioUrl).slice(0, 6);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const safeHeroIndex = heroTracks.length > 0 ? activeHeroIndex % heroTracks.length : 0;
  const activeHeroTrack = heroTracks[safeHeroIndex] || (tracks && tracks[0]) || null;
  const isHeroPlaying = isPlaying && currentTrack?._id === activeHeroTrack?._id;

  const AMBIENT_THEMES = [
    {
      tag: 'Trending Worldwide 🔥',
      glowAura: 'rgba(168, 85, 247, 0.35)',
      glowOrb1: 'bg-purple-600/35',
      glowOrb2: 'bg-pink-500/25',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      accentColor: '#c084fc',
    },
    {
      tag: 'Fuzi Spotlight ⭐',
      glowAura: 'rgba(245, 158, 11, 0.35)',
      glowOrb1: 'bg-amber-500/35',
      glowOrb2: 'bg-red-500/25',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accentColor: '#fbbf24',
    },
    {
      tag: 'Fresh Drop ⚡',
      glowAura: 'rgba(16, 185, 129, 0.32)',
      glowOrb1: 'bg-emerald-500/35',
      glowOrb2: 'bg-cyan-500/25',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accentColor: '#34d399',
    },
    {
      tag: 'Curated Verse 🎧',
      glowAura: 'rgba(59, 130, 246, 0.35)',
      glowOrb1: 'bg-blue-600/35',
      glowOrb2: 'bg-cyan-500/25',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      accentColor: '#60a5fa',
    },
    {
      tag: 'Top Indie Stream ✨',
      glowAura: 'rgba(236, 72, 153, 0.35)',
      glowOrb1: 'bg-pink-600/35',
      glowOrb2: 'bg-purple-600/25',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      accentColor: '#f472b6',
    },
  ];

  const currentTheme = AMBIENT_THEMES[safeHeroIndex % AMBIENT_THEMES.length];

  const handlePrevSlide = () => {
    if (heroTracks.length <= 1) return;
    setActiveHeroIndex((prev) => (prev === 0 ? heroTracks.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Find a solid featured track
  const featuredTrack =
    tracks.find((t) => t.isFeatured) ||
    tracks.find((t) => t.title.toLowerCase().includes('whispered')) ||
    tracks[0];
  const isFeaturedPlaying = isPlaying && currentTrack?._id === featuredTrack?._id;

  const genres = ['All', 'Hip-Hop', 'Synthwave', 'Lo-Fi', 'EDM', 'Indie', 'Acoustic'];
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

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return '3:05';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-10 pb-28">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isAuthenticated ? `${getGreeting()}, ${user?.displayName}` : 'Welcome to Fuzi Verse'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Stream new releases, indie tracks, and curated sounds.
          </p>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div
        onClick={() => onNavigate('explore')}
        className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-[#0c1017]/90 hover:bg-[#121824] border border-white/10 hover:border-amber-400/50 text-zinc-400 hover:text-white cursor-pointer shadow-xl transition-all group select-none active:scale-[0.99]"
      >
        <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="text-xs sm:text-sm font-medium">Search any song title, artist name, beats, or lyrics...</span>
      </div>

      {/* Dynamic Animated Hero Carousel with Shifting Ambient Lighting */}
      {activeHeroTrack && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative rounded-3xl overflow-hidden border border-white/[0.12] p-6 sm:p-9 shadow-2xl transition-all duration-1000 group select-none"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.glowAura} 0%, rgba(12, 13, 20, 0.95) 75%)`,
          }}
        >
          {/* Dynamic Ambient Background Blur Image (Changes with smooth 1000ms transition) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              key={activeHeroTrack._id}
              src={activeHeroTrack.coverArtUrl}
              alt=""
              className="w-full h-full object-cover scale-150 blur-[90px] opacity-40 brightness-75 transition-all duration-1000 animate-fade-in"
            />
            {/* Shifting Colorful Neon Lighting Spheres */}
            <div className={`absolute -top-24 -left-24 w-80 h-80 ${currentTheme.glowOrb1} rounded-full blur-[100px] transition-all duration-1000 animate-pulse`} />
            <div className={`absolute -bottom-24 right-1/4 w-96 h-96 ${currentTheme.glowOrb2} rounded-full blur-[120px] transition-all duration-1000`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-black/40 to-black/20" />
          </div>

          {/* Left / Right Slide Navigation Chevrons */}
          {heroTracks.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 hover:border-white/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95 shadow-xl hidden sm:flex items-center justify-center"
                title="Previous Song"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 hover:border-white/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95 shadow-xl hidden sm:flex items-center justify-center"
                title="Next Song"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10">
            {/* Left Content (Animated with Key Transition) */}
            <div key={`content-${activeHeroTrack._id}`} className="max-w-xl text-center md:text-left animate-fade-in">
              {/* Dynamic Theme Badge */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-sm backdrop-blur-md transition-all duration-500 ${currentTheme.badgeBg}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentTheme.tag}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {activeHeroIndex + 1} / {heroTracks.length}
                </span>
              </div>

              {/* Song Title with Dynamic Text Glow */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {activeHeroTrack.title}
              </h2>

              {/* Artist Name & Stats */}
              <div className="mt-2.5 flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <p
                  onClick={() => onNavigate('profile', activeHeroTrack.artist?._id || activeHeroTrack.artist)}
                  className="text-sm font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors"
                >
                  by <strong className="hover:underline" style={{ color: currentTheme.accentColor }}>{activeHeroTrack.artistName}</strong>
                </p>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                  <Headphones className="w-3 h-3 text-zinc-500" />
                  {activeHeroTrack.playsCount || 0} plays
                </span>
                {activeHeroTrack.likesCount > 0 && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-500" />
                      {activeHeroTrack.likesCount}
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-300/80 mt-3.5 leading-relaxed line-clamp-2 max-w-lg">
                {activeHeroTrack.description || 'Streaming now in studio HD audio quality on Fuzi Verse.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
                <button
                  onClick={() => {
                    if (isHeroPlaying) togglePlay();
                    else playTrack(activeHeroTrack, tracks);
                  }}
                  className="px-7 py-3 rounded-full text-xs font-bold text-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl cursor-pointer"
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: `0 8px 30px ${currentTheme.glowAura}`,
                  }}
                >
                  {isHeroPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-black" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                      <span>Play Now</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenAddToPlaylist?.(activeHeroTrack)}
                  className="px-5 py-3 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all active:scale-95"
                >
                  Save to Playlist
                </button>

                <button
                  onClick={() => onOpenShare?.(activeHeroTrack)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white backdrop-blur-md transition-all active:scale-95"
                  title="Share Track"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Album Artwork with Vinyl Float Effect */}
            <div
              key={`art-${activeHeroTrack._id}`}
              onClick={() => {
                if (isHeroPlaying) togglePlay();
                else playTrack(activeHeroTrack, tracks);
              }}
              className="relative flex-shrink-0 group cursor-pointer animate-fade-in"
            >
              {/* Spinning Disc Aura behind artwork when playing */}
              {isHeroPlaying && (
                <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-purple-500/40 via-amber-400/40 to-emerald-400/40 blur-xl animate-spin-slow opacity-80" />
              )}

              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-zinc-900 group-hover:scale-105 transition-all duration-500">
                <img
                  src={activeHeroTrack.coverArtUrl}
                  alt={activeHeroTrack.title}
                  className="w-full h-full object-cover"
                />

                {/* Hover Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                    {isHeroPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                  </div>
                </div>
              </div>

              {/* Bottom Badge Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
                <span className="capitalize">{activeHeroTrack.genre || 'Music'}</span>
                <span>{formatTime(activeHeroTrack.duration)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Slide Progress Indicators (Stories Style) */}
          {heroTracks.length > 1 && (
            <div className="relative z-20 mt-8 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                {heroTracks.map((ht, idx) => {
                  const isActive = idx === activeHeroIndex;
                  return (
                    <button
                      key={ht._id}
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 relative overflow-hidden ${
                        isActive ? 'flex-1 bg-white/40' : 'w-5 bg-white/15 hover:bg-white/30'
                      }`}
                      title={ht.title}
                    >
                      {isActive && (
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: currentTheme.accentColor,
                            width: '100%',
                            boxShadow: `0 0 10px ${currentTheme.accentColor}`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Slide Counter & Pause Status */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                {isHovered && <span className="text-amber-400 font-bold">⏸ Paused</span>}
                <span>Auto-playing in studio sound</span>
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
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Artists & Creators
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Musicians sharing original sounds</p>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {creators.slice(0, 8).map((creator) => {
              const isFollowed = followingMap[creator._id] ?? creator.isFollowing;
              return (
                <div
                  key={creator._id}
                  className="bg-[#10121a] hover:bg-[#161822] rounded-2xl p-4 border border-white/[0.05] hover:border-white/[0.12] transition-all flex flex-col items-center text-center group"
                >
                  <div
                    onClick={() => onNavigate('profile', creator._id)}
                    className="relative cursor-pointer mb-3"
                  >
                    <img
                      src={creator.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.username}`}
                      alt={creator.displayName}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/10 group-hover:border-purple-400 transition-colors shadow-md"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.username || 'artist'}`;
                      }}
                    />
                    {creator.isVerified && (
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#10121a]">
                        ✓
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => onNavigate('profile', creator._id)}
                    className="text-sm font-bold text-white truncate max-w-full cursor-pointer hover:underline"
                  >
                    {creator.displayName}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {(creator.followersCount || 0).toLocaleString()} followers
                  </p>

                  <button
                    onClick={() => handleFollowToggle(creator._id)}
                    className={`mt-3.5 w-full py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isFollowed
                        ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
                        : 'bg-white text-black hover:bg-zinc-200'
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

      {/* Genre Filter Pills & Trending Tracks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span>Fresh Releases & Trending Tracks</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">New uploads and popular independent releases</p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors"
          >
            Show all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTracks.map((track) => {
            const isThisPlaying = isPlaying && currentTrack?._id === track._id;
            return (
              <div
                key={track._id}
                className={`bg-[#10121a] hover:bg-[#161822] rounded-2xl p-3 border transition-all flex items-center gap-3.5 group cursor-pointer ${
                  isThisPlaying
                    ? 'border-purple-500/60 bg-purple-950/20'
                    : 'border-white/[0.05] hover:border-white/[0.12]'
                }`}
              >
                <div
                  onClick={() => playTrack(track, filteredTracks)}
                  className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900"
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

                <div
                  onClick={() => playTrack(track, filteredTracks)}
                  className="min-w-0 flex-1"
                >
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </h4>
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
                    <span>{track.genre || 'Sound'}</span>
                    <span>•</span>
                    <span>{formatTime(track.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddToPlaylist?.(track);
                    }}
                    className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors"
                    title="Add to Playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenShare?.(track);
                    }}
                    className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors"
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
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Curated Playlists
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Hand-picked mixes and artist spotlights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl._id}
                onClick={() => onNavigate('playlist', pl._id)}
                className="bg-[#10121a] hover:bg-[#161822] rounded-2xl overflow-hidden border border-white/[0.05] hover:border-white/[0.12] cursor-pointer transition-all group"
              >
                <div className="relative h-32 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={pl.coverArtUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-transparent to-transparent" />
                  {pl.mood && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-zinc-200 backdrop-blur-md">
                      {pl.mood}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-white truncate">{pl.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{pl.description}</p>
                  <p className="text-[11px] text-zinc-500 mt-2">{pl.tracks?.length || 0} songs</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Played */}
      {historyTracks.length > 0 && (
        <section>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4">
            Recently Played
          </h3>
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
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-900">
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
