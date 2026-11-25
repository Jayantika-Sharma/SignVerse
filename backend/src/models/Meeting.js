const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      default: 'SignVerse Meeting',
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
    settings: {
      liveCaptionsEnabled: { type: Boolean, default: true },
      gestureRecognitionEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', MeetingSchema);