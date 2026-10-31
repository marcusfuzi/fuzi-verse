import express from 'express';
import { User } from '../models/User.js';
import { Track } from '../models/Track.js';
import { Report } from '../models/Report.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, totalTracks, totalReports, pendingReports] = await Promise.all([
      User.countDocuments(),
      Track.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const playAggregate = await Track.aggregate([
      { $group: { _id: null, totalPlays: { $sum: '$playsCount' }, totalLikes: { $sum: '$likesCount' } } },
    ]);

    const totalPlays = playAggregate[0]?.totalPlays || 0;
    const totalLikes = playAggregate[0]?.totalLikes || 0;

    return res.json({
      stats: {
        totalUsers,
        totalTracks,
        totalReports,
        pendingReports,
        totalPlays,
        totalLikes,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'username displayName email')
      .populate({
        path: 'track',
        populate: { path: 'artist', select: 'username displayName email' },
      })
      .sort({ createdAt: -1 });

    return res.json({ reports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/reports/:id/action
router.post('/reports/:id/action', async (req, res) => {
  try {
    const { action } = req.body; // 'takedown', 'dismiss', 'suspend_user'
    const report = await Report.findById(req.params.id).populate('track');
    if (!report) return res.status(404).json({ error: 'Report not found.' });

    if (action === 'dismiss') {
      report.status = 'dismissed';
      report.actionTaken = 'Dismissed by admin';
      await report.save();
      return res.json({ message: 'Report dismissed.', report });
    }

    if (action === 'takedown') {
      if (report.track) {
        const artistId = report.track.artist;
        const trackTitle = report.track.title;
        await Track.deleteOne({ _id: report.track._id });

        // Notify creator of copyright takedown
        await Notification.create({
          recipient: artistId,
          type: 'takedown',
          message: `Your track "${trackTitle}" was taken down following a copyright or safety policy complaint.`,
        });
      }

      report.status = 'resolved';
      report.actionTaken = 'Track taken down for policy violation';
      await report.save();
      return res.json({ message: 'Track removed and violation resolved.', report });
    }

    if (action === 'suspend_user') {
      if (report.track) {
        await User.findByIdAndUpdate(report.track.artist, { isSuspended: true });
        await Track.updateMany({ artist: report.track.artist }, { isPublic: false });
      }

      report.status = 'resolved';
      report.actionTaken = 'Creator account suspended';
      await report.save();
      return res.json({ message: 'Creator account suspended and tracks set to private.', report });
    }

    return res.status(400).json({ error: 'Invalid action.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/tracks - List all tracks with search
router.get('/tracks', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { artistName: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
      ];
    }
    const tracks = await Track.find(filter)
      .populate('artist', 'username displayName avatar email isSuspended')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ tracks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/tracks/:id - Admin remove any track
router.delete('/tracks/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    const trackTitle = track.title;
    const artistId = track.artist;

    await Track.deleteOne({ _id: track._id });
    if (artistId) {
      await Notification.create({
        recipient: artistId,
        type: 'takedown',
        message: `Admin Moderation: Track "${trackTitle}" has been removed from Fuzi Verse.`,
      }).catch(() => {});
    }

    return res.json({ message: `Track "${trackTitle}" has been removed successfully.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/toggle-suspend
router.post('/users/:id/toggle-suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.isSuspended = !user.isSuspended;
    await user.save();

    return res.json({
      message: `User ${user.displayName} is now ${user.isSuspended ? 'suspended' : 'active'}.`,
      user,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
