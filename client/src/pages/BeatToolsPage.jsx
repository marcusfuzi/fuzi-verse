import React, { useState, useRef } from 'react';
import {
  Wand2,
  Mic,
  Disc,
  Upload,
  Sparkles,
  Sliders,
  Volume2,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function BeatToolsPage({ onNavigate }) {
  const [activePad, setActivePad] = useState(null);
  const [bpm, setBpm] = useState(128);
  const [isLooping, setIsLooping] = useState(false);
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Synthesize genuine drum pads using Web Audio oscillators
  const playDrumSound = (type) => {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    setActivePad(type);
    setTimeout(() => setActivePad(null), 180);

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } else if (type === 'snare') {
      // Noise + tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, t);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);

      // Noise burst
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);
    } else if (type === 'hihat') {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);
    } else if (type === 'clap') {
      for (let i = 0; i < 3; i++) {
        const bufferSize = ctx.sampleRate * 0.03;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) data[j] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, t + i * 0.015);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.015 + 0.08);
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t + i * 0.015);
      }
    } else if (type === 'sub808') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.4);
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
    } else if (type === 'rim') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(450, t);
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }
  };

  const pads = [
    { id: 'sub808', label: '808 SUB', color: 'from-purple-600 to-indigo-600' },
    { id: 'kick', label: 'PUNCH KICK', color: 'from-cyan-600 to-blue-600' },
    { id: 'snare', label: 'CRISP SNARE', color: 'from-pink-600 to-rose-600' },
    { id: 'hihat', label: 'TRAP HI-HAT', color: 'from-amber-600 to-orange-600' },
    { id: 'clap', label: 'STUDIO CLAP', color: 'from-violet-600 to-purple-600' },
    { id: 'rim', label: 'RIMSHOT', color: 'from-emerald-600 to-teal-600' },
  ];

  const tools = [
    { title: 'Audio Stretch', desc: 'Time-stretch samples without pitch drift' },
    { title: 'Stems Splitter', desc: 'Isolate vocal, drums, and melody with AI' },
    { title: 'Song Starter', desc: 'Generate chord progression ideas' },
    { title: 'Metronome & Tuner', desc: 'Lock into tempo and concert pitch' },
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Wand2 className="w-7 h-7 text-amber-400" />
          <span>Creator Beat Tools & Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Interactive Web Audio drum machine, sound starter kits, and creator tools.
        </p>
      </div>

      {/* 3 Top Action Cards matching the user's "Track Type" screen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('upload')}
          className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Import File</h4>
            <p className="text-[11px] text-zinc-400">Audio WAV, MP3 master</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('upload')}
          className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Voice / Audio</h4>
            <p className="text-[11px] text-zinc-400">Live vocal recording</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-amber-500/40 bg-amber-500/5 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Drum Machine</h4>
            <p className="text-[11px] text-amber-300">Live Web Audio pads</p>
          </div>
        </div>
      </div>

      {/* Interactive Drum Machine Studio */}
      <section className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Real-Time Synthesizer Drum Machine</span>
            </h3>
            <p className="text-xs text-zinc-400">Tap pads to synthesize real 808s and percussion</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400 font-semibold">TEMPO:</span>
            <input
              type="range"
              min="80"
              max="160"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-24 h-1 bg-zinc-700 rounded-lg accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-purple-300 font-bold w-12">{bpm} BPM</span>
          </div>
        </div>

        {/* 6 Performance Pads */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {pads.map((pad) => (
            <button
              key={pad.id}
              onClick={() => playDrumSound(pad.id)}
              className={`h-28 rounded-2xl p-4 flex flex-col justify-between items-start text-left font-bold text-white transition-all transform select-none ${
                activePad === pad.id
                  ? 'scale-95 brightness-150 shadow-2xl shadow-purple-500/50'
                  : 'hover:scale-102 hover:brightness-110 shadow-lg'
              } bg-gradient-to-tr ${pad.color}`}
            >
              <span className="text-[10px] tracking-wider uppercase opacity-80">Trigger Pad</span>
              <span className="text-base sm:text-lg tracking-wide">{pad.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Creator Tools Grid */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4">Creator Studio Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((t, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{t.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{t.desc}</p>
              </div>
              <button
                onClick={() => onNavigate('upload')}
                className="mt-4 text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>Use Tool</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
