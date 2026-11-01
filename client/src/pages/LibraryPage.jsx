import React, { useState, useEffect } from 'react';
import {
  Heart,
  Library,
  ListMusic,
  History,
  Users,
  Play,
  Pause,
  Plus,
  Trash2,
  Lock,
  Globe,
  Upload,
  Edit2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import EditTrackModal from '../components/modals/EditTrackModal.jsx';

export default function LibraryPage({
  onNavigate,
  onOpenCreatePlaylist,
  onOpenShare,
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  const [activeTab, setActiveTab] = useState('liked'); // 'liked' | 'uploads' | 'playlists' | 'history' | 'following'
  const [likedTracks, setLikedTracks] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [history, setHistory] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrack, setEditingTrack] = useState(null);

  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [likedRes, uploadsRes, plRes, histRes, folRes] = await Promise.all([
        api.getLikedTracks(),
        api.getMyUploads(),
        api.getMyPlaylists(),
        api.getHistory(),
        api.getFollowingCreators(),
      ]);
      setLikedTracks(likedRes.tracks || []);
      setUploads(uploadsRes.tracks || []);
      setPlaylists(plRes.playlists || []);
      setHistory(histRes.tracks || []);
      setFollowing(folRes.creators || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleDeleteUpload = async (trackId) => {
    if (!window.confirm('Are you sure you want to delete this track?')) return;
    try {
      await api.deleteTrack(trackId);
      setUploads(uploads.filter((t) => t._id !== trackId));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Library className="w-12 h-12 text-cyan-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Your Personal Sound Library</h2>
        <p className="text-xs text-zinc-400">
          Sign in to access your liked songs, custom playlists, upload collection, and followed creators.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="btn-gradient-neon px-8 py-2.5 rounded-full text-xs font-bold shadow-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">My Library</h1>
          <p className="text-xs text-zinc-400">Manage your saved tracks, playlists, and uploads</p>
        </div>
        <button
          onClick={onOpenCreatePlaylist}
          className="btn-gradient-gold px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'liked'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          <span>Liked Songs ({likedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'uploads'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>My Uploads ({uploads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'playlists'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5 text-amber-400" />
          <span>My Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recently Played ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'following'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Followed Creators ({following.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center py-16 text-zinc-500 text-xs">Loading library items...</p>
      ) : (
        <div>
          {/* Liked Songs */}
          {activeTab === 'liked' && (
            <div className="space-y-2">
              {likedTracks.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs glass-panel rounded-2xl p-6">
                  <p>You haven't liked any songs yet.</p>
                  <button
                    onClick={() => onNavigate('explore')}
                    className="mt-3 text-purple-400 hover:underline font-semibold"
                  >
                    Explore tracks to like
                  </button>
                </div>
              ) : (
                likedTracks.map((track) => (
                  <div
                    key={track._id}
                    onClick={() => playTrack(track, likedTracks)}
                    className="glass-panel rounded-2xl p-3 border border-white/5 hover:border-purple-500/30 flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.coverArtUrl}
                        alt={track.title}
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">{track.artistName}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-full btn-gradient-neon text-white">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Uploads */}
          {activeTab === 'uploads' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => onNavigate('upload')}
                  className="btn-gradient-neon px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload New Master</span>
                </button>
              </div>

              {uploads.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs glass-panel rounded-2xl p-6">
                  <p>You haven't uploaded any music yet.</p>
                  <button
                    onClick={() => onNavigate('upload')}
                    className="mt-3 text-purple-400 hover:underline font-semibold"
                  >
                    Upload your first sound
                  </button>
                </div>
              ) : (
                uploads.map((track) => (
                  <div
                    key={track._id}
                    className="glass-panel rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div
                      onClick={() => playTrack(track, uploads)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    >
                      <img
                        src={track.coverArtUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                          {track.isPublic ? (
                            <span className="flex items-center gap-1 text-[9px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                              <Globe className="w-2.5 h-2.5" /> Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              <Lock className="w-2.5 h-2.5" /> Private
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">{track.genre} • {track.playsCount} plays</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playTrack(track, uploads)}
                        className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                      >
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </button>
                      <button
                        onClick={() => setEditingTrack(track)}
                        className="p-2 rounded-full bg-amber-500/10 hover:bg-amber-400 text-amber-300 hover:text-black transition-colors"
                        title="Edit Song Name & Photo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpload(track._id)}
                        className="p-2 rounded-full bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Playlists */}
          {activeTab === 'playlists' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl._id}
                  onClick={() => onNavigate('playlist', pl._id)}
                  className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-purple-500/40 cursor-pointer transition-all"
                >
                  <img
                    src={pl.coverArtUrl}
                    alt={pl.title}
                    className="w-full h-36 rounded-xl object-cover mb-3"
                  />
                  <h4 className="text-sm font-bold text-white truncate">{pl.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{pl.tracks?.length || 0} songs</p>
                </div>
              ))}
            </div>
          )}

          {/* Recently Played */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {history.map((track) => (
                <div
                  key={track._id}
                  onClick={() => playTrack(track, history)}
                  className="glass-panel rounded-2xl p-3 border border-white/5 hover:border-purple-500/30 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverArtUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{track.title}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{track.artistName}</p>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-zinc-400" />
                </div>
              ))}
            </div>
          )}

          {/* Followed Creators */}
          {activeTab === 'following' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {following.map((creator) => (
                <div
                  key={creator._id}
                  onClick={() => onNavigate('artist', creator._id)}
                  className="glass-panel rounded-2xl p-4 border border-white/5 text-center cursor-pointer hover:border-purple-500/30 transition-all"
                >
                  <img
                    src={creator.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.username}`}
                    alt={creator.displayName}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border border-white/10"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.username || 'artist'}`;
                    }}
                  />
                  <h4 className="text-xs font-bold text-white truncate">{creator.displayName}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">@{creator.username}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Track Modal (Song Name & Photo) */}
      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          isOpen={!!editingTrack}
          onClose={() => setEditingTrack(null)}
          onUpdated={(updated) => {
            setUploads(uploads.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
          }}
        />
      )}
    </div>
  );
}
