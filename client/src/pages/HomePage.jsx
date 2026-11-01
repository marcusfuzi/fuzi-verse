import React, { useState } from 'react';
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

      {/* Featured Track Hero Banner */}
      {featuredTrack && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-[#13151f] to-[#1a1528] border border-white/[0.08] p-6 sm:p-8 shadow-xl">
          {/* Subtle album art reflection background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl pointer-events-none"
            style={{ backgroundImage: `url(${featuredTrack.coverArtUrl})` }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left Content */}
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-zinc-300 text-[11px] font-semibold tracking-wide mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                Featured Release
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {featuredTrack.title}
              </h2>

              <p
                onClick={() => onNavigate('profile', featuredTrack.artist?._id || featuredTrack.artist)}
                className="text-sm font-medium text-zinc-300 mt-2 cursor-pointer hover:text-white transition-colors"
              >
                by <strong className="text-purple-300 hover:underline">{featuredTrack.artistName}</strong>
              </p>

              <p className="text-xs text-zinc-400 mt-3 leading-relaxed line-clamp-2">
                {featuredTrack.description || 'Listen to this track now on Fuzi Verse.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => {
                    if (isFeaturedPlaying) togglePlay();
                    else playTrack(featuredTrack, tracks);
                  }}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                >
                  {isFeaturedPlaying ? (
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
                  onClick={() => onOpenAddToPlaylist?.(featuredTrack)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 hover:border-white/30 text-zinc-200 transition-colors"
                >
                  Save to Playlist
                </button>

                <button
                  onClick={() => onOpenShare?.(featuredTrack)}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Album Artwork */}
            <div className="relative flex-shrink-0 group">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
                <img
                  src={featuredTrack.coverArtUrl}
                  alt={featuredTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md">
                <span>{featuredTrack.genre || 'Music'}</span>
                <span>{formatTime(featuredTrack.duration)}</span>
              </div>
            </div>
          </div>
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
