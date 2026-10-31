import React, { useState, useEffect } from 'react';
import {
  X,
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
  Disc,
  Clock,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import VinylRecord3D from '../3d/VinylRecord3D.jsx';
import VisualizerBars3D from '../3d/VisualizerBars3D.jsx';

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
    nowPlayingTab,
    closeNowPlaying,
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
  const [activeTab, setActiveTab] = useState('record'); // 'record' | 'lyrics' | 'comments'
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [postingComment, setPostingComment] = useState(false);

  // Sync tab with nowPlayingTab whenever modal opens
  useEffect(() => {
    if (isNowPlayingOpen && nowPlayingTab) {
      setActiveTab(nowPlayingTab);
    }
  }, [isNowPlayingOpen, nowPlayingTab]);

  // Fetch comments and like status whenever track changes or modal opens
  useEffect(() => {
    if (currentTrack?._id && isNowPlayingOpen) {
      setIsLiked(!!currentTrack.isLiked);
      setLikesCount(currentTrack.likesCount || 0);

      api.getComments(currentTrack._id)
        .then((res) => setComments(res.comments || []))
        .catch((e) => console.warn('Failed to load notes:', e));
    }
  }, [currentTrack?._id, isNowPlayingOpen]);

  if (!isNowPlayingOpen || !currentTrack) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleLike(currentTrack._id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (e) {
      console.error(e);
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
      console.error('Failed to post note:', err);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto animate-fade-in select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Main Player Card */}
      <div className="relative w-full max-w-xl md:max-w-2xl glass-panel-glow rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-2xl border border-white/10 max-h-[92vh] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-3">
          {/* Track Info Preview */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-400 truncate">
              Now Playing
            </span>
          </div>

          {/* Clean Segmented Center Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-2xl border border-white/10 flex-shrink-0">
            <button
              onClick={() => setActiveTab('record')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'record'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Player</span>
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'lyrics'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'comments'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Notes</span>
              <span className="px-1.5 py-0.2 bg-zinc-800 rounded-md text-[10px] font-bold text-amber-300">
                {comments.length}
              </span>
            </button>
          </div>

          <button
            onClick={closeNowPlaying}
            className="p-1.5 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10 transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Dynamic Stage */}
        <div className="my-4 flex-1 flex flex-col items-center justify-center min-h-[310px] max-h-[350px] overflow-hidden">
          
          {/* TAB 1: 3D VINYL & FLUID SOUNDWAVE */}
          {activeTab === 'record' && (
            <div className="w-full flex flex-col items-center justify-center gap-3 animate-fade-in">
              <VinylRecord3D
                coverArtUrl={currentTrack.coverArtUrl}
                isPlaying={isPlaying}
              />

              {/* Fluid Neon Waveform Visualizer */}
              <div className="w-full max-w-sm flex justify-center">
                <VisualizerBars3D
                  barCount={36}
                  height={44}
                  className="w-full"
                  showControls={true}
                />
              </div>

              {/* Track Title & Artist */}
              <div className="text-center mt-1">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide truncate max-w-sm mx-auto">
                  {currentTrack.title}
                </h2>
                <p className="text-xs sm:text-sm text-purple-300 font-medium truncate mt-0.5">
                  {currentTrack.artistName || currentTrack.artist?.displayName}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {currentTrack.genre}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/30">
                    {currentTrack.mood}
                  </span>
                  {currentTrack.bpm && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-zinc-800 text-zinc-400">
                      {currentTrack.bpm} BPM
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLEAN SYNCHRONIZED LYRICS */}
          {activeTab === 'lyrics' && (
            <div className="w-full h-full flex flex-col bg-zinc-900/50 rounded-2xl p-4 sm:p-5 border border-white/5 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white truncate">{currentTrack.title} — Lyrics</h3>
                  <p className="text-[10px] text-zinc-400">Click any line to seek playback</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Original Master
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 text-left scrollbar-thin">
                {currentTrack.lyrics ? (
                  currentTrack.lyrics.split('\n').map((line, idx) => {
                    const isHeader = line.startsWith('[');
                    return (
                      <div
                        key={idx}
                        className={`transition-colors ${
                          isHeader
                            ? 'pt-2 pb-0.5'
                            : 'text-zinc-300 hover:text-amber-300 cursor-pointer text-xs sm:text-sm font-medium leading-relaxed'
                        }`}
                        onClick={() => {
                          if (!isHeader && duration) {
                            const approxPos = Math.min(
                              duration,
                              Math.max(0, (idx / currentTrack.lyrics.split('\n').length) * duration)
                            );
                            seek(approxPos);
                          }
                        }}
                      >
                        {isHeader ? (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {line.replace(/\[|\]/g, '')}
                          </span>
                        ) : (
                          <p className="select-text">{line || '\u00A0'}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-10">
                    <Mic2 className="w-8 h-8 text-zinc-600 mb-2 stroke-1" />
                    <p className="text-xs sm:text-sm font-semibold text-zinc-400">No Synced Lyrics</p>
                    <p className="text-[11px] text-zinc-600 mt-1 max-w-xs">
                      Creator uploaded this track as an instrumental studio sound.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COMMUNITY NOTES & TIMESTAMPS */}
          {activeTab === 'comments' && (
            <div className="w-full h-full flex flex-col bg-zinc-900/50 rounded-2xl p-4 border border-white/5 animate-fade-in overflow-hidden">
              {/* Note Composer Input */}
              <form onSubmit={handlePostComment} className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      isAuthenticated
                        ? `Drop note at @${formatTime(currentTime)}...`
                        : 'Sign in to drop a note on this verse...'
                    }
                    className="w-full pl-3 pr-16 py-2 rounded-xl glass-input text-xs"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                    @{formatTime(currentTime)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={postingComment}
                  className="btn-gradient-neon px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>

              {/* Notes Feed */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-left scrollbar-thin">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-10">
                    <MessageSquare className="w-8 h-8 text-zinc-600 mb-2 stroke-1" />
                    <p className="text-xs font-semibold text-zinc-400">No Community Notes Yet</p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Be the first to timestamp and drop your thoughts on this verse!
                    </p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c._id}
                      className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-purple-500/30 transition-all flex items-start justify-between gap-2.5 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <img
                          src={
                            c.user?.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user?.username || 'user'}`
                          }
                          alt={c.user?.displayName}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white truncate">
                              {c.user?.displayName || 'Fuzi Creator'}
                            </span>
                            {c.audioTimestamp !== null && c.audioTimestamp !== undefined && (
                              <button
                                type="button"
                                onClick={() => seek(Number(c.audioTimestamp))}
                                className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 font-mono transition-colors flex items-center gap-0.5"
                                title="Jump to timestamp"
                              >
                                <Clock className="w-2.5 h-2.5" />
                                <span>@{formatTime(c.audioTimestamp)}</span>
                              </button>
                            )}
                          </div>
                          <p className="text-zinc-300 mt-0.5 leading-snug break-words">{c.text}</p>
                        </div>
                      </div>

                      {(user?._id === c.user?._id || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded-lg transition-colors flex-shrink-0"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Playback Section (Always Anchored Cleanly) */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          {/* Progress Bar & Seek */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg accent-purple-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3">
            {/* Left Quick Social: Like & Share */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${
                  isLiked
                    ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-md shadow-pink-500/20'
                    : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white'
                }`}
                title="Like Track"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-pink-500' : ''}`} />
                <span className="text-[11px]">{likesCount}</span>
              </button>

              <button
                onClick={() => onOpenAddToPlaylist?.(currentTrack)}
                className="p-1.5 rounded-full bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Add to Playlist"
              >
                <ListPlus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenShare?.(currentTrack)}
                className="p-1.5 rounded-full bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Share Track"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Core Playback Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-xl text-xs transition-colors ${
                  isShuffled ? 'text-cyan-400 bg-cyan-400/10' : 'text-zinc-500 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevTrack}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full btn-gradient-neon flex items-center justify-center text-white shadow-xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-xl text-xs transition-colors ${
                  repeatMode !== 'off' ? 'text-purple-400 bg-purple-400/10' : 'text-zinc-500 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Right Speed & Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={cycleSpeed}
                className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-purple-300 transition-colors"
                title="Speed"
              >
                <Gauge className="w-3 h-3 text-purple-400" />
                <span>{playbackSpeed}x</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
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
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
