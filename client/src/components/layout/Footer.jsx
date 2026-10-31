import React from 'react';
import { Heart, Shield, Music, Sparkles, Smartphone, Download } from 'lucide-react';
import FuziLogoOfficial from '../ui/FuziLogoOfficial.jsx';

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full glass-panel border-t border-white/5 py-10 px-6 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info with Official Logo */}
        <div className="md:col-span-1 space-y-3">
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer"
          >
            <FuziLogoOfficial size="md" variant="round" showText={true} />
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mt-2">
            “Your Music. Your Verse. Your World.” Built for independent creators, singers, producers, and music lovers worldwide.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
            <span>Powered by Web Audio & 3D Spatial Audio</span>
          </div>
        </div>

        {/* Discover */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Discover</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li>
              <button onClick={() => onNavigate('landing')} className="hover:text-cyan-400 transition-colors">
                Landing & Vision
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                Home Feed
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('explore')} className="hover:text-cyan-400 transition-colors">
                Explore Genres & Moods
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('create')} className="hover:text-cyan-400 transition-colors">
                Beatmaker Tools
              </button>
            </li>
          </ul>
        </div>

        {/* Creator Hub */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Creator Hub</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li>
              <button onClick={() => onNavigate('upload')} className="hover:text-purple-400 transition-colors">
                Upload Your Sound
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('creator-dashboard')} className="hover:text-purple-400 transition-colors">
                Creator Analytics
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('library')} className="hover:text-purple-400 transition-colors">
                Personal Library
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('copyright')} className="hover:text-purple-400 transition-colors">
                Rights & Licensing Guide
              </button>
            </li>
          </ul>
        </div>

        {/* Safety & Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Integrity & Safety</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li>
              <button onClick={() => onNavigate('copyright')} className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-pink-500" />
                DMCA Copyright Report
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy')} className="hover:text-zinc-200 transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('terms')} className="hover:text-zinc-200 transition-colors">
                Terms and Conditions
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin')} className="hover:text-zinc-200 transition-colors">
                Platform Moderation
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-3">
        <p>© 2026 FUZI VERSE. “Every Voice Deserves a Verse.” All rights reserved.</p>
        <div className="flex items-center gap-1 text-zinc-400">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
          <span>for independent artists</span>
        </div>
      </div>
    </footer>
  );
}
