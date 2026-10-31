import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Music,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserX,
  Play,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function AdminDashboardPage({ onNavigate }) {
  const { user, isAdmin } = useAuth();
  const { playTrack } = usePlayer();

  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [tracksList, setTracksList] = useState([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' | 'users' | 'reports'
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, repRes, usRes, trRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminReports(),
        api.getAdminUsers(),
        api.getAdminTracks(),
      ]);
      setOverview(ovRes.stats);
      setReports(repRes.reports || []);
      setUsersList(usRes.users || []);
      setTracksList(trRes.tracks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-zinc-400">
          This portal is restricted to authorized Fuzi Verse administrators.
        </p>
        <button onClick={() => onNavigate('home')} className="btn-gradient-neon px-6 py-2 rounded-full text-xs font-bold">
          Return Home
        </button>
      </div>
    );
  }

  // Delete Any Song as Admin
  const handleDeleteTrack = async (trackId, trackTitle) => {
    if (!window.confirm(`⚠️ ADMIN MODERATION:\nAre you sure you want to permanently delete song "${trackTitle}"?\nThis action will remove it from the entire platform.`)) {
      return;
    }
    try {
      const res = await api.adminDeleteTrack(trackId);
      setActionMsg(`✅ ${res.message || 'Track removed successfully.'}`);
      setTracksList((prev) => prev.filter((t) => t._id !== trackId));
      loadAdminData();
    } catch (err) {
      setActionMsg('Error: ' + err.message);
    }
  };

  // Block or Unblock (Suspend / Reactivate) User ID
  const handleToggleSuspend = async (userId, username, currentlySuspended) => {
    const actionWord = currentlySuspended ? 'UNBLOCK / REACTIVATE' : 'BLOCK / SUSPEND';
    if (!window.confirm(`⚠️ ADMIN MODERATION:\nAre you sure you want to ${actionWord} account @${username} (ID: ${userId})?`)) {
      return;
    }
    try {
      const res = await api.toggleSuspendUser(userId);
      setActionMsg(`✅ ${res.message}`);
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
      );
    } catch (err) {
      setActionMsg('Error: ' + err.message);
    }
  };

  const handleReportAction = async (reportId, action) => {
    setActionMsg('');
    try {
      const res = await api.handleAdminReportAction(reportId, action);
      setActionMsg(res.message);
      loadAdminData();
    } catch (err) {
      setActionMsg('Error: ' + err.message);
    }
  };

  const stats = overview || {
    totalUsers: usersList.length,
    totalTracks: tracksList.length,
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    totalPlays: 0,
  };

  // Filtered tracks
  const filteredTracks = tracksList.filter((t) => {
    if (!trackSearch.trim()) return true;
    const q = trackSearch.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.artistName?.toLowerCase().includes(q) ||
      t.artist?.username?.toLowerCase().includes(q) ||
      t.genre?.toLowerCase().includes(q)
    );
  });

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u._id?.toString().toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-24">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Admin Moderation & Safety Center
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Remove any song, block/unblock user IDs, and manage copyright reports.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-purple-500 text-xs text-zinc-300 font-semibold self-start sm:self-auto transition-all"
        >
          ↻ Refresh Data
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-zinc-400 hover:text-white text-xs ml-4">✕</button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Total Users / IDs</span>
          <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-purple-500/30 bg-purple-950/15">
          <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">Catalog Tracks</span>
          <span className="text-2xl font-black text-purple-300">{stats.totalTracks}</span>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-red-500/30 bg-red-950/15">
          <span className="text-[10px] font-bold uppercase text-red-400 block mb-1">Pending Reports</span>
          <span className="text-2xl font-black text-red-300">{stats.pendingReports}</span>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30">
          <span className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">Blocked Accounts</span>
          <span className="text-2xl font-black text-cyan-300">
            {usersList.filter((u) => u.isSuspended).length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'tracks'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4 text-purple-400" />
          <span>All Songs & Moderation ({tracksList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-red-500 text-white font-bold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-red-400" />
          <span>User IDs & Block Controls ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-amber-500 text-white font-bold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Reported Content Queue ({reports.filter((r) => r.status === 'pending').length})</span>
        </button>
      </div>

      {/* ================= TAB 1: ALL SONGS & MODERATION ================= */}
      {activeTab === 'tracks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={trackSearch}
                onChange={(e) => setTrackSearch(e.target.value)}
                placeholder="Search any song title, artist, genre..."
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <span className="text-xs text-zinc-400">
              Showing {filteredTracks.length} of {tracksList.length} tracks
            </span>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            {filteredTracks.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No songs match the search criteria.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Song</th>
                    <th className="p-3.5">Artist / Uploader</th>
                    <th className="p-3.5">Genre</th>
                    <th className="p-3.5">Metrics</th>
                    <th className="p-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTracks.map((track) => (
                    <tr key={track._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                            alt={track.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-[180px] sm:max-w-xs">{track.title}</p>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ID: {track._id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => onNavigate('profile', track.artist?._id || track.artist)}
                          className="flex items-center gap-2 text-left hover:text-purple-300 transition-colors"
                        >
                          <img
                            src={
                              track.artist?.avatar ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${track.artist?.username || 'user'}`
                            }
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-white text-xs">{track.artist?.displayName || track.artistName}</p>
                            <p className="text-[10px] text-zinc-400">@{track.artist?.username || 'artist'}</p>
                          </div>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-white/5">
                          {track.genre || 'Music'}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-400 text-[11px]">
                        <span>{track.playsCount || 0} plays</span> • <span>{track.likesCount || 0} likes</span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => playTrack(track)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Audition Song"
                          >
                            <Play className="w-3 h-3" />
                            <span className="hidden sm:inline">Play</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTrack(track._id, track.title)}
                            className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-red-500/30 transition-all"
                            title="Permanently Delete Song"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Song</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: USER IDS & BLOCK CONTROLS ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by User ID, Name, @username, or Email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <span className="text-xs text-zinc-400">
              Showing {filteredUsers.length} of {usersList.length} users
            </span>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="p-3.5">User Details</th>
                  <th className="p-3.5">User ID</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{u.displayName}</span>
                            {u.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-purple-300">
                      {u._id}
                    </td>
                    <td className="p-3.5 text-zinc-300">{u.email}</td>
                    <td className="p-3.5">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          <Lock className="w-3 h-3" /> Blocked / Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 text-green-300 border border-green-500/40">
                          <Unlock className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate('profile', u._id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                          title="View Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => handleToggleSuspend(u._id, u.username, u.isSuspended)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              u.isSuspended
                                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40'
                            }`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>{u.isSuspended ? 'Unblock ID' : 'Block ID'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic px-2">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: REPORTS & COPYRIGHT ================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl p-6 text-zinc-500 text-xs">
              No reports lodged. Platform is clean and healthy!
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep._id}
                className={`glass-panel rounded-2xl p-4 border space-y-3 ${
                  rep.status === 'pending'
                    ? 'border-red-500/30 bg-red-950/10'
                    : 'border-white/5 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300 mr-2">
                      {rep.reason}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Reported by @{rep.reporter?.username} on {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Status: <strong className="text-white">{rep.status}</strong>
                  </span>
                </div>

                {rep.track ? (
                  <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-zinc-900/80 border border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={rep.track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                        alt={rep.track.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{rep.track.title}</p>
                        <p className="text-[11px] text-purple-300">
                          by @{rep.track.artist?.username || 'Creator'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => playTrack(rep.track)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Audition Audio</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">Track has already been deleted.</p>
                )}

                {rep.details && (
                  <p className="text-xs text-zinc-300 bg-zinc-900/40 p-2.5 rounded-xl border border-white/5">
                    <strong>Complaint statement:</strong> {rep.details}
                  </p>
                )}

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleReportAction(rep._id, 'takedown')}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Take Down Track</span>
                    </button>

                    <button
                      onClick={() => handleReportAction(rep._id, 'suspend_user')}
                      className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Suspend / Block Creator</span>
                    </button>

                    <button
                      onClick={() => handleReportAction(rep._id, 'dismiss')}
                      className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-colors"
                    >
                      Dismiss Report
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
