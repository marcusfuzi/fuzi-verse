import React from 'react';

export default function VinylRecord3D({
  coverArtUrl,
  isPlaying,
  size = 'w-72 h-72 md:w-80 md:h-80',
}) {
  return (
    <div className={`relative flex items-center justify-center ${size} select-none perspective-1000 group`}>
      {/* 3D Vinyl Outer Disc */}
      <div
        className={`relative w-full h-full rounded-full p-2.5 transition-transform duration-700 preserve-3d shadow-2xl ${
          isPlaying ? 'animate-spin-slow' : ''
        }`}
        style={{
          background: 'radial-gradient(circle, #242426 0%, #111215 35%, #08090b 65%, #181920 85%, #050507 100%)',
          boxShadow: isPlaying
            ? '0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(168, 85, 247, 0.35), inset 0 0 8px rgba(255,255,255,0.15)'
            : '0 15px 40px rgba(0,0,0,0.8), inset 0 0 5px rgba(255,255,255,0.08)',
        }}
      >
        {/* Micro-Grooves Reflection Rings */}
        <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none" />

        {/* Specular Sheen (Vinyl Light Reflection Cones) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.18) 40deg, transparent 80deg, transparent 180deg, rgba(255,255,255,0.18) 220deg, transparent 260deg)',
          }}
        />

        {/* Center Artwork Label */}
        <div className="absolute inset-0 m-auto w-1/2 h-1/2 rounded-full overflow-hidden border-2 border-zinc-900 shadow-inner">
          <img
            src={coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
            alt="Track Artwork"
            className="w-full h-full object-cover rounded-full"
          />
          {/* Spindle hole */}
          <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-[#08090d] border border-white/30 shadow-inner" />
        </div>
      </div>

      {/* Tonearm graphic overlay */}
      <div
        className={`absolute -top-4 -right-4 w-28 h-36 pointer-events-none transition-transform duration-700 origin-top-right ${
          isPlaying ? 'rotate-12 translate-x-1' : '-rotate-12 opacity-70'
        }`}
      >
        {/* Arm Base Pivot */}
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-500 shadow-lg" />
        {/* Arm Rod */}
        <div
          className="absolute top-5 right-7 w-2 h-28 bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-400 rounded-sm origin-top"
          style={{ transform: 'rotate(-25deg)' }}
        >
          {/* Cartridge head */}
          <div className="absolute -bottom-2 -left-2 w-5 h-3 bg-amber-500 rounded-xs border border-zinc-900 shadow" />
        </div>
      </div>
    </div>
  );
}
