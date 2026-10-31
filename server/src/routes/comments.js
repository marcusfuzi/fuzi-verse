import express from 'express';
import { Comment } from '../models/Comment.js';
import { Track } from '../models/Track.js';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/comments/track/:trackId
router.get('/track/:trackId', async (req, res) => {
  try {
    const comments = await Comment.find({ track: req.params.trackId })
      .populate('user', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ comments });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/comments/track/:trackId
router.post('/track/:trackId', requireAuth, async (req, res) => {
  try {
    const { text, audioTimestamp } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text cannot be empty.' });
    }

    const track = await Track.findById(req.params.trackId);
    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    const comment = new Comment({
      track: track._id,
      user: req.user._id,
      text: text.trim(),
      audioTimestamp: audioTimestamp !== undefined ? Number(audioTimestamp) : null,
    });

    await comment.save();

    // Increment track commentsCount
    await Track.findByIdAndUpdate(track._id, { $inc: { commentsCount: 1 } });

    // Populate user details for immediate client display
    await comment.populate('user', 'username displayName avatar isVerified');

    // Notify artist if not commenting on own track
    if (track.artist.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: track.artist,
        actor: req.user._id,
        type: 'comment',
        track: track._id,
        message: `${req.user.displayName} commented on "${track.title}": "${text.substring(0, 40)}..."`,
      });
    }

    return res.status(201).json({ message: 'Comment posted!', comment });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    const track = await Track.findById(comment.track);

    // Can delete if author, or track owner, or admin
    const isAuthor = comment.user.toString() === req.user._id.toString();
    const isTrackOwner = track && track.artist.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isTrackOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment.' });
    }

    await Comment.deleteOne({ _id: comment._id });
    if (track) {
      await Track.findByIdAndUpdate(track._id, { $inc: { commentsCount: -1 } });
    }

    return res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
