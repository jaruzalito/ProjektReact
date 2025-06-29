const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstagramProfile",
    required: true,
  },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 10, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
