import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Disc,
  Play,
  Pause,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  Edit2,
  Edit3,
  ExternalLink,
  Plus,
  ShieldCheck,
  Camera,
  Trash2,
  UserX,
  Upload,
  Check,
  AlertCircle,
  Music,
  ListMusic,
  Info,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import EditTrackModal from '../components/modals/EditTrackModal.jsx';

export default function ArtistProfilePage({
  artistId,
  onNavigate,
  onOpenShare,
  onOpenAddToPlaylist,
}) {
  const { user: currentUser, isAuthenticated, openAuthModal, refreshUser } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' | 'playlists' | 'liked' | 'about'
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit Profile & Photo Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const fileInputRef = useRef(null);

  const targetId = artistId || currentUser?._id;
  const isOwnProfile = currentUser && targetId && (
    targetId.toString() === currentUser._id?.toString() ||
    targetId.toString().toLowerCase() === currentUser.username?.toLowerCase()
  );

  const PRESET_AVATARS = [
    { label: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { label: 'Producer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { label: 'Synth Artist', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
    { label: 'Lo-Fi Chill', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
    { label: 'Vinyl DJ', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80' },
    { label: 'Acoustic Soul', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  ];

  const loadProfileData = () => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getUserProfile(targetId)
      .then((res) => {
        setProfile(res.user);
        setTracks(res.tracks || []);
        setPlaylists(res.playlists || []);
        setIsFollowing(res.user.isFollowing || false);
        setFollowersCount(res.user.followersCount || 0);

        setEditName(res.user.displayName || '');
        setEditBio(res.user.bio || '');
        setEditWebsite(res.user.website || '');
        setAvatarPreview(res.user.avatar || '');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // If viewing own profile, also load liked tracks
    if (isOwnProfile && isAuthenticated) {
      api.getLikedTracks()
        .then((res) => setLikedTracks(res.tracks || []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [targetId, currentUser?._id]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleFollow(profile._id);
      setIsFollowing(res.following);
      setFollowersCount((prev) => (res.following ? prev + 1 : Math.max(0, prev - 1)));
    } catch (e) {
      console.error(e);
    }
  };

  // Avatar file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (JPG, PNG, WEBP, GIF).');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarUrlInput('');
    }
  };

  const handleSelectPreset = (url) => {
    setAvatarFile(null);
    setAvatarPreview(url);
    setAvatarUrlInput(url);
  };

  const openEditModal = () => {
    setEditName(profile?.displayName || '');
    setEditBio(profile?.bio || '');
    setEditWebsite(profile?.website || '');
    setAvatarPreview(profile?.avatar || '');
    setAvatarFile(null);
    setAvatarUrlInput('');
    setSaveSuccess('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess('');
    try {
      const formData = new FormData();
      formData.append('displayName', editName.trim());
      formData.append('bio', editBio.trim());
      formData.append('website', editWebsite.trim());

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (avatarUrlInput.trim()) {
        formData.append('avatar', avatarUrlInput.trim());
      }

      const res = await api.updateProfile(formData);
      setProfile(res.user);
      setSaveSuccess('Profile and photo updated successfully!');
      refreshUser();
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess('');
      }, 900);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSaveLoading(false);
    }
  };

  // Admin Actions
  const handleAdminDeleteTrack = async (trackId, trackTitle) => {
    if (!window.confirm(`⚠️ ADMIN MODERATION:\nPermanently delete "${trackTitle}" from Fuzi Verse?`)) {
      return;
    }
    try {
      await api.adminDeleteTrack(trackId);
      setTracks((prev) => prev.filter((t) => t._id !== trackId));
      alert(`Song "${trackTitle}" removed.`);
    } catch (err) {
      alert('Error removing track: ' + err.message);
    }
  };

  const handleAdminToggleSuspend = async () => {
    if (!profile) return;
    const action = profile.isSuspended ? 'reactivate / unblock' : 'BLOCK / SUSPEND';
    if (!window.confirm(`⚠️ ADMIN MODERATION:\nAre you sure you want to ${action} user ID: ${profile._id} (@${profile.username})?`)) {
      return;
    }
    try {
      const res = await api.toggleSuspendUser(profile._id);
      setProfile(res.user);
      alert(res.message);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-zinc-500 text-xs">Loading profile...</div>;
  }

  if (!targetId && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <User className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Profile</h2>
        <p className="text-xs text-zinc-400">
          Sign in or create a free account to customize your profile, change photo, and share your verses.
        </p>
        <button onClick={() => openAuthModal('login')} className="btn-gradient-neon px-6 py-2.5 rounded-full text-xs font-bold">
          Sign In
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-zinc-400 text-xs">
        <p className="text-sm font-bold text-white">User not found</p>
        <button onClick={() => onNavigate('home')} className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Account Suspended Alert (Visible to Admin or Owner) */}
      {profile.isSuspended && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>
              <strong>Account Suspended:</strong> This user ID ({profile._id}) has been blocked by platform administration.
            </span>
          </div>
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleAdminToggleSuspend}
              className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs"
            >
              Unblock Account
            </button>
          )}
        </div>
      )}

      {/* Profile Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-cyan-900/50 relative">
          <div className="absolute inset-0 bg-radial from-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Container with Hover Edit for Owner */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-[#08090d] shadow-2xl bg-zinc-900 group">
              <img
                src={
                  profile.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`
                }
                alt={profile.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username || 'artist'}`;
                }}
              />

              {/* Owner Click-to-Change-Photo Overlay */}
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={openEditModal}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  title="Click to Change Photo"
                >
                  <Camera className="w-6 h-6 text-purple-300" />
                  <span className="text-[10px] font-bold mt-1">Change Photo</span>
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{profile.displayName}</h1>
                {profile.isVerified && (
                  <span className="p-1 rounded-full bg-purple-500 text-white text-[10px] font-bold" title="Verified Creator">
                    ✓
                  </span>
                )}
                {profile.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300 font-medium">@{profile.username}</p>
              <p className="text-xs text-zinc-400 mt-1.5 max-w-md line-clamp-2">
                {profile.bio || 'Music enthusiast and creator on Fuzi Verse.'}
              </p>
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end">
            {isOwnProfile ? (
              <>
                <button
                  onClick={openEditModal}
                  className="px-4 py-2 rounded-full glass-input text-xs font-semibold flex items-center gap-2 hover:border-purple-400 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Change Photo & Details</span>
                </button>
                <button
                  onClick={() => onNavigate('upload')}
                  className="px-4 py-2 rounded-full btn-gradient-neon text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Song</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    isFollowing
                      ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
                      : 'btn-gradient-gold shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                {/* Admin Moderator Suspend Button */}
                {currentUser?.role === 'admin' && profile.role !== 'admin' && (
                  <button
                    onClick={handleAdminToggleSuspend}
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      profile.isSuspended
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>{profile.isSuspended ? 'Unblock ID' : 'Block ID'}</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => onOpenShare?.(profile)}
              className="p-2 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-4 border-t border-white/10 bg-zinc-900/40 text-center py-3 text-xs">
          <div>
            <span className="font-bold text-white text-sm sm:text-base block">
              {followersCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400">Followers</span>
          </div>
          <div>
            <span className="font-bold text-white text-sm sm:text-base block">
              {(profile.followingCount || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400">Following</span>
          </div>
          <div>
            <span className="font-bold text-white text-sm sm:text-base block">
              {tracks.length}
            </span>
            <span className="text-[10px] text-zinc-400">Tracks</span>
          </div>
          <div>
            <span className="font-bold text-white text-sm sm:text-base block">
              {(profile.totalPlays || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400">Streams</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'tracks'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Original Songs ({tracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'playlists'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>Playlists ({playlists.length})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('liked')}
            className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'liked'
                ? 'border-purple-500 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-pink-400" />
            <span>My Liked Songs ({likedTracks.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'about'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* ================= TAB 1: TRACKS ================= */}
      {activeTab === 'tracks' && (
        <div className="space-y-3">
          {tracks.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-white/5 space-y-4">
              <Disc className="w-12 h-12 text-zinc-600 mx-auto animate-spin-slow" />
              <div>
                <p className="text-sm font-bold text-white">
                  {isOwnProfile ? "You haven't uploaded any tracks yet" : 'No public songs uploaded yet'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  {isOwnProfile
                    ? 'Upload your original audio masters to retain 100% rights, reach listeners, and start building your audience.'
                    : 'When this member publishes music, it will appear right here.'}
                </p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => onNavigate('upload')}
                  className="btn-gradient-neon px-6 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Your First Track</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, idx) => {
                const isThisPlaying = currentTrack?._id === track._id && isPlaying;
                return (
                  <div
                    key={track._id}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl glass-panel transition-all group ${
                      currentTrack?._id === track._id
                        ? 'border-purple-500/50 bg-purple-900/15'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <span className="text-xs text-zinc-500 w-4 font-mono hidden sm:inline">
                        {idx + 1}
                      </span>

                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 group/cover">
                        <img
                          src={track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => playTrack(track)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity"
                        >
                          {isThisPlaying ? (
                            <Pause className="w-5 h-5 text-purple-400 fill-purple-400" />
                          ) : (
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">{track.title}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                            {track.genre || 'Music'}
                          </span>
                          <span>•</span>
                          <span>{track.playsCount || 0} plays</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                        {Math.floor(track.duration / 60)}:
                        {String(Math.floor(track.duration % 60)).padStart(2, '0')}
                      </span>

                      {/* Owner / Admin Edit Track (Name & Photo) */}
                      {(isOwnProfile || currentUser?.role === 'admin' || currentUser?._id === (track.artist?._id || track.artist)) && (
                        <button
                          onClick={() => setEditingTrack(track)}
                          className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-400 text-amber-300 hover:text-black transition-colors"
                          title="Edit Song Name & Photo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Admin Delete Track */}
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleAdminDeleteTrack(track._id, track.title)}
                          className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
                          title="Admin: Delete Song"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onOpenAddToPlaylist?.(track)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenShare?.(track)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Share Song"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PLAYLISTS ================= */}
      {activeTab === 'playlists' && (
        <div>
          {playlists.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No playlists created yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl._id}
                  onClick={() => onNavigate('playlist', pl._id)}
                  className="glass-panel p-3.5 rounded-2xl border border-white/5 hover:border-purple-500/40 cursor-pointer transition-all group"
                >
                  <img
                    src={pl.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}
                    alt={pl.title}
                    className="w-full aspect-square rounded-xl object-cover mb-2.5"
                  />
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {pl.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {pl.tracks?.length || 0} tracks
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: LIKED SONGS (OWN PROFILE) ================= */}
      {isOwnProfile && activeTab === 'liked' && (
        <div className="space-y-2">
          {likedTracks.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              You haven't liked any songs yet. Tap the heart icon on any song!
            </div>
          ) : (
            likedTracks.map((track) => (
              <div
                key={track._id}
                onClick={() => playTrack(track)}
                className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-white/5 hover:border-purple-500/30 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{track.title}</p>
                    <p className="text-[10px] text-zinc-400">{track.artistName}</p>
                  </div>
                </div>
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= TAB 4: ABOUT ================= */}
      {activeTab === 'about' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">About @{profile.username}</h3>
          <p className="text-zinc-300 leading-relaxed">
            {profile.bio || 'This member has not written a custom bio yet.'}
          </p>

          <div className="pt-4 border-t border-white/5 flex items-center gap-6 text-zinc-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span>User ID:</span>
              <span className="text-purple-300">{profile._id}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT PROFILE & PHOTO MODAL ================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
          <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 shadow-2xl border border-white/10 text-xs my-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <span>Customize Profile & Photo</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Image Section */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                <label className="font-bold text-zinc-200 block text-xs">Profile Picture (Avatar)</label>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-lg flex-shrink-0 bg-black">
                    <img
                      src={avatarPreview || profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username || 'artist'}`;
                      }}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl btn-gradient-neon font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo from Device</span>
                    </button>
                    {avatarFile && (
                      <p className="text-[11px] text-green-400 truncate">
                        Selected: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-500">
                      Supports JPG, PNG, WEBP up to 8MB.
                    </p>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Or Pick a Style Preset:
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url)}
                        className={`p-1 rounded-xl border transition-all ${
                          avatarPreview === preset.url
                            ? 'border-purple-400 bg-purple-500/20 scale-105'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Image URL */}
                <div className="pt-1">
                  <label className="text-[10px] text-zinc-400 block mb-1">Or paste Image URL:</label>
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => {
                      setAvatarUrlInput(e.target.value);
                      if (e.target.value) {
                        setAvatarPreview(e.target.value);
                        setAvatarFile(null);
                      }
                    }}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Bio / About You</label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a verse about yourself, your musical taste, or inspirations..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              {/* Website / Links */}
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Website or Social Link</label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 btn-gradient-neon py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-purple-500/20"
                >
                  {saveLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Track Modal (Song Name & Photo) */}
      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          isOpen={!!editingTrack}
          onClose={() => setEditingTrack(null)}
          onUpdated={(updated) => {
            setTracks(tracks.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
          }}
        />
      )}
    </div>
  );
}
