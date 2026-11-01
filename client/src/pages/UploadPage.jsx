import React, { useState, useRef } from 'react';
import {
  Upload,
  Music,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  FileAudio,
  ShieldCheck,
  Disc,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function UploadPage({ onNavigate, onTrackUploaded }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { playTrack } = usePlayer();

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [duration, setDuration] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Hip-Hop');
  const [mood, setMood] = useState('Vibe');
  const [bpm, setBpm] = useState(120);
  const [lyrics, setLyrics] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [rightsConfirmed, setRightsConfirmed] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [successTrack, setSuccessTrack] = useState(null);

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Disc className="w-12 h-12 text-purple-400 mx-auto animate-spin-slow" />
        <h2 className="text-2xl font-bold text-white">Sign In to Upload Your Verse</h2>
        <p className="text-zinc-400 text-xs max-w-sm mx-auto">
          You must be logged in to upload audio masters, retain your copyright, and reach listeners.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="btn-gradient-neon px-8 py-3 rounded-full text-xs font-bold shadow-lg"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleAudioChange = (file) => {
    if (!file) return;
    setAudioFile(file);
    if (!title) {
      // Auto-suggest title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Detect duration using temporary Audio object
    try {
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio(url);
      tempAudio.addEventListener('loadedmetadata', () => {
        setDuration(Math.round(tempAudio.duration) || 0);
      });
    } catch (e) {
      console.warn('Could not extract duration locally:', e);
    }
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!audioFile) {
      setError('Please select an audio file (MP3, WAV, OGG, FLAC).');
      return;
    }
    if (!title.trim()) {
      setError('Track title is required.');
      return;
    }
    if (!rightsConfirmed) {
      setError('You must confirm copyright ownership or authorized licensing.');
      return;
    }

    setUploading(true);
    setProgress(30);

    const formData = new FormData();
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('genre', genre);
    formData.append('mood', mood);
    formData.append('bpm', bpm);
    formData.append('lyrics', lyrics.trim());
    formData.append('duration', duration);
    formData.append('isPublic', isPublic);
    formData.append('rightsConfirmed', rightsConfirmed);

    try {
      setProgress(65);
      const res = await api.uploadTrack(formData);
      setProgress(100);
      setSuccessTrack(res.track);
      if (res.track) {
        onTrackUploaded?.(res.track);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload track');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Upload Your Sound</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Publish your original track to the global Fuzi Verse creator community.
        </p>
      </div>

      {successTrack ? (
        <div className="glass-panel-glow rounded-3xl p-8 text-center space-y-4 border border-purple-500/30 shadow-2xl animate-fade-in">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
          <h2 className="text-2xl font-black text-white">Verse Published Successfully!</h2>
          <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
            "{successTrack.title}" is now live on Fuzi Verse with 3D audio streaming and waveform analysis.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => {
                playTrack(successTrack);
                onNavigate('home');
              }}
              className="btn-gradient-neon px-7 py-3 rounded-full text-xs font-bold shadow-lg flex items-center gap-2"
            >
              <span>Play Track Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSuccessTrack(null);
                setAudioFile(null);
                setCoverFile(null);
                setCoverPreview('');
                setTitle('');
              }}
              className="px-6 py-3 rounded-full glass-input text-xs font-semibold hover:border-purple-400"
            >
              Upload Another Track
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Audio Drag & Drop Box */}
          <div
            onClick={() => audioInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleAudioChange(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              audioFile
                ? 'border-purple-500 bg-purple-900/15'
                : 'border-white/10 hover:border-purple-500/50 bg-zinc-900/40'
            }`}
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
              onChange={(e) => handleAudioChange(e.target.files?.[0])}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-3">
              <FileAudio className="w-7 h-7" />
            </div>
            {audioFile ? (
              <div>
                <p className="text-sm font-bold text-white truncate max-w-md mx-auto">
                  {audioFile.name}
                </p>
                <p className="text-xs text-purple-300 mt-1">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • {duration > 0 ? `${duration}s duration` : 'Audio detected'}
                </p>
                <span className="text-[10px] text-zinc-500 mt-2 block">Click to change audio file</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-white">
                  Drag and drop audio master, or <span className="text-purple-400 underline">browse</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Supports lossless WAV, MP3, OGG, and FLAC (Up to 60MB)
                </p>
              </div>
            )}
          </div>

          {/* Two-column Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cover Art Upload */}
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">Cover Artwork</label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 bg-zinc-900/60 cursor-pointer flex flex-col items-center justify-center relative group"
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverChange(e.target.files?.[0])}
                  className="hidden"
                />
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity">
                      Change Artwork
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    <span className="text-[11px] text-zinc-400 block font-medium">Add Square Cover</span>
                    <span className="text-[9px] text-zinc-600 block mt-0.5">JPG, PNG, WEBP (up to 8MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Form Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Song Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Cyberpunk"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  >
                    <option value="Rap">Rap</option>
                    <option value="Hip-Hop">Hip-Hop</option>
                    <option value="Synthwave">Synthwave</option>
                    <option value="Lo-Fi">Lo-Fi</option>
                    <option value="Indie">Indie</option>
                    <option value="Rock">Rock</option>
                    <option value="EDM">EDM</option>
                    <option value="Acoustic">Acoustic</option>
                    <option value="Instrumental">Instrumental</option>
                    <option value="Experimental">Experimental</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  >
                    <option value="Vibe">Vibe</option>
                    <option value="Chill">Chill</option>
                    <option value="Energetic">Energetic</option>
                    <option value="Dark">Dark</option>
                    <option value="Euphoric">Euphoric</option>
                    <option value="Melancholy">Melancholy</option>
                    <option value="Focus">Focus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Story behind the track, instruments used, credits..."
                  className="w-full px-4 py-2 rounded-xl glass-input text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Optional Lyrics */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Lyrics (Optional • Enables synced reader)
            </label>
            <textarea
              rows="4"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="[Verse 1]&#10;Write your verses here...&#10;&#10;[Chorus]&#10;Your chorus lines..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Visibility & Copyright Statement */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Visibility</span>
                <span className="text-[11px] text-zinc-400">Public tracks appear on Explore and charts</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  isPublic ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {isPublic ? 'Public Release' : 'Private (Unlisted)'}
              </button>
            </div>

            <div className="border-t border-white/5 pt-3 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="rights"
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="rights" className="text-[11px] text-zinc-300 leading-snug">
                I declare and confirm that I created this musical work or possess explicit legal rights/licenses to distribute it. I understand that infringing copyrighted audio will result in takedown and suspension.
              </label>
            </div>
          </div>

          {/* Progress Bar when uploading */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                <span>Uploading and analyzing audio waveform...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full btn-gradient-neon py-3 rounded-2xl text-xs font-bold shadow-xl shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Publishing Audio Master...' : 'Publish Verse to Fuzi Verse'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
