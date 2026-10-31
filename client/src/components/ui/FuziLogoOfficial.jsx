import React from 'react';

export default function FuziLogoOfficial({ size = 'md', className = '', showText = true, variant = 'round' }) {
  // Variants: 'round' (circular badge with gold border), 'transparent' (clean cutout), 'full' (original square badge)
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const imgClass = sizeClasses[size] || sizeClasses.md;

  let logoSrc = '/fuzi-logo-round.png';
  if (variant === 'transparent') logoSrc = '/fuzi-logo-transparent.png';
  if (variant === 'full') logoSrc = '/fuzi-logo.jpg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative ${imgClass} rounded-2xl overflow-hidden shadow-lg shadow-amber-500/10 flex-shrink-0 group hover:scale-105 transition-transform duration-300`}>
        <img
          src={logoSrc}
          alt="FUZI VERSE Official Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to original image if transparent variant missing
            e.target.src = '/fuzi-logo.jpg';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-serif font-black tracking-wider text-white text-base sm:text-lg leading-tight">
            <span>FUZI</span>
            <span className="text-amber-400 font-light tracking-widest">VERSE</span>
          </div>
          <span className="text-[9px] font-sans tracking-widest text-zinc-400 uppercase font-semibold">
            Since 2026
          </span>
        </div>
      )}
    </div>
  );
}
