import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  MessageSquare,
  Share2,
  ListPlus,
  Send,
  Trash2,
  Sparkles,
  Gauge,
  Mic2,
  ListMusic,
  Disc,
  Clock,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export default function NowPlayingModal({ onOpenShare, onOpenAddToPlaylist }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    playbackSpeed,
    isNowPlayingOpen,
    queue,
    closeNowPlaying,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    changeSpeed,
  } = usePlayer();

  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Local view controls
  const [lyricsExpanded, setLyricsExpanded] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Likes & Comments
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const lyricsContainerRef = useRef(null);

  // Drawer state refs for popstate interception
  const lyricsExpandedRef = useRef(lyricsExpanded);
  const showNotesDrawerRef = useRef(showNotesDrawer);
  const showQueueDrawerRef = useRef(showQueueDrawer);
  const showOptionsMenuRef = useRef(showOptionsMenu);

  useEffect(() => { lyricsExpandedRef.current = lyricsExpanded; }, [lyricsExpanded]);
  useEffect(() => { showNotesDrawerRef.current = showNotesDrawer; }, [showNotesDrawer]);
  useEffect(() => { showQueueDrawerRef.current = showQueueDrawer; }, [showQueueDrawer]);
  useEffect(() => { showOptionsMenuRef.current = showOptionsMenu; }, [showOptionsMenu]);

  // Handle collapsing Now Playing player
  const handleCollapse = () => {
    if (showQueueDrawer) { setShowQueueDrawer(false); return; }
    if (lyricsExpanded) { setLyricsExpanded(false); return; }
    if (showNotesDrawer) { setShowNotesDrawer(false); return; }
    if (showOptionsMenu) { setShowOptionsMenu(false); return; }

    if (window.history?.state?.layer === 'player') {
      try {
        window.history.back();
        return;
      } catch (e) {}
    }
    closeNowPlaying();
  };

  // Synchronize drawer opening with history
  const anyDrawerOpen = Boolean(lyricsExpanded || showQueueDrawer || showNotesDrawer || showOptionsMenu);
  useEffect(() => {
    if (anyDrawerOpen) {
      if (window.history?.state?.drawer !== true) {
        try {
          window.history.pushState({ ...window.history?.state, drawer: true }, '');
        } catch (e) {}
      }
    }
  }, [anyDrawerOpen]);

  // Capture back button while drawers are open inside player
  useEffect(() => {
    if (!isNowPlayingOpen) return;

    const handleDrawerPop = (e) => {
      if (showQueueDrawerRef.current) {
        e.stopImmediatePropagation();
        setShowQueueDrawer(false);
        return;
      }
      if (showNotesDrawerRef.current) {
        e.stopImmediatePropagation();
        setShowNotesDrawer(false);
        return;
      }
      if (lyricsExpandedRef.current) {
        e.stopImmediatePropagation();
        setLyricsExpanded(false);
        return;
      }
      if (showOptionsMenuRef.current) {
        e.stopImmediatePropagation();
        setShowOptionsMenu(false);
        return;
      }
    };

    window.addEventListener('popstate', handleDrawerPop, true);
    return () => window.removeEventListener('popstate', handleDrawerPop, true);
  }, [isNowPlayingOpen]);

  // Sync like & comments when track changes or modal opens
  useEffect(() => {
    if (currentTrack?._id && isNowPlayingOpen) {
      setIsLiked(!!currentTrack.isLiked);
      setLikesCount(currentTrack.likesCount || 0);

      api.getComments(currentTrack._id)
        .then((res) => setComments(res.comments || []))
        .catch(() => {});
    }
  }, [currentTrack?._id, isNowPlayingOpen]);

  if (!isNowPlayingOpen || !currentTrack) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLike = async (e) => {
    e?.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleLike(currentTrack._id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!newComment.trim() || postingComment) return;

    setPostingComment(true);
    try {
      const res = await api.addComment(currentTrack._id, {
        text: newComment.trim(),
        audioTimestamp: Math.floor(currentTime),
      });
      if (res.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (e) {
      console.error(e);
    }
  };

  const speeds = [0.75, 1, 1.25, 1.5];
  const cycleSpeed = () => {
    const curIdx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(curIdx + 1) % speeds.length];
    changeSpeed(nextSpeed);
  };

  // Generate dynamic waveform bars (44 bars matching the design reference)
  const waveformBarsCount = 44;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Extract lyrics lines
  const lyricsLines = currentTrack.lyrics
    ? currentTrack.lyrics.split('\n').filter((l) => l.trim().length > 0)
    : [];

  // Approximate current active lyric index based on playback progress
  const activeLyricIndex = lyricsLines.length > 0 && duration
    ? Math.min(lyricsLines.length - 1, Math.floor((currentTime / duration) * lyricsLines.length))
    : 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-between overflow-hidden select-none bg-black text-white animate-fade-in">
      {/* 1. Dynamic Fullscreen Album Art Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={
            currentTrack.coverArtUrl ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
          }
          alt=""
          className="w-full h-full object-cover scale-150 blur-[90px] opacity-40 brightness-75 transition-all duration-1000"
        />
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-color" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] animate-pulse" />
      </div>

      {/* 2. Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-5 sm:px-8 pt-5 pb-2">
        {/* Left: Minimize / Collapse Chevron */}
        <button
          onClick={handleCollapse} className="p-2 -ml-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Collapse Player"
          aria-label="Collapse Player"
        >
          <ChevronDown className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Center: Context & Playlist Header */}
        <div className="text-center min-w-0 px-2 cursor-pointer" onClick={handleCollapse}>
          <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Playing From
          </p>
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs mx-auto">
            {currentTrack.genre ? `${currentTrack.genre} Mix` : 'FUZI VERSE'}
          </h3>
        </div>

        {/* Right: Actions Menu & Queue Pill */}
        <div className="flex items-center gap-2">
          {/* Side Floating Queue Pill (Matching Reference Concept Image!) */}
          <button
            onClick={() => setShowQueueDrawer(!showQueueDrawer)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-bold tracking-wider text-white backdrop-blur-md transition-all active:scale-95"
            title="Queue"
          >
            <ListMusic className="w-3.5 h-3.5 text-[#1ed760]" />
            <span>QUEUE</span>
          </button>

          {/* Three dots options */}
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 -mr-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
              title="More options"
              aria-label="More options"
            >
              <MoreHorizontal className="w-6 h-6 stroke-[2.2]" />
            </button>

            {/* Dropdown Menu */}
            {showOptionsMenu && (
              <div className="absolute right-0 top-12 w-48 bg-zinc-950/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 text-xs space-y-1 animate-fade-in">
                <button
                  onClick={() => {
                    onOpenAddToPlaylist?.(currentTrack);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                >
                  <ListPlus className="w-4 h-4 text-emerald-400" />
                  <span>Add to Playlist</span>
                </button>
                <button
                  onClick={() => {
                    onOpenShare?.(currentTrack);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Share Song</span>
                </button>
                <button
                  onClick={() => {
                    setShowNotesDrawer(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Notes ({comments.length})</span>
                </button>
                <button
                  onClick={cycleSpeed}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    Speed
                  </span>
                  <span className="font-mono text-amber-300">{playbackSpeed}x</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Side Queue Tab pinned to right screen edge (Matching Reference Concept Image!) */}
      <button
        onClick={() => setShowQueueDrawer(true)}
        className="fixed right-0 top-36 z-30 flex flex-col items-center gap-1.5 pl-2.5 pr-1.5 py-2.5 rounded-l-2xl bg-black/70 hover:bg-black/90 border-y border-l border-white/20 backdrop-blur-xl shadow-2xl transition-all active:scale-95 group cursor-pointer"
        title="Open Queue"
      >
        <ListMusic className="w-3.5 h-3.5 text-[#1ed760] group-hover:scale-110 transition-transform" />
        <span className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-bold tracking-widest text-zinc-300 group-hover:text-white">
          QUEUE
        </span>
      </button>

      {/* 3. Main Center Stage: Hero Album Artwork */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-2 min-h-0">
        <div className="relative group max-w-[270px] sm:max-w-sm md:max-w-md w-full aspect-square flex items-center justify-center">
          {/* Subtle Ambient Drop Glow behind artwork */}
          <div
            className="absolute inset-4 rounded-3xl opacity-60 blur-2xl transition-opacity duration-700"
            style={{
              backgroundImage: `url(${currentTrack.coverArtUrl})`,
              backgroundSize: 'cover',
            }}
          />

          {/* High-Resolution Hero Album Artwork */}
          <img
            src={
              currentTrack.coverArtUrl ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
            }
            alt={currentTrack.title}
            onClick={togglePlay}
            className="relative z-10 w-full h-full max-h-[250px] sm:max-h-[320px] md:max-h-[380px] object-cover rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 cursor-pointer active:scale-[0.98] transition-transform duration-300"
          />
        </div>
      </div>

      {/* 4. Bottom Controls & Interactive Lyrics Section */}
      <div className="relative z-20 w-full max-w-lg mx-auto px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-4">
        {/* Track Title, Artist & Glowing Green Heart */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate leading-tight">
              {currentTrack.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium truncate mt-0.5">
              {currentTrack.artistName || currentTrack.artist?.displayName || 'Independent Creator'}
            </p>
          </div>

          {/* Radiant Emerald Heart (Matching Concept Reference!) */}
          <button
            onClick={handleLike}
            className="p-2 -mr-2 rounded-full transition-all active:scale-125 flex-shrink-0"
            title={isLiked ? 'Unlike' : 'Like'}
            aria-label="Like"
          >
            <Heart
              className={`w-6 h-6 transition-all ${
                isLiked
                  ? 'text-[#1ed760] fill-[#1ed760] drop-shadow-[0_0_12px_rgba(30,215,96,0.9)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Audio-Reactive Waveform Equalizer (Matching Reference Image!) */}
        <div className="flex items-end justify-between h-9 px-1 gap-1 my-0.5">
          {Array.from({ length: waveformBarsCount }).map((_, i) => {
            const barPos = (i / waveformBarsCount) * 100;
            const isPlayed = barPos <= progressPercent;
            // Wave curvature simulation
            const wave = Math.sin((i / waveformBarsCount) * Math.PI * 2.5);
            const baseHeight = 25 + Math.abs(wave) * 55;
            const jitter = isPlaying ? ((i % 3 === 0 ? 25 : i % 2 === 0 ? -15 : 10) * Math.sin(currentTime * 4 + i)) : 0;
            const heightPct = Math.min(100, Math.max(18, baseHeight + jitter));

            return (
              <span
                key={i}
                onClick={() => {
                  if (duration) seek((barPos / 100) * duration);
                }}
                className={`w-1 rounded-full cursor-pointer transition-all duration-150 ${
                  isPlayed
                    ? 'bg-[#1ed760] shadow-[0_0_6px_rgba(30,215,96,0.6)]'
                    : 'bg-zinc-700/70 hover:bg-zinc-500'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="space-y-1.5 -mt-1">
          <div className="relative w-full h-1.5 bg-zinc-800/80 rounded-full cursor-pointer group flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Seek track"
            />
            {/* Played Emerald Line */}
            <div
              className="h-full bg-[#1ed760] rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              {/* White scrub thumb dot */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-black/80 scale-100 group-hover:scale-125 transition-transform" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls Row (Matching Reference Concept Image!) */}
        <div className="flex items-center justify-between px-1">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-all active:scale-90 ${
              isShuffled ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
            }`}
            title="Shuffle"
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            className="p-2 text-white hover:text-zinc-200 transition-transform active:scale-90"
            title="Previous"
            aria-label="Previous"
          >
            <SkipBack className="w-7 h-7 fill-white" />
          </button>

          {/* Large Solid White Play/Pause Button (Matching Concept Image!) */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-white/20 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black text-black" />
            ) : (
              <Play className="w-7 h-7 fill-black text-black ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="p-2 text-white hover:text-zinc-200 transition-transform active:scale-90"
            title="Next"
            aria-label="Next"
          >
            <SkipForward className="w-7 h-7 fill-white" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-all active:scale-90 ${
              repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
            aria-label="Repeat"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5 text-[#1ed760]" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Micro-interactions row (Matching Concept 1 Immersive Player) */}
        <div className="flex items-center justify-between px-3 -my-1 text-zinc-400">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-full transition-colors ${
              isMuted ? 'text-red-400' : 'hover:text-[#1ed760]'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onOpenShare?.(currentTrack)}
            className="p-1.5 rounded-full hover:text-[#1ed760] transition-colors"
            title="Share Song"
            aria-label="Share Song"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowQueueDrawer(true)}
            className="p-1.5 rounded-full hover:text-[#1ed760] transition-colors"
            title="View Queue"
            aria-label="View Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>

        {/* 5. Live Synced Lyrics Floating Card (Matching Concept Reference!) */}
        <div
          onClick={() => setLyricsExpanded(!lyricsExpanded)}
          className={`relative rounded-3xl bg-[#0a1213]/85 backdrop-blur-2xl border border-emerald-500/20 p-4 transition-all duration-300 cursor-pointer shadow-2xl shadow-emerald-950/40 hover:border-emerald-500/40 ${
            lyricsExpanded ? 'max-h-72' : 'max-h-32'
          } overflow-hidden`}
        >
          {/* Top Drag Handle */}
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-2 opacity-80" />

          {/* Lyrics Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#1ed760] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
              Live Lyrics
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-medium">
                {lyricsExpanded ? 'Tap to collapse' : 'Swipe up for lyrics'}
              </span>
              {lyricsExpanded ? (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </div>

          {/* Dynamic Scrolling Lyrics Text */}
          <div
            ref={lyricsContainerRef}
            className={`space-y-2 text-left transition-all ${
              lyricsExpanded ? 'overflow-y-auto max-h-52 pr-1 scrollbar-thin' : 'overflow-hidden'
            }`}
          >
            {lyricsLines.length > 0 ? (
              lyricsLines.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                const isHeader = line.startsWith('[');

                if (isHeader) {
                  return (
                    <p key={idx} className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest pt-1">
                      {line.replace(/\[|\]/g, '')}
                    </p>
                  );
                }

                return (
                  <p
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (duration) {
                        seek((idx / lyricsLines.length) * duration);
                      }
                    }}
                    className={`transition-all duration-300 font-bold ${
                      isActive
                        ? 'text-white text-base sm:text-lg leading-snug drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                        : 'text-zinc-500 hover:text-zinc-300 text-sm leading-snug'
                    }`}
                  >
                    {line}
                  </p>
                );
              })
            ) : (
              <div className="py-1 text-left space-y-1">
                <p className="text-white text-base sm:text-lg font-bold leading-snug drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                  Baby, I'm dancing
                </p>
                <p className="text-zinc-400 text-sm font-semibold leading-snug">
                  in the dark,
                </p>
                <p className="text-zinc-500 text-sm font-medium leading-snug">
                  with you between my arms...
                </p>
                <p className="text-[10px] text-emerald-400/80 font-bold tracking-wider pt-1 uppercase">
                  Let the music surround you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-in Queue Drawer (if user clicks QUEUE) */}
      {showQueueDrawer && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0c1017]/95 border-l border-white/10 z-50 p-5 backdrop-blur-2xl flex flex-col shadow-2xl animate-slide-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#1ed760]" />
              Up Next ({queue.length})
            </h3>
            <button
              onClick={() => {
              if (window.history?.state?.drawer) {
                try { window.history.back(); return; } catch (e) {}
              }
              setShowQueueDrawer(false);
            }} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {queue.map((track, idx) => (
              <div
                key={`${track._id}-${idx}`}
                onClick={() => {
                  playTrack(track, queue);
                  setShowQueueDrawer(false);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-colors ${
                  track._id === currentTrack._id
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-white'
                    : 'hover:bg-white/5 text-zinc-300'
                }`}
              >
                <img
                  src={track.coverArtUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs truncate">{track.title}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{track.artistName}</p>
                </div>
                {track._id === currentTrack._id && (
                  <Disc className="w-4 h-4 text-[#1ed760] animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-in Community Notes Drawer */}
      {showNotesDrawer && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0c1017]/95 border-l border-white/10 z-50 p-5 backdrop-blur-2xl flex flex-col shadow-2xl animate-slide-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Community Notes ({comments.length})
            </h3>
            <button
              onClick={() => {
              if (window.history?.state?.drawer) {
                try { window.history.back(); return; } catch (e) {}
              }
              setShowNotesDrawer(false);
            }} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handlePostComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Drop note at @${formatTime(currentTime)}...`}
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={postingComment}
              className="btn-gradient-neon px-3 py-2 rounded-xl text-xs font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {comments.map((c) => (
              <div key={c._id} className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{c.user?.displayName || 'Creator'}</span>
                  {c.audioTimestamp !== null && (
                    <button
                      onClick={() => seek(Number(c.audioTimestamp))}
                      className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 font-mono"
                    >
                      @{formatTime(c.audioTimestamp)}
                    </button>
                  )}
                </div>
                <p className="text-zinc-300">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
