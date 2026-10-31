import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ReportTrackModal({ track, onClose }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [reason, setReason] = useState('Copyright Infringement');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!track) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.reportTrack({
        trackId: track._id,
        reason,
        details,
      });
      setSubmitted(true);
      setTimeout(() => onClose?.(), 2200);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 shadow-2xl border border-red-500/20 text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900/60 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Report Content / DMCA Notice</h3>
            <p className="text-[11px] text-zinc-400">Protecting creator rights on Fuzi Verse</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Report Successfully Logged</h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Our safety and copyright compliance team will investigate this track and take appropriate action.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5">
              <span className="text-zinc-400 block text-[10px]">Reporting Track:</span>
              <p className="font-semibold text-white truncate">{track.title}</p>
              <p className="text-purple-300 text-[11px] truncate">by {track.artistName}</p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="font-semibold text-zinc-300 block mb-1">Violation Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="Copyright Infringement">Copyright Infringement (DMCA)</option>
                <option value="Inappropriate Content">Inappropriate / Explicit Content</option>
                <option value="Spam or Scam">Spam or Impersonation</option>
                <option value="Hate Speech">Hate Speech or Harassment</option>
                <option value="Low Quality / Noise">Low Quality / Malicious Audio</option>
                <option value="Other">Other Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-300 block mb-1">
                Details & Proof (Optional for review)
              </label>
              <textarea
                rows="3"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe your ownership or the specific violation..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Fuzi Verse takes false copyright strikes seriously. Please ensure all claims are made in good faith.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
            >
              {loading ? 'Submitting Report...' : 'Submit Report for Moderation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
