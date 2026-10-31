import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Copyright Infringement',
        'Inappropriate Content',
        'Spam or Scam',
        'Hate Speech',
        'Low Quality / Noise',
        'Other'
      ],
    },
    details: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    actionTaken: {
      type: String,
      default: 'none',
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
