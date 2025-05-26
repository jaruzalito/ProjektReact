const mongoose = require('mongoose');

const instagramProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  profileImage: { type: String },
  followers: { type: Number },
  following: { type: Number },
  category: { type: String },
  avgRating: { type: Number, default: null }, // <-- dodane
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InstagramProfile', instagramProfileSchema);
