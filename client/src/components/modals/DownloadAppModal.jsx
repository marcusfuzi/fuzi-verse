import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api.js';
import FuziLogoOfficial from '../ui/FuziLogoOfficial.jsx';

export default function DownloadAppModal({ isOpen, onClose }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getNetworkInfo()
        .then((data) => {
          setNetworkInfo(data);
          setLoading(false);
        })
        .catch((e) => {
          console.warn('Could not fetch network info:', e);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = networkInfo?.url || 'http://localhost:5174';
  const qrImage = networkInfo?.qrCode;

  const handleCopy = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-[#0e121b] rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
          <FuziLogoOfficial size="sm" variant="round" showText={false} />
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">FUZI VERSE on Phone</h2>
            <p className="text-[11px] text-zinc-400">Stream and install on your mobile device</p>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-52 h-52 bg-white rounded-2xl p-3 flex items-center justify-center shadow-xl">
            {qrImage ? (
              <img
                src={qrImage}
                alt="Scan to open FUZI VERSE on Phone"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-zinc-600 text-xs font-mono">
                {loading ? 'Generating QR Code...' : 'QR Unavailable'}
              </div>
            )}
          </div>

          {/* Copyable URL Pill */}
          <button
            onClick={handleCopy}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-mono flex items-center justify-center gap-2 transition-colors truncate"
            title="Click to copy link"
          >
            <span className="truncate max-w-[240px]">{currentUrl}</span>
            {copied ? (
              <span className="text-emerald-400 font-sans font-bold text-[11px] flex items-center gap-1 flex-shrink-0">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            )}
          </button>

          {/* Simple 2-Step Instructions */}
          <div className="w-full p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 text-left text-xs text-zinc-300 space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <span>Phone camera ya Google Lens se QR code scan karein.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <span>Link khulte hi <strong>"Install App"</strong> par tap karein taaki app aapke phone ke home screen par save ho jaye.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
