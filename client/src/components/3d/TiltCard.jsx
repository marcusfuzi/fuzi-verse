import React, { useRef, useState } from 'react';

export default function TiltCard({ children, className = '', maxTilt = 8, onClick }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({ transform: '', glare: { opacity: 0, x: 0, y: 0 } });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`,
      glare: {
        opacity: 0.15,
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      },
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      glare: { opacity: 0, x: 50, y: 50 },
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative preserve-3d transition-transform duration-200 ease-out ${className}`}
      style={{ transform: style.transform }}
    >
      {children}
      {/* Dynamic specular glare */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: style.glare.opacity,
          background: `radial-gradient(circle at ${style.glare.x}% ${style.glare.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
