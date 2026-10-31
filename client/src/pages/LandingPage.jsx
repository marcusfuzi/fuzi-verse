import React from 'react';
import {
  Play,
  Upload,
  Compass,
  Sparkles,
  Disc,
  Radio,
  Zap,
  Users,
  ShieldCheck,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import HeroAudioVisualizer3D from '../components/3d/HeroAudioVisualizer3D.jsx';
import TiltCard from '../components/3d/TiltCard.jsx';
import FuziLogoOfficial from '../components/ui/FuziLogoOfficial.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function LandingPage({ onNavigate, featuredTracks = [] }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { playTrack } = usePlayer();

  return (
    <div className="relative min-h-screen text-white overflow-hidden pb-16">
      {/* 3D Ambient Background Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/15 to-pink-500/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-12 flex flex-col items-center text-center">
        {/* Official Brand Logo */}
        <div className="mb-6 flex justify-center hover:scale-105 transition-transform duration-300">
          <FuziLogoOfficial size="lg" variant="round" showText={true} />
        </div>

        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-lg shadow-purple-500/10 animate-pulse-glow">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>The Next-Generation Creator Music Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl">
          Every Voice Deserves a <span className="text-gradient-neon">Verse.</span>
        </h1>

        {/* Supporting Tagline */}
        <p className="mt-5 text-base sm:text-xl text-zinc-300 max-w-2xl font-normal leading-relaxed">
          Discover independent artists. Upload your sound. Find your audience.
          A community-driven platform built from the ground up for musicians, beatmakers, and listeners.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('explore')}
            className="btn-gradient-gold px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Music</span>
          </button>

          <button
            onClick={() => {
              if (isAuthenticated) onNavigate('upload');
              else openAuthModal('register');
            }}
            className="btn-gradient-neon px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Start Creating</span>
          </button>
        </div>

        {/* 3D Audio Visualizer Centerpiece */}
        <div className="mt-6 w-full max-w-2xl">
          <HeroAudioVisualizer3D className="h-80 sm:h-96 w-full" />
          <p className="text-[11px] text-zinc-500 -mt-4">
            Interactive 3D WebGL particle sphere • Drag with mouse to rotate
          </p>
        </div>
      </section>

      {/* Featured Original Tracks Preview */}
      {featuredTracks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Disc className="w-5 h-5 text-purple-400" />
                Featured Creator Verses
              </h3>
              <p className="text-xs text-zinc-400">Handcrafted original demos ready to audition</p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredTracks.slice(0, 3).map((track) => (
              <TiltCard key={track._id}>
                <div className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-purple-500/40 transition-all flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer">
                    <img
                      src={track.coverArtUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <button
                      onClick={() => playTrack(track, featuredTracks)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Play className="w-6 h-6 fill-white text-white" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate">{track.title}</h4>
                    <p className="text-xs text-zinc-400 truncate">{track.artistName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                        {track.genre}
                      </span>
                      <span className="text-[10px] text-zinc-500">{track.playsCount} plays</span>
                    </div>
                  </div>
                  <button
                    onClick={() => playTrack(track, featuredTracks)}
                    className="p-2.5 rounded-full btn-gradient-neon text-white shadow-md hover:scale-110 transition-transform flex-shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      )}

      {/* Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Built for the <span className="text-gradient-neon">New Sound Generation</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mt-2">
            No corporate playlists. No gatekeepers. Just direct artist-to-fan connection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">100% Rights Retained</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You own your masters. Upload with full confidence using our automated license declaration and transparent copyright safeguards.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3D Spatial & Visual Experience</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Experience music with interactive 3D vinyl turntables, real-time WebGL audio reactive spheres, and time-synced creator lyrics.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-pink-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Real Fan Engagement</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Time-stamped audio comments, creator follower feeds, customized mood playlists, and genuine play analytics with zero fake stats.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 my-10">
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 text-center border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Ready to Share Your Verse with the World?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto mt-3">
              Join thousands of independent producers, singers, and beatmakers on FUZI VERSE today.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => {
                  if (isAuthenticated) onNavigate('upload');
                  else openAuthModal('register');
                }}
                className="btn-gradient-neon px-8 py-3 rounded-full text-xs font-bold shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
              >
                Create Account & Upload
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
