import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, Globe } from 'lucide-react';

export default function ShareModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!item) return null;

  const shareUrl = `${window.location.origin}/#track/${item._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform) => {
    const text = encodeURIComponent(`Listen to "${item.title}" by ${item.artistName} on FUZI VERSE! 🎧 #FuziVerse`);
    const url = encodeURIComponent(shareUrl);

    let target = '';
    if (platform === 'twitter') target = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    if (platform === 'whatsapp') target = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    if (platform === 'telegram') target = `https://t.me/share/url?url=${url}&text=${text}`;

    if (target) window.open(target, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm glass-panel-glow rounded-3xl p-6 shadow-2xl border border-white/10 text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900/60 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <Share2 className="w-4 h-4 text-cyan-400" />
          Share Track
        </h3>
        <p className="text-zinc-400 truncate mb-4">Share with friends and creators</p>

        {/* Track Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-white/5 mb-4">
          <img
            src={item.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
            alt={item.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-white truncate">{item.title}</h4>
            <p className="text-zinc-400 truncate text-[11px]">{item.artistName}</p>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono text-zinc-400 truncate"
          />
          <button
            onClick={handleCopy}
            className="btn-gradient-neon px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => shareToSocial('twitter')}
            className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-center"
          >
            Twitter / X
          </button>
          <button
            onClick={() => shareToSocial('whatsapp')}
            className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-center"
          >
            WhatsApp
          </button>
          <button
            onClick={() => shareToSocial('telegram')}
            className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-center"
          >
            Telegram
          </button>
        </div>
      </div>
    </div>
  );
}
