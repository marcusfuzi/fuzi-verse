import express from 'express';
import { User } from '../models/User.js';
import { Track } from '../models/Track.js';
import { Playlist } from '../models/Playlist.js';
import { Follow } from '../models/Follow.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/creators - Featured and emerging creators
router.get('/creators', optionalAuth, async (req, res) => {
  try {
    const creators = await User.find({ isSuspended: false })
      .select('displayName username avatar bio followersCount totalPlays isVerified role')
      .sort({ followersCount: -1, totalPlays: -1 })
      .limit(12);

    let followedUserIds = new Set();
    if (req.user) {
      const follows = await Follow.find({
        follower: req.user._id,
        following: { $in: creators.map((c) => c._id) },
      });
      followedUserIds = new Set(follows.map((f) => f.following.toString()));
    }

    const result = creators.map((c) => ({
      ...c.toObject(),
      isFollowing: followedUserIds.has(c._id.toString()),
    }));

    return res.json({ creators: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:usernameOrId - Public Creator Profile
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    let user;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier);
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ error: 'Creator not found.' });
    }

    // Public uploads
    const tracks = await Track.find({ artist: user._id, isPublic: true })
      .sort({ createdAt: -1 })
      .limit(30);

    // Public playlists
    const playlists = await Playlist.find({ creator: user._id, isPublic: true })
      .populate('tracks', 'title duration coverArtUrl')
      .sort({ createdAt: -1 });

    // Check if logged-in user is following this creator
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({
        follower: req.user._id,
        following: user._id,
      });
      isFollowing = !!follow;
    }

    return res.json({
      user: {
        ...user.toJSON(),
        isFollowing,
        uploadsCount: tracks.length,
      },
      tracks,
      playlists,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
