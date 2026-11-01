import express from 'express';
import { Track } from '../models/Track.js';
import { Like } from '../models/Like.js';
import { PlayHistory } from '../models/PlayHistory.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { uploadTrackFiles, uploadCoverImage } from '../middleware/upload.js';
import { saveToGridFS, deleteFromGridFS } from '../services/gridfsService.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Generate synthetic waveform bars
const generateWaveform = (count = 48) => {
  const bars = [];
  for (let i = 0; i < count; i++) {
    // sinusoidal variation with pseudo-random peaks
    const base = Math.sin((i / count) * Math.PI) * 0.7 + 0.3;
    const jitter = (Math.random() * 0.4 - 0.2);
    const val = Math.min(1, Math.max(0.15, Number((base + jitter).toFixed(2))));
    bars.push(val);
  }
  return bars;
};

// GET /api/tracks - Query tracks with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      genre,
      mood,
      trending,
      featured,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isPublic: true, isBlocked: { $ne: true } };

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (mood && mood !== 'All') {
      query.mood = mood;
    }

    if (trending === 'true') {
      // Find tracks marked trending or sort by highest plays and likes so trending is never empty
      const hasMarked = await Track.exists({ ...query, isTrending: true });
      if (hasMarked) {
        query.isTrending = true;
      }
      sortQuery = { playsCount: -1, likesCount: -1, createdAt: -1 };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

        if (search && search.trim()) {
      const cleanTerm = search.trim();
      const escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');

      // Also find users whose displayName or username matches the search query
      const matchingUsers = await User.find({
        $or: [
          { displayName: searchRegex },
          { username: searchRegex },
        ],
      }).select('_id');
      const matchingUserIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { title: searchRegex },
        { artistName: searchRegex },
        { artist: { $in: matchingUserIds } },
        { description: searchRegex },
        { tags: searchRegex },
        { genre: searchRegex },
        { lyrics: searchRegex },
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'plays') sortQuery = { playsCount: -1 };
    if (sort === 'likes') sortQuery = { likesCount: -1 };
    if (sort === 'oldest') sortQuery = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Track.countDocuments(query);
    const tracks = await Track.find(query)
      .populate('artist', 'username displayName avatar isVerified')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    // If user is authenticated, check which tracks they liked
    let userLikedTrackIds = new Set();
    if (req.user) {
      const likes = await Like.find({
        user: req.user._id,
        track: { $in: tracks.map((t) => t._id) },
      });
      userLikedTrackIds = new Set(likes.map((l) => l.track.toString()));
    }

    const formattedTracks = tracks.map((track) => ({
      ...track.toObject(),
      isLiked: userLikedTrackIds.has(track._id.toString()),
    }));

    return res.json({
      tracks: formattedTracks,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Error fetching tracks:', err);
    return res.status(500).json({ error: 'Failed to fetch tracks: ' + err.message });
  }
});

// GET /api/tracks/:id - Get track details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id).populate(
      'artist',
      'username displayName avatar bio followersCount isVerified totalPlays'
    );

    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({ user: req.user._id, track: track._id });
      isLiked = !!like;
    }

    return res.json({
      track: {
        ...track.toObject(),
        isLiked,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error finding track: ' + err.message });
  }
});

