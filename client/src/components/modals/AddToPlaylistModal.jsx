import React, { useState, useEffect } from 'react';
import { X, ListPlus, Plus, Check, Music2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AddToPlaylistModal({ track, onClose, onCreatedNew }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getMyPlaylists()
      .then((res) => setPlaylists(res.playlists || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!track) return null;

  const handleAdd = async (playlistId) => {
    setAddingId(playlistId);
    setStatusMsg('');
    try {
      await api.addTrackToPlaylist(playlistId, track._id);
      setStatusMsg('Track added to playlist!');
      setTimeout(() => onClose?.(), 1000);
    } catch (err) {
      setStatusMsg(err.message || 'Failed to add');
    } finally {
      setAddingId(null);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await api.createPlaylist({
        title: newTitle.trim(),
        trackId: track._id,
      });
      setStatusMsg('Playlist created with this track!');
      onCreatedNew?.();
      setTimeout(() => onClose?.(), 1000);
    } catch (err) {
      setStatusMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm glass-panel-glow rounded-3xl p-6 shadow-2xl border border-white/10 text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900/60 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <ListPlus className="w-4 h-4 text-purple-400" />
          Add to Playlist
        </h3>
        <p className="text-zinc-400 truncate mb-4">Adding "{track.title}"</p>

        {statusMsg && (
          <div className="p-2.5 mb-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
            {statusMsg}
          </div>
        )}

        {/* Existing Playlists */}
        <div className="max-h-56 overflow-y-auto space-y-2 mb-4">
          {loading ? (
            <p className="text-zinc-500 text-center py-4">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">No playlists found. Create your first one below!</p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl._id}
                onClick={() => handleAdd(pl._id)}
                disabled={addingId === pl._id}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 hover:bg-white/5 border border-white/5 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={pl.coverArtUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200'}
                    alt={pl.title}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{pl.title}</p>
                    <p className="text-[10px] text-zinc-400">{pl.tracks?.length || 0} tracks</p>
                  </div>
                </div>
                {addingId === pl._id ? (
                  <span className="text-purple-400">Adding...</span>
                ) : (
                  <Plus className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Create New Playlist option */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 font-semibold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            Create New Playlist
          </button>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="space-y-2">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New playlist name..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 btn-gradient-neon py-2 rounded-xl font-bold"
              >
                Create & Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
