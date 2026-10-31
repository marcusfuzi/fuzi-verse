import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  Heart,
  Users,
  Music,
  TrendingUp,
  Globe,
  Lock,
  Edit2,
  Trash2,
  Upload,
  Plus,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import EditTrackModal from '../components/modals/EditTrackModal.jsx';

export default function CreatorDashboardPage({ onNavigate }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { playTrack } = usePlayer();

  const [analytics, setAnalytics] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit track state
  const [editingTrack, setEditingTrack] = useState(null);

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [anaRes, upRes] = await Promise.all([
        api.getCreatorAnalytics(),
        api.getMyUploads(),
      ]);
      setAnalytics(anaRes);
      setUploads(upRes.tracks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleDelete = async (trackId) => {
    if (!window.confirm('Are you sure you want to delete this track permanently?')) return;
    try {
      await api.deleteTrack(trackId);
      setUploads(uploads.filter((t) => t._id !== trackId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublic = async (track) => {
    try {
      const res = await api.updateTrack(track._id, { isPublic: !track.isPublic });
      setUploads(uploads.map((t) => (t._id === track._id ? res.track : t)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartEdit = (track) => {
    setEditingTrack(track);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <BarChart3 className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Creator Studio Dashboard</h2>
        <p className="text-xs text-zinc-400">Sign in to view real performance metrics and manage your audio.</p>
        <button onClick={() => openAuthModal('login')} className="btn-gradient-neon px-8 py-2.5 rounded-full text-xs font-bold">
          Sign In
        </button>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalPlays: 0,
    totalLikes: 0,
    totalTracks: uploads.length,
    followersCount: user?.followersCount || 0,
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Creator Studio Analytics</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real performance telemetry for {user?.displayName} (@{user?.username})
          </p>
        </div>
        <button
          onClick={() => onNavigate('upload')}
          className="btn-gradient-neon px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow"
        >
          <Upload className="w-4 h-4" />
          <span>Publish New Track</span>
        </button>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400">Total Stream Plays</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white">{metrics.totalPlays.toLocaleString()}</span>
          <span className="text-[10px] text-cyan-300 block mt-1">Verified stream events</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-pink-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400">Total Track Likes</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          </div>
          <span className="text-2xl font-black text-white">{metrics.totalLikes.toLocaleString()}</span>
          <span className="text-[10px] text-pink-300 block mt-1">Audience favorites</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400">Followers</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-white">{metrics.followersCount.toLocaleString()}</span>
          <span className="text-[10px] text-purple-300 block mt-1">Direct subscriber reach</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400">Published Masters</span>
            <Music className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white">{uploads.length}</span>
          <span className="text-[10px] text-amber-300 block mt-1">Total platform audio</span>
        </div>
      </div>

      {/* Plays Growth Trend Graph */}
      {analytics?.playsHistory && (
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Stream Trajectory (Past 6 Months)
          </h3>
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {analytics.playsHistory.map((item, idx) => {
              const maxVal = Math.max(...analytics.playsHistory.map((p) => p.plays), 1);
              const heightPct = Math.max(15, Math.round((item.plays / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-zinc-400">{item.plays}</span>
                  <div className="w-full max-w-[40px] bg-zinc-800 rounded-t-lg overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 via-pink-500 to-cyan-400 rounded-t-lg transition-all duration-700"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Track Manager Table */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white">Track Manager ({uploads.length})</h3>

        {uploads.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl p-6 text-xs text-zinc-500">
            <p>No tracks uploaded yet.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Track</th>
                    <th className="p-3.5">Genre</th>
                    <th className="p-3.5">Plays</th>
                    <th className="p-3.5">Likes</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {uploads.map((track) => (
                    <tr key={track._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={track.coverArtUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">{track.title}</p>
                          <p className="text-[10px] text-zinc-400">{track.bpm || 120} BPM</p>
                        </div>
                      </td>
                      <td className="p-3.5 text-zinc-300">{track.genre}</td>
                      <td className="p-3.5 font-mono text-cyan-400 font-bold">{track.playsCount}</td>
                      <td className="p-3.5 font-mono text-pink-400 font-bold">{track.likesCount}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleTogglePublic(track)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            track.isPublic
                              ? 'bg-green-500/15 text-green-300 border border-green-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {track.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{track.isPublic ? 'Public' : 'Private'}</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => playTrack(track, uploads)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                          title="Preview Track"
                        >
                          ▶
                        </button>
                        <button
                          onClick={() => handleStartEdit(track)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-purple-300"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(track._id)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-red-400"
                          title="Delete Track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Edit Track Modal (Song Name & Photo) */}
      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          isOpen={!!editingTrack}
          onClose={() => setEditingTrack(null)}
          onUpdated={(updated) => {
            setUploads(uploads.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
            setEditingTrack(null);
          }}
        />
      )}
    </div>
  );
}
