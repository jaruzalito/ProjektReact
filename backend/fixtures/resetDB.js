const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const InstagramProfile = require("../models/InstagramProfile");
const Comment = require("../models/Comment");
const Rating = require("../models/Rating");

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🗑️ Resetowanie bazy danych...");

    await Rating.deleteMany({});
    await Comment.deleteMany({});
    await InstagramProfile.deleteMany({});
    await User.deleteMany({});

    console.log("✅ Baza danych została wyczyszczona");
    console.log("   ⭐ Oceny: usunięte");
    console.log("   💬 Komentarze: usunięte");
    console.log("   📱 Profile: usunięte");
    console.log("   👥 Użytkownicy: usunięci");

    process.exit(0);
  } catch (error) {
    console.error("❌ Błąd:", error);
    process.exit(1);
  }
};

resetDatabase();
