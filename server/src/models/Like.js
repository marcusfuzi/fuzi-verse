import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, track: 1 }, { unique: true });

export const Like = mongoose.model('Like', likeSchema);
