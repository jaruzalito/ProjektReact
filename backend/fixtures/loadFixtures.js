const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const InstagramProfile = require('../models/InstagramProfile');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');

const usersData = require('./users.json');
const profilesData = require('./profiles.json');
const commentsData = require('./comments.json');
const ratingsData = require('./ratings.json');

const recalculateAvgRating = require('../utils/recalculateAvgRating');

const loadFixtures = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ Połączono z bazą danych');

    console.log('🗑️ Czyszczenie istniejących danych...');
    await Rating.deleteMany({});
    await Comment.deleteMany({});
    await InstagramProfile.deleteMany({});
    await User.deleteMany({});

    console.log('👥 Ładowanie użytkowników...');
    const users = [];
    for (const userData of usersData) {
      const user = new User({
        login: userData.login,
        passwordHash: userData.password
      });
      await user.save();
      users.push(user);
      console.log(`   ✓ Dodano użytkownika: ${userData.login}`);
    }
    console.log('📱 Ładowanie profili Instagram...');
    const profiles = [];
    for (const profileData of profilesData) {
      const profile = new InstagramProfile({
        username: profileData.username,
        fullName: profileData.fullName,
        bio: profileData.bio,
        followers: profileData.followers,
        following: profileData.following,
        posts: profileData.posts,
        avgRating: profileData.avgRating,
        createdAt: new Date()
      });
      await profile.save();
      profiles.push(profile);
      console.log(`   ✓ Dodano profil: @${profileData.username} (${profileData.followers.toLocaleString()} followers)`);
    }
    console.log('💬 Ładowanie komentarzy...');
    for (const commentData of commentsData) {
      const user = users.find(u => u.login === commentData.userLogin);
      const profile = profiles.find(p => p.username === commentData.profileUsername);
      
      if (user && profile) {
        const comment = new Comment({
          user: user._id,
          profile: profile._id,
          content: commentData.content,
          rating: commentData.rating,
          createdAt: new Date()
        });
        await comment.save();
        console.log(`   ✓ Dodano komentarz dla @${commentData.profileUsername} (ocena: ${commentData.rating}/10)`);
      }
    }
    console.log('⭐ Ładowanie ocen...');
    for (const ratingData of ratingsData) {
      const user = users.find(u => u.login === ratingData.userLogin);
      const profile = profiles.find(p => p.username === ratingData.profileUsername);
      
      if (user && profile) {
        const rating = new Rating({
          user: user._id,
          profile: profile._id,
          value: ratingData.value,
          createdAt: new Date()
        });
        await rating.save();
        console.log(`   ✓ Dodano ocenę dla @${ratingData.profileUsername} (${ratingData.value}/5)`);
      }
    }
    console.log('📊 Przeliczanie średnich ocen...');
    for (const profile of profiles) {
      await recalculateAvgRating(profile._id);
      const updatedProfile = await InstagramProfile.findById(profile._id);
      if (updatedProfile.avgRating) {
        console.log(`   ✓ @${profile.username}: średnia ${updatedProfile.avgRating.toFixed(1)}/10`);
      } else {
        console.log(`   ✓ @${profile.username}: brak ocen`);
      }
    }

    console.log('🎉 Fixtures załadowane pomyślnie!');
    console.log('\n📊 Podsumowanie:');
    console.log(`   👥 Użytkownicy: ${await User.countDocuments()}`);
    console.log(`   📱 Profile: ${await InstagramProfile.countDocuments()}`);
    console.log(`   💬 Komentarze: ${await Comment.countDocuments()}`);
    console.log(`   ⭐ Oceny: ${await Rating.countDocuments()}`);
    
    console.log('\n🔑 Dane logowania:');
    console.log('   admin / admin123');
    console.log('   testuser1 / test123');
    console.log('   testuser2 / test123');
    console.log('   reviewer1 / review123');
    console.log('   moderator / mod123');
    
    console.log('\n📱 Profile do testowania:');
    console.log('   @prezydent_pl (328K followers)');
    console.log('   @champagnepapi (143M followers)');
    console.log('   @mathesobek (3.4K followers)');
    console.log('   @wojteksyk (1.1K followers)');
    console.log('   @janek123 (1.25K followers)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd podczas ładowania fixtures:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Sprawdź czy MongoDB jest uruchomione:');
      console.log('   mongod');
      console.log('   lub Docker: docker run -d -p 27017:27017 mongo');
    }
    
    process.exit(1);
  }
};

loadFixtures();