const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