// POST /api/tracks/upload - Upload new music track
router.post('/upload', requireAuth, uploadTrackFiles, async (req, res) => {
  try {
    if (!req.files || !req.files['audio'] || req.files['audio'].length === 0) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const {
      title,
      description,
      genre = 'Hip-Hop',
      mood = 'Vibe',
      lyrics,
      isPublic = 'true',
      rightsConfirmed,
      bpm,
      duration = 0,
      tags,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Track title is required.' });
    }

    if (rightsConfirmed !== 'true' && rightsConfirmed !== true) {
      return res.status(400).json({
        error: 'You must confirm that you own or possess the rights to distribute this audio.',
      });
    }

    const audioFile = req.files['audio'][0];
    const audioUrl = `/uploads/audio/${audioFile.filename}`;

    // Immediately persist audio file into MongoDB Atlas GridFS permanently
    await saveToGridFS(audioFile.path, audioFile.filename, audioFile.mimetype || 'audio/mpeg');

    let coverArtUrl = '';
    if (req.files['cover'] && req.files['cover'].length > 0) {
      const coverFile = req.files['cover'][0];
      coverArtUrl = `/uploads/covers/${coverFile.filename}`;
      // Immediately persist cover image into MongoDB Atlas GridFS permanently
      await saveToGridFS(coverFile.path, coverFile.filename, coverFile.mimetype || 'image/jpeg');
    } else {
      // Default generative cover
      const palettes = ['purple', 'cyan', 'amber', 'rose', 'indigo'];
      const pick = palettes[Math.floor(Math.random() * palettes.length)];
      coverArtUrl = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80`;
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;
      } catch (e) {
        parsedTags = [];
      }
    }

    const newTrack = new Track({
      title: title.trim(),
      artist: req.user._id,
      artistName: req.user.displayName || req.user.username,
      description: description ? description.trim() : '',
      genre,
      mood,
      audioUrl,
      coverArtUrl,
      duration: parseFloat(duration) || 180,
      lyrics: lyrics ? lyrics.trim() : '',
      isPublic: isPublic === 'true' || isPublic === true,
      rightsConfirmed: true,
      tags: parsedTags,
      bpm: parseInt(bpm) || 120,
      waveformData: generateWaveform(64),
    });

    await newTrack.save();

    // Check if creator role needs to be updated
    if (req.user.role === 'listener') {
      req.user.role = 'creator';
      await req.user.save();
    }

    return res.status(201).json({
      message: 'Track published successfully to Fuzi Verse!',
      track: newTrack,
    });
  } catch (err) {
    console.error('Upload track error:', err);
    return res.status(500).json({ error: 'Failed to upload track: ' + err.message });
  }
});

// POST /api/tracks/:id/play - Record a play event
router.post('/:id/play', optionalAuth, async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { playsCount: 1 } },
      { new: true }
    );

    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    // Also update artist's total plays
    await User.findByIdAndUpdate(track.artist, { $inc: { totalPlays: 1 } });

    // Record in history if user is logged in
    if (req.user) {
      await PlayHistory.create({
        user: req.user._id,
        track: track._id,
      });
    }

    return res.json({ playsCount: track.playsCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/tracks/:id/like - Like or Unlike track
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const trackId = req.params.id;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ user: userId, track: trackId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
      return res.json({
        liked: false,
        likesCount: Math.max(0, updatedTrack.likesCount),
        message: 'Removed from liked tracks',
      });
    } else {
      // Like
      await Like.create({ user: userId, track: trackId });
      const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $inc: { likesCount: 1 } },
        { new: true }
      );

      // Notify artist if not self
      if (updatedTrack.artist.toString() !== userId.toString()) {
        await Notification.create({
          recipient: updatedTrack.artist,
          actor: userId,
          type: 'like',
          track: updatedTrack._id,
          message: `${req.user.displayName} liked your track "${updatedTrack.title}"`,
        });
      }

      return res.json({
        liked: true,
        likesCount: updatedTrack.likesCount,
        message: 'Saved to your Liked Songs',
      });
    }
  } catch (err) {
    console.error('Like error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/tracks/:id - Update track (title, cover photo, genre, etc.)
router.put('/:id', requireAuth, uploadCoverImage, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    // Check ownership or admin
    if (track.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this track.' });
    }

    const { title, description, genre, mood, lyrics, isPublic, coverArtUrl } = req.body;
    
    // Update song title if provided
    if (title && title.trim()) {
      track.title = title.trim();
    }

    // Update cover photo if uploaded as new file or provided as URL/preset
    if (req.file) {
      track.coverArtUrl = `/uploads/covers/${req.file.filename}`;
      await saveToGridFS(req.file.path, req.file.filename, req.file.mimetype || 'image/jpeg', true);
    } else if (coverArtUrl && coverArtUrl.trim()) {
      track.coverArtUrl = coverArtUrl.trim();
    }

    if (description !== undefined) track.description = description.trim();
    if (genre) track.genre = genre;
    if (mood) track.mood = mood;
    if (lyrics !== undefined) track.lyrics = lyrics.trim();
    if (isPublic !== undefined) track.isPublic = isPublic;

    await track.save();
    await track.populate('artist', 'username displayName avatar isVerified');

    return res.json({ message: 'Track updated successfully.', track });
  } catch (err) {
    console.error('Update track error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tracks/:id - Delete track
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    if (track.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this track.' });
    }

    if (track.audioUrl && track.audioUrl.startsWith('/uploads/audio/')) {
      const audioName = track.audioUrl.replace('/uploads/audio/', '');
      deleteFromGridFS(audioName).catch(() => {});
    }
    if (track.coverArtUrl && track.coverArtUrl.startsWith('/uploads/covers/')) {
      const coverName = track.coverArtUrl.replace('/uploads/covers/', '');
      deleteFromGridFS(coverName).catch(() => {});
    }
    await Track.deleteOne({ _id: track._id });
    await Like.deleteMany({ track: track._id });

    return res.json({ message: 'Track deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
