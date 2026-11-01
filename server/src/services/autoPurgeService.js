import { Track } from '../models/Track.js';
import { User } from '../models/User.js';
import { Playlist } from '../models/Playlist.js';
import { Comment } from '../models/Comment.js';
import { Like } from '../models/Like.js';
import { Follow } from '../models/Follow.js';
import { Notification } from '../models/Notification.js';
import { deleteFromGridFS } from './gridfsService.js';

/**
 * Automatically purges blocked songs and blocked user accounts whose 5-day grace period has expired.
 * Also cleans up GridFS audio files, covers, playlists, likes, comments, and notifications.
 */
export async function runAutoPurge() {
  try {
    const now = new Date();

    // 1. Permanently delete blocked tracks whose 5-day grace period has expired
    const expiredTracks = await Track.find({
      isBlocked: true,
      scheduledDeleteAt: { $lte: now },
    });

    for (const track of expiredTracks) {
      console.log(`[AutoPurge] Permanently purging expired blocked track: "${track.title}" (ID: ${track._id})`);

      // Delete audio and cover files from MongoDB Atlas GridFS
      if (track.audioUrl && track.audioUrl.startsWith('/uploads/audio/')) {
        const audioName = track.audioUrl.replace('/uploads/audio/', '');
        await deleteFromGridFS(audioName).catch(() => {});
      }
      if (track.coverArtUrl && track.coverArtUrl.startsWith('/uploads/covers/')) {
        const coverName = track.coverArtUrl.replace('/uploads/covers/', '');
        await deleteFromGridFS(coverName).catch(() => {});
      }

      // Delete likes, comments, and remove from any playlists
      await Like.deleteMany({ track: track._id }).catch(() => {});
      await Comment.deleteMany({ track: track._id }).catch(() => {});
      await Playlist.updateMany({ tracks: track._id }, { $pull: { tracks: track._id } }).catch(() => {});

      // Delete track document
      await Track.deleteOne({ _id: track._id });
      console.log(`[AutoPurge] ✅ Track "${track.title}" permanently deleted after 5 days.`);
    }

    // 2. Permanently delete blocked user IDs whose 5-day grace period has expired
    const expiredUsers = await User.find({
      $or: [{ isBlocked: true }, { isSuspended: true }],
      scheduledDeleteAt: { $lte: now },
    });

    for (const user of expiredUsers) {
      if (user.role === 'admin') continue; // Safety guard: never purge admin

      console.log(`[AutoPurge] Permanently purging expired blocked user: @${user.username} (ID: ${user._id})`);

      // Find and purge all tracks created by this user
      const userTracks = await Track.find({ artist: user._id });
      for (const track of userTracks) {
        if (track.audioUrl && track.audioUrl.startsWith('/uploads/audio/')) {
          const audioName = track.audioUrl.replace('/uploads/audio/', '');
          await deleteFromGridFS(audioName).catch(() => {});
        }
        if (track.coverArtUrl && track.coverArtUrl.startsWith('/uploads/covers/')) {
          const coverName = track.coverArtUrl.replace('/uploads/covers/', '');
          await deleteFromGridFS(coverName).catch(() => {});
        }
        await Like.deleteMany({ track: track._id }).catch(() => {});
        await Comment.deleteMany({ track: track._id }).catch(() => {});
        await Playlist.updateMany({ tracks: track._id }, { $pull: { tracks: track._id } }).catch(() => {});
        await Track.deleteOne({ _id: track._id });
      }

      // Delete custom avatar from GridFS if stored in /uploads/
      if (user.avatar && user.avatar.startsWith('/uploads/covers/')) {
        const avatarName = user.avatar.replace('/uploads/covers/', '');
        await deleteFromGridFS(avatarName).catch(() => {});
      }

      // Clean up user's social records
      await Playlist.deleteMany({ creator: user._id }).catch(() => {});
      await Comment.deleteMany({ user: user._id }).catch(() => {});
      await Like.deleteMany({ user: user._id }).catch(() => {});
      await Follow.deleteMany({ $or: [{ follower: user._id }, { following: user._id }] }).catch(() => {});
      await Notification.deleteMany({ $or: [{ recipient: user._id }, { actor: user._id }] }).catch(() => {});

      // Delete user document
      await User.deleteOne({ _id: user._id });
      console.log(`[AutoPurge] ✅ User ID @${user.username} permanently deleted after 5 days.`);
    }
  } catch (err) {
    console.warn('[AutoPurge] Warning during purge cycle:', err.message);
  }
}
