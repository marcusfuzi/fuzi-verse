import React, { useState, useEffect } from 'react';
import {
  Search,
  Flame,
  Play,
  Pause,
  ArrowRight,
  Plus,
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
  const [search, setSearch] = useState(initialSearch);
  const [genre, setGenre] = useState('All');
  const [mood, setMood] = useState('All');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const genres = ['All', 'Rock', 'Hip-Hop', 'Synthwave', 'Lo-Fi', 'EDM', 'Indie', 'Acoustic', 'Rap'];
  const moods = ['All', 'Chill', 'Energetic', 'Dark', 'Euphoric', 'Melancholy', 'Focus'];

  const fetchExploreTracks = async () => {
    setLoading(true);
    try {
      const res = await api.getTracks({
        search: search.trim() || undefined,
        genre: genre !== 'All' ? genre : undefined,
        mood: mood !== 'All' ? mood : undefined,
        limit: 30,
      });
      setTracks(res.tracks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreTracks();
  }, [genre, mood]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExploreTracks();
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header & Search */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Explore the Verse</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Uncover underground creators, new beat releases, and fresh sounds.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Track, Users, Beats, Lyrics And More..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="btn-gradient-gold px-6 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Search
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
                  ? 'bg-amber-400 text-black shadow-md'
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

      {/* Tracks Results Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Trending Tracks ({tracks.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            Loading tracks...
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-xs glass-panel rounded-2xl p-8">
            <p className="text-sm font-semibold text-white">No tracks found matching your filter</p>
            <p className="mt-1 text-zinc-500">Try adjusting your search terms or genre.</p>
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
                        src={track.coverArtUrl}
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
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artistName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">{track.playsCount} plays</span>
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
