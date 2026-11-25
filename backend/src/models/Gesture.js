const mongoose = require('mongoose');

const GestureSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['letter', 'number', 'word', 'phrase', 'statement'],
      required: true,
    },
    signLanguage: {
      type: String,
      enum: ['ASL', 'ISL'],
      default: 'ASL',
    },
    spokenEquivalent: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },

    modelClassIndex: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gesture', GestureSchema);