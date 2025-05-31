const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'InstagramProfile', required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 }, 
  createdAt: { type: Date, default: Date.now }
});
commentSchema.index({ user: 1, profile: 1 }, { unique: true });

module.exports = mongoose.model('Comment', commentSchema);
