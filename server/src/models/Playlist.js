import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    coverArtUrl: {
      type: String,
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    isMoodPlaylist: {
      type: Boolean,
      default: false,
    },
    mood: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model('Playlist', playlistSchema);
