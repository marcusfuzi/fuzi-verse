import express from 'express';
import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { Like } from '../models/Like.js';
import { PlayHistory } from '../models/PlayHistory.js';
import { Track } from '../models/Track.js';
import { Notification } from '../models/Notification.js';
import { Report } from '../models/Report.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/social/follow/:userId - Follow or unfollow artist
router.post('/follow/:userId', requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
      await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });

      return res.json({
        following: false,
        message: `Unfollowed ${targetUser.displayName}`,
      });
    } else {
      // Follow
      await Follow.create({
        follower: currentUserId,
        following: targetUserId,
      });

      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });
      await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });

      // Notify target user
      await Notification.create({
        recipient: targetUserId,
        actor: currentUserId,
        type: 'follow',
        message: `${req.user.displayName} started following your Verse!`,
      });

      return res.json({
        following: true,
        message: `Now following ${targetUser.displayName}`,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/social/notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'username displayName avatar')
      .populate('track', 'title coverArtUrl')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.json({ notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/social/notifications/read
router.put('/notifications/read', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { $set: { isRead: true } });
    return res.json({ message: 'Notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/social/library/liked
router.get('/library/liked', requireAuth, async (req, res) => {
  try {
    const likes = await Like.find({ user: req.user._id })
      .populate({
        path: 'track',
        populate: { path: 'artist', select: 'displayName username avatar' },
      })
      .sort({ createdAt: -1 });

    const tracks = likes
      .filter((l) => l.track && l.track.isPublic)
      .map((l) => ({
        ...l.track.toObject(),
        isLiked: true,
      }));

    return res.json({ tracks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/social/library/uploads - My uploaded tracks (public and private)
router.get('/library/uploads', requireAuth, async (req, res) => {
  try {
    const tracks = await Track.find({ artist: req.user._id }).sort({ createdAt: -1 });
    return res.json({ tracks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/social/library/history - Recently played tracks
router.get('/library/history', requireAuth, async (req, res) => {
  try {
    const history = await PlayHistory.find({ user: req.user._id })
      .populate({
        path: 'track',
        populate: { path: 'artist', select: 'displayName username avatar' },
      })
      .sort({ playedAt: -1 })
      .limit(25);

    // Filter unique tracks
    const seen = new Set();
    const tracks = [];
    for (const h of history) {
      if (h.track && !seen.has(h.track._id.toString())) {
        seen.add(h.track._id.toString());
        tracks.push(h.track);
      }
    }

    return res.json({ tracks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/social/library/following - Artists followed by user
router.get('/library/following', requireAuth, async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.user._id })
      .populate('following', 'displayName username avatar bio followersCount totalPlays isVerified')
      .sort({ createdAt: -1 });

    const creators = follows.map((f) => ({
      ...f.following.toObject(),
      isFollowing: true,
    }));

    return res.json({ creators });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/social/report - Report copyright infringement or inappropriate track
router.post('/report', requireAuth, async (req, res) => {
  try {
    const { trackId, reason, details } = req.body;
    if (!trackId || !reason) {
      return res.status(400).json({ error: 'Track ID and reason are required.' });
    }

    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    const report = new Report({
      track: trackId,
      reporter: req.user._id,
      reason,
      details: details ? details.trim() : '',
    });

    await report.save();

    return res.status(201).json({
      message: 'Thank you for reporting. Our moderation team has queued this for copyright/safety review.',
      reportId: report._id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
