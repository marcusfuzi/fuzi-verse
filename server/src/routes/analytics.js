import express from 'express';
import { Track } from '../models/Track.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/creator
router.get('/creator', requireAuth, async (req, res) => {
  try {
    const creatorId = req.user._id;

    // Fetch all creator's tracks
    const tracks = await Track.find({ artist: creatorId }).sort({ playsCount: -1 });

    const totalTracks = tracks.length;
    let totalPlays = 0;
    let totalLikes = 0;
    let totalComments = 0;

    const genreDistribution = {};

    tracks.forEach((t) => {
      totalPlays += t.playsCount || 0;
      totalLikes += t.likesCount || 0;
      totalComments += t.commentsCount || 0;
      genreDistribution[t.genre] = (genreDistribution[t.genre] || 0) + 1;
    });

    const user = await User.findById(creatorId).select('followersCount followingCount');

    // Generate monthly simulated analytics points based on real totals for rich charts
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const playsHistory = months.map((month, idx) => {
      const factor = (idx + 1) / months.length;
      return {
        month,
        plays: Math.round(totalPlays * factor * (0.8 + Math.random() * 0.4)),
        likes: Math.round(totalLikes * factor * (0.8 + Math.random() * 0.4)),
      };
    });

    return res.json({
      metrics: {
        totalTracks,
        totalPlays,
        totalLikes,
        totalComments,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
      },
      topTracks: tracks.slice(0, 5),
      genreDistribution,
      playsHistory,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
