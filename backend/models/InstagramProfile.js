const mongoose = require('mongoose');

const instagramProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  followers: { type: Number },
  following: { type: Number },
  posts: { type: Number },
  fullName: { type: String },
  bio: { type: String },
  avgRating: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('InstagramProfile', instagramProfileSchema);