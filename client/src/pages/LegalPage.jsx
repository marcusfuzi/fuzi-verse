import React, { useState } from 'react';
import { Shield, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LegalPage({ initialTab = 'terms' }) {
  const [tab, setTab] = useState(initialTab);
  const { isAuthenticated, openAuthModal } = useAuth();

  // DMCA form state
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [infringingUrl, setInfringingUrl] = useState('');
  const [statement, setStatement] = useState('');
  const [dmcaSubmitted, setDmcaSubmitted] = useState(false);

  const handleDmcaSubmit = (e) => {
    e.preventDefault();
    setDmcaSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-xs leading-relaxed text-zinc-300">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setTab('terms')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            tab === 'terms' ? 'bg-purple-600 text-white' : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          Terms and Conditions
        </button>
        <button
          onClick={() => setTab('privacy')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            tab === 'privacy' ? 'bg-purple-600 text-white' : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setTab('copyright')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            tab === 'copyright' ? 'bg-purple-600 text-white' : 'glass-panel text-zinc-400 hover:text-white'
          }`}
        >
          Copyright & DMCA Notice
        </button>
      </div>

      {tab === 'terms' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 space-y-4">
          <h1 className="text-2xl font-black text-white">Fuzi Verse Terms of Service</h1>
          <p className="text-zinc-400">Effective Date: October 2026</p>

          <h3 className="text-sm font-bold text-white pt-2">1. Creator Ownership & Rights</h3>
          <p>
            On Fuzi Verse, creators retain 100% ownership of their musical masters, compositions, lyrics, and brand identity. By uploading content to Fuzi Verse, you grant Fuzi Verse a non-exclusive license to host, stream, and distribute your audio exclusively to registered and guest listeners of our platform.
          </p>

          <h3 className="text-sm font-bold text-white pt-2">2. Prohibited Content</h3>
          <p>
            Users are strictly forbidden from uploading unauthorized commercial recordings, bootleg audio without clearance, speech infringing upon human rights, malicious sound frequencies, or spam.
          </p>

          <h3 className="text-sm font-bold text-white pt-2">3. Account Moderation & Safety</h3>
          <p>
            Fuzi Verse reserves the right to suspend or terminate accounts that repeatedly receive verified DMCA copyright complaints or violate community standards.
          </p>
        </div>
      )}

      {tab === 'privacy' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 space-y-4">
          <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
          <p className="text-zinc-400">Effective Date: October 2026</p>

          <h3 className="text-sm font-bold text-white pt-2">1. Information We Collect</h3>
          <p>
            We collect account registration credentials (username, email address, password hash), creator profile data (display name, bio, social links), audio tracks and cover artwork you upload, and playback analytics (stream counts, track likes).
          </p>

          <h3 className="text-sm font-bold text-white pt-2">2. How Data Is Used</h3>
          <p>
            Telemetry is strictly utilized to provide audio streaming, calculate verified creator play metrics, power recommendation feeds, and enforce copyright protections. We never sell your personal data to third-party ad networks.
          </p>
        </div>
      )}

      {tab === 'copyright' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-pink-500" />
              <span>DMCA Copyright Infringement Notice Form</span>
            </h1>
            <p className="text-zinc-400 mt-1">
              Fuzi Verse respects intellectual property rights. If you believe your copyrighted audio has been used without authorization, submit this official notice for prompt investigation.
            </p>
          </div>

          {dmcaSubmitted ? (
            <div className="p-8 text-center space-y-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Notice Dispatched to Moderation Queue</h3>
              <p className="text-zinc-300 max-w-md mx-auto">
                Your report has been assigned reference ticket #FV-DMCA-{Math.floor(1000 + Math.random() * 9000)}. Our compliance officers will audit the track within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleDmcaSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Copyright Owner / Agent Name</label>
                  <input
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="e.g. John Doe / Label Records"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={claimantEmail}
                    onChange={(e) => setClaimantEmail(e.target.value)}
                    placeholder="legal@rightsowner.com"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Name of Copyrighted Work</label>
                <input
                  type="text"
                  required
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  placeholder="Title of original composition / master recording"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  URL or Track Title on Fuzi Verse
                </label>
                <input
                  type="text"
                  required
                  value={infringingUrl}
                  onChange={(e) => setInfringingUrl(e.target.value)}
                  placeholder="Track link or title on Fuzi Verse"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Statement of Good Faith</label>
                <textarea
                  rows="3"
                  required
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="I declare under penalty of perjury that I am the copyright owner or authorized to act on behalf of the owner..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-gradient-neon px-8 py-3 rounded-xl font-bold text-white shadow-lg"
              >
                Submit Formal DMCA Notice
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
