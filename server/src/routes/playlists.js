import express from 'express';
import { Playlist } from '../models/Playlist.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/playlists - List public playlists & mood playlists
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { mood, search } = req.query;
    const query = { isPublic: true };

    if (mood) query.mood = mood;
    if (search) query.title = new RegExp(search, 'i');

    const playlists = await Playlist.find(query)
      .populate('creator', 'displayName username avatar')
      .populate('tracks', 'title artistName coverArtUrl duration audioUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ playlists });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/playlists/my - Get logged-in user playlists
router.get('/my', requireAuth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ creator: req.user._id })
      .populate('tracks', 'title artistName coverArtUrl duration audioUrl')
      .sort({ createdAt: -1 });

    return res.json({ playlists });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/playlists/:id - Single playlist
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('creator', 'displayName username avatar')
      .populate({
        path: 'tracks',
        populate: { path: 'artist', select: 'displayName username avatar' },
      });

    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });

    // Check visibility if private
    if (!playlist.isPublic && (!req.user || playlist.creator._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'This playlist is private.' });
    }

    return res.json({ playlist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/playlists - Create playlist
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, isPublic, coverArtUrl, trackId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Playlist title is required.' });
    }

    const tracks = trackId ? [trackId] : [];
    const defaultCover =
      coverArtUrl ||
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80';

    const playlist = new Playlist({
      title: title.trim(),
      description: description ? description.trim() : '',
      creator: req.user._id,
      isPublic: isPublic !== undefined ? isPublic : true,
      coverArtUrl: defaultCover,
      tracks,
    });

    await playlist.save();
    return res.status(201).json({ message: 'Playlist created!', playlist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/playlists/:id/tracks - Add track to playlist
router.post('/:id/tracks', requireAuth, async (req, res) => {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ error: 'Track ID is required.' });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });

    if (playlist.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can modify this playlist.' });
    }

    if (playlist.tracks.includes(trackId)) {
      return res.status(400).json({ error: 'Track is already in this playlist.' });
    }

    playlist.tracks.push(trackId);
    await playlist.save();

    return res.json({ message: 'Track added to playlist!', playlist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/playlists/:id/tracks/:trackId - Remove track from playlist
router.delete('/:id/tracks/:trackId', requireAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });

    if (playlist.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can modify this playlist.' });
    }

    playlist.tracks = playlist.tracks.filter((t) => t.toString() !== req.params.trackId);
    await playlist.save();

    return res.json({ message: 'Track removed from playlist.', playlist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });

    if (playlist.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this playlist.' });
    }

    await Playlist.deleteOne({ _id: playlist._id });
    return res.json({ message: 'Playlist deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
