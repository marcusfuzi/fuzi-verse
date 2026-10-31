import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Plus, Clock, User, Disc, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function PlaylistDetailsPage({ playlistId, onNavigate }) {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playlistId) return;
    setLoading(true);
    api.getPlaylist(playlistId)
      .then((res) => setPlaylist(res.playlist))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [playlistId]);

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 text-xs">Loading playlist...</div>;
  }

  if (!playlist) {
    return (
      <div className="text-center py-20 text-zinc-400 text-xs">
        <p className="font-bold text-white">Playlist not found.</p>
        <button onClick={() => onNavigate('home')} className="mt-3 text-purple-400 underline">
          Return Home
        </button>
      </div>
    );
  }

  const isOwner = user && playlist.creator?._id?.toString() === user._id?.toString();
  const tracks = playlist.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await api.removeTrackFromPlaylist(playlist._id, trackId);
      setPlaylist({
        ...playlist,
        tracks: playlist.tracks.filter((t) => t._id !== trackId),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const totalDurationSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const formatTotalTime = (secs) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Back button */}
      <button
        onClick={() => onNavigate('library')}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Hero */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <img
          src={playlist.coverArtUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'}
          alt={playlist.title}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover shadow-2xl flex-shrink-0"
        />

        <div className="flex-1 text-center md:text-left space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            {playlist.isMoodPlaylist ? 'Curated Mood Playlist' : 'User Playlist'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">{playlist.title}</h1>
          <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">{playlist.description}</p>
          <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-zinc-400 pt-2">
            <span>By {playlist.creator?.displayName || 'Fuzi Curator'}</span>
            <span>•</span>
            <span>{tracks.length} tracks</span>
            <span>•</span>
            <span>{formatTotalTime(totalDurationSecs)}</span>
          </div>

          <div className="pt-4 flex items-center justify-center md:justify-start gap-4">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="btn-gradient-neon px-8 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-2">
        {tracks.length === 0 ? (
          <p className="text-zinc-500 text-center py-12 text-xs">This playlist is currently empty.</p>
        ) : (
          tracks.map((track, idx) => {
            const isThisPlaying = isPlaying && currentTrack?._id === track._id;
            return (
              <div
                key={track._id}
                onClick={() => playTrack(track, tracks)}
                className={`glass-panel rounded-2xl p-3 border transition-all flex items-center justify-between gap-4 cursor-pointer group ${
                  isThisPlaying ? 'border-purple-500 bg-purple-900/20' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-xs font-mono text-zinc-500 w-5 text-center">{idx + 1}</span>
                  <img
                    src={track.coverArtUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300">
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">{track.artistName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 flex-shrink-0">
                  <span className="font-mono text-[11px] hidden sm:inline">
                    {Math.floor((track.duration || 120) / 60)}:
                    {((track.duration || 120) % 60).toString().padStart(2, '0')}
                  </span>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(track._id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button className="p-2 rounded-full btn-gradient-neon text-white">
                    {isThisPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-white" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
