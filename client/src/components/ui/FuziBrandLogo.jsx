import React from 'react';

export default function FuziBrandLogo({ size = 'md', showSubtitle = true, onClick }) {
  // Sizes: 'sm', 'md', 'lg'
  const sizeMap = {
    sm: { img: 'w-8 h-8', title: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-10 h-10', title: 'text-xl', sub: 'text-[10px]' },
    lg: { img: 'w-16 h-16', title: 'text-3xl', sub: 'text-xs' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer group select-none transition-transform duration-200"
    >
      {/* Logo Emblem Container */}
      <div
        className={`relative ${current.img} rounded-2xl p-0.5 shadow-lg shadow-purple-500/25 group-hover:scale-105 group-hover:shadow-purple-500/40 transition-all duration-300 overflow-hidden bg-gradient-to-tr from-cyan-500 via-purple-600 to-amber-400`}
      >
        <div className="w-full h-full bg-[#0a0c14] rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
          <img
            src="/fuzi-logo-light.png"
            alt="FUZI VERSE Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.7)] group-hover:rotate-6 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-serif font-black tracking-wider text-white">FUZI</span>
          <span className="font-serif font-light tracking-widest text-gradient-neon">VERSE</span>
        </div>
        {showSubtitle && (
          <span className={`font-medium tracking-widest text-zinc-400 uppercase block mt-1 ${current.sub}`}>
            Since 2026 • Your Sound
          </span>
        )}
      </div>
    </div>
  );
}
