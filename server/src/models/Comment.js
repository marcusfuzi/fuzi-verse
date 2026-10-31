import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    audioTimestamp: {
      type: Number, // song position in seconds where comment was placed
      default: null,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
