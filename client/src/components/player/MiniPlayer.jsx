import React, { useState } from 'react';
import {
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
  Maximize2,
  ListMusic,
  Share2,
  Disc,
  Mic2,
  MessageSquare,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export default function MiniPlayer({ onNavigate, onOpenShare }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    queue,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    openNowPlaying,
  } = usePlayer();

  const { isAuthenticated, openAuthModal } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  // Sync like state when track changes
  React.useEffect(() => {
    if (currentTrack) {
      setIsLiked(!!currentTrack.isLiked);
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleLike(currentTrack._id);
      setIsLiked(res.liked);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mini Player Bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-50 glass-panel border-t border-purple-500/20 px-3 lg:px-6 py-2.5 backdrop-blur-2xl shadow-2xl">
        {/* Progress Bar Top Edge */}
        <div className="absolute -top-1 left-0 right-0 h-1 bg-zinc-800/80 group">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer z-10"
          />
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 min-w-0 max-w-[35%] lg:max-w-[28%]">
            <div
              onClick={openNowPlaying}
              className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 shadow-md"
            >
              <img
                src={
                  currentTrack.coverArtUrl ||
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'
                }
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4
                  onClick={openNowPlaying}
                  className="text-xs lg:text-sm font-semibold text-white truncate cursor-pointer hover:text-purple-300 transition-colors"
                >
                  {currentTrack.title}
                </h4>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3 flex-shrink-0" title="Audio streaming">
                    <span className="w-0.5 h-full bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-2/3 bg-purple-400 rounded-full animate-bounce" style={{ animationDuration: '0.45s', animationDelay: '0.1s' }} />
                    <span className="w-0.5 h-5/6 bg-pink-400 rounded-full animate-bounce" style={{ animationDuration: '0.55s', animationDelay: '0.2s' }} />
                    <span className="w-0.5 h-1/2 bg-amber-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s', animationDelay: '0.15s' }} />
                  </div>
                )}
              </div>
              <p
                onClick={() => {
                  if (currentTrack.artist?._id || currentTrack.artist) {
                    onNavigate('artist', currentTrack.artist?._id || currentTrack.artist);
                  }
                }}
                className="text-[11px] text-zinc-400 truncate cursor-pointer hover:text-zinc-200 transition-colors"
              >
                {currentTrack.artistName || currentTrack.artist?.displayName || 'Independent Creator'}
              </p>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ${
                isLiked ? 'text-pink-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500' : ''}`} />
            </button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:block ${
                  isShuffled ? 'text-cyan-400 bg-cyan-400/10' : 'text-zinc-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              {/* Prev */}
              <button
                onClick={prevTrack}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full btn-gradient-neon flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-purple-400 bg-purple-400/10' : 'text-zinc-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Timestamps */}
            <div className="w-full flex items-center justify-between text-[10px] text-zinc-500 px-2 hidden sm:flex">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Extra Controls */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Volume Slider */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-zinc-700 rounded-lg accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Lyrics Button */}
            <button
              onClick={() => openNowPlaying('lyrics')}
              className="p-1.5 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-purple-500/50 text-zinc-400 hover:text-purple-300 transition-colors hidden sm:flex items-center gap-1"
              title="View Synced Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            {/* Notes Button */}
            <button
              onClick={() => openNowPlaying('comments')}
              className="p-1.5 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-cyan-500/50 text-zinc-400 hover:text-cyan-300 transition-colors hidden sm:flex items-center gap-1"
              title="View Community Notes"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setShowQueueDrawer(!showQueueDrawer)}
              className={`p-1.5 rounded-xl border transition-colors ${
                showQueueDrawer
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Fullscreen 3D Expand */}
            <button
              onClick={openNowPlaying}
              className="p-1.5 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-purple-500/50 text-zinc-300 hover:text-white transition-colors"
              title="3D Immersive Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Up Next Queue Drawer */}
      {showQueueDrawer && (
        <div className="fixed bottom-32 lg:bottom-20 right-4 w-80 glass-panel-glow rounded-3xl p-4 shadow-2xl z-50 border border-white/10 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-bold text-white text-sm">Up Next ({queue.length})</span>
            <button
              onClick={() => setShowQueueDrawer(false)}
              className="text-zinc-500 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {queue.length === 0 ? (
              <p className="text-zinc-500 text-center py-6">Queue is empty</p>
            ) : (
              queue.map((track, idx) => (
                <div
                  key={`${track._id}-${idx}`}
                  onClick={() => playTrack(track, queue)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                    track._id === currentTrack._id
                      ? 'bg-purple-600/30 border border-purple-500/40 text-white'
                      : 'hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  <img
                    src={track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                    alt={track.title}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{track.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{track.artistName}</p>
                  </div>
                  {track._id === currentTrack._id && (
                    <Disc className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
