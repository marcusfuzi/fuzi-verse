import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    genre: {
      type: String,
      required: true,
      enum: [
        'Rap',
        'Hip-Hop',
        'Indie',
        'Lo-Fi',
        'Rock',
        'EDM',
        'Acoustic',
        'Instrumental',
        'Experimental',
        'Synthwave',
        'R&B',
        'Other'
      ],
      default: 'Hip-Hop',
    },
    mood: {
      type: String,
      enum: ['Chill', 'Energetic', 'Dark', 'Euphoric', 'Melancholy', 'Focus', 'Romantic', 'Vibe'],
      default: 'Vibe',
    },
    audioUrl: {
      type: String,
      required: true,
    },
    coverArtUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    lyrics: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    rightsConfirmed: {
      type: Boolean,
      default: true,
    },
    playsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    waveformData: [
      {
        type: Number,
      },
    ],
    bpm: {
      type: Number,
      default: 120,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

trackSchema.index({ title: 'text', description: 'text', artistName: 'text', genre: 'text' });
trackSchema.index({ playsCount: -1 });
trackSchema.index({ likesCount: -1 });
trackSchema.index({ createdAt: -1 });

export const Track = mongoose.model('Track', trackSchema);
