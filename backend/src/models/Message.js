const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
    },

    messageType: {
      type: String,
      enum: ['standard', 'gesture_interpreted', 'speech_transcription', 'file'],
      default: 'standard',
    },

    gestureMetadata: {
      confidence: { type: Number },
      signType: { type: String, enum: ['letter', 'number', 'word', 'phrase', 'statement'] },
      signLanguage: { type: String, default: 'ASL' },
    },
    attachments: [
      {
        url: { type: String },
        fileType: { type: String },
        fileName: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);