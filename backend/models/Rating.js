const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'InstagramProfile', required: true },
  value: { type: Number, required: true, min: 1, max: 10 },
  createdAt: { type: Date, default: Date.now }
});

ratingSchema.index({ user: 1, profile: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
