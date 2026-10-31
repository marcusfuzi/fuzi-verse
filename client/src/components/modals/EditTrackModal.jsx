import React, { useState, useRef } from 'react';
import { X, Upload, Image, Check, Sparkles, Loader2, Music2 } from 'lucide-react';
import { api } from '../../services/api.js';

const COVER_PRESETS = [
  {
    name: 'Neon Horizon',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Retro Vinyl',
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dark Studio',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lo-Fi Chill',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
];

const GENRES = ['Hip-Hop', 'Pop', 'Electronic', 'Rock', 'R&B', 'Lo-Fi', 'Ambient', 'Classical', 'Other'];
const MOODS = ['Vibe', 'Chill', 'Energetic', 'Melodic', 'Dark', 'Romantic', 'Inspiring'];

export default function EditTrackModal({ track, isOpen, onClose, onUpdated }) {
  if (!isOpen || !track) return null;

  const [title, setTitle] = useState(track.title || '');
  const [genre, setGenre] = useState(track.genre || 'Hip-Hop');
  const [mood, setMood] = useState(track.mood || 'Vibe');
  const [description, setDescription] = useState(track.description || '');
  const [previewCover, setPreviewCover] = useState(track.coverArtUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }
      setSelectedFile(file);
      setCustomUrl('');
      const reader = new FileReader();
      reader.onload = () => setPreviewCover(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSelectPreset = (url) => {
    setSelectedFile(null);
    setCustomUrl(url);
    setPreviewCover(url);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Song title is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let res;
      if (selectedFile) {
        // Upload with new cover photo file
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('genre', genre);
        formData.append('mood', mood);
        formData.append('description', description.trim());
        formData.append('cover', selectedFile);
        res = await api.updateTrack(track._id, formData);
      } else {
        // Update with custom URL or existing cover
        const payload = {
          title: title.trim(),
          genre,
          mood,
          description: description.trim(),
        };
        if (customUrl) {
          payload.coverArtUrl = customUrl;
        }
        res = await api.updateTrack(track._id, payload);
      }

      if (onUpdated) {
        onUpdated(res.track || { ...track, title, genre, mood, description, coverArtUrl: previewCover });
      }
      onClose();
    } catch (err) {
      console.error('Update track error:', err);
      setError(err.message || 'Failed to update track. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0e121b] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 transition-colors"
          disabled={loading}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Edit Song Details</h2>
            <p className="text-[11px] text-zinc-400">Song ka title aur cover photo change karein</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Song Cover Photo Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">Song Cover Photo</label>
            <div className="flex items-center gap-4">
              {/* Photo Preview */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 shadow-lg flex-shrink-0 group">
                <img
                  src={previewCover}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
                  }}
                />
              </div>

              {/* Upload Controls */}
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 flex items-center gap-2 transition-all active:scale-95 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Photo</span>
                </button>
                <p className="text-[10px] text-zinc-400">
                  Phone ya PC se photo chunein (JPG, PNG, WEBP)
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <span className="text-[10px] font-semibold text-zinc-400 block mb-1.5">
                Ya fir instant artwork chunein:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative rounded-xl overflow-hidden border transition-all aspect-square group ${
                      previewCover === preset.url
                        ? 'border-amber-400 ring-2 ring-amber-400/40'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {previewCover === preset.url && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Song Name / Title */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-zinc-300 block">Song Title (Name)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My New Vibe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Genre & Mood Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900 text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                {MOODS.map((m) => (
                  <option key={m} value={m} className="bg-zinc-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
