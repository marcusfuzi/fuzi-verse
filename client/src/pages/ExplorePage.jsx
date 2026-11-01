import React, { useState, useEffect } from 'react';
import {
  Search,
  Flame,
  Play,
  Pause,
  ArrowRight,
  Plus,
  X,
  Sparkles,
  User,
  Music2,
} from 'lucide-react';
import TiltCard from '../components/3d/TiltCard.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { api } from '../services/api.js';

export default function ExplorePage({
  initialSearch = '',
  onNavigate,
  onOpenShare,
  onOpenAddToPlaylist,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay, openNowPlaying } = usePlayer();
  const [search, setSearch] = useState(initialSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || '');
  const [genre, setGenre] = useState('All');
  const [mood, setMood] = useState('All');
  const [tracks, setTracks] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const genres = ['All', 'Rock', 'Hip-Hop', 'Synthwave', 'Lo-Fi', 'EDM', 'Indie', 'Acoustic', 'Rap'];
  const moods = ['All', 'Chill', 'Energetic', 'Dark', 'Euphoric', 'Melancholy', 'Focus'];

  // Sync when initialSearch prop changes from Navbar or external link
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
      setDebouncedSearch(initialSearch);
    }
  }, [initialSearch]);

  // Debounce search input by 300ms for live, instant search while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch tracks and creators in parallel
  const fetchExploreResults = async () => {
    setLoading(true);
    try {
      const query = debouncedSearch.trim();

      const [tracksRes, creatorsRes] = await Promise.all([
        api.getTracks({
          search: query || undefined,
          genre: genre !== 'All' ? genre : undefined,
          mood: mood !== 'All' ? mood : undefined,
          limit: 40,
        }),
        api.getFeaturedCreators({
          search: query || undefined,
          limit: 12,
        }),
      ]);

      setTracks(tracksRes.tracks || []);
      setCreators(creatorsRes.creators || []);
    } catch (err) {
      console.error('Error fetching explore tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreResults();
  }, [debouncedSearch, genre, mood]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(search);
    fetchExploreResults();
  };

  const handleClearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  return (
    <div className="space-y-8 pb-28 select-none">
      {/* Header & Search */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Explore the Verse</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Search songs, discover creators, underground beat releases, and fresh sounds.
          </p>
        </div>

        {/* Real-time Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search song title, artist name, beats, or lyrics..."
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-2xl glass-input text-xs sm:text-sm text-white placeholder-zinc-500 focus:ring-1 focus:ring-amber-400"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-3 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn-gradient-gold px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                genre === g
                  ? 'bg-amber-400 text-black shadow-md font-bold'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-zinc-400 font-semibold mr-1">Mood:</span>
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
              mood === m
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Matching Artists / Creators Section */}
      {creators.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Artists & Creators ({creators.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {creators.map((c) => (
              <div
                key={c._id}
                onClick={() => onNavigate('artist', c._id)}
                className="glass-panel p-3.5 rounded-2xl border border-white/5 hover:border-amber-400/40 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center text-center group active:scale-95 shadow-lg"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-amber-500 to-purple-600 mb-2 shadow-lg group-hover:scale-105 transition-transform">
                  <img
                    src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={c.displayName}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${c.username || 'artist'}`;
                    }}
                  />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full group-hover:text-amber-400 transition-colors">
                  {c.displayName}
                </h4>
                <p className="text-[10px] text-zinc-400 truncate max-w-full">
                  @{c.username}
                </p>
                <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Artist
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tracks Results Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            {debouncedSearch.trim() ? `Songs (${tracks.length})` : `Trending Tracks (${tracks.length})`}
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            Searching tracks and artists...
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-xs glass-panel rounded-2xl p-8">
            <p className="text-sm font-semibold text-white">No tracks found matching "{debouncedSearch || genre}"</p>
            <p className="mt-1 text-zinc-500">Try searching a different song title or artist name.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => {
              const isThisPlaying = isPlaying && currentTrack?._id === track._id;
              return (
                <TiltCard key={track._id}>
                  <div
                    className={`glass-panel rounded-2xl p-3 border transition-all flex items-center gap-3.5 group cursor-pointer ${
                      isThisPlaying
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      onClick={() => playTrack(track, tracks)}
                      className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                      onClick={() => {
                        playTrack(track, tracks);
                        openNowPlaying('lyrics');
                      }}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                          {track.title}
                        </h4>
                        {isThisPlaying && (
                          <div className="flex items-end gap-0.5 h-3 flex-shrink-0" title="Now Playing">
                            <span className="w-0.5 h-full bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                            <span className="w-0.5 h-2/3 bg-purple-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s', animationDelay: '0.15s' }} />
                            <span className="w-0.5 h-5/6 bg-pink-400 rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.3s' }} />
                          </div>
                        )}
                      </div>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('artist', track.artist?._id || track.artist);
                        }}
                        className="text-[11px] text-zinc-400 truncate mt-0.5 hover:text-amber-300 transition-colors cursor-pointer"
                        title={`View ${track.artistName}'s profile`}
                      >
                        {track.artistName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">{track.playsCount || 0} plays</span>
                        <span className="text-[10px] text-purple-400">• {track.genre}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddToPlaylist?.(track);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
