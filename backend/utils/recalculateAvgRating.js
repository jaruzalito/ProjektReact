// utils/recalculateAvgRating.js
const Comment = require('../models/Comment');
const InstagramProfile = require('../models/InstagramProfile');

const recalculateAvgRating = async (profileId) => {
  try {
    // Znajdź wszystkie komentarze dla profilu
    const comments = await Comment.find({ profile: profileId });
    
    let avgRating = null;
    
    if (comments.length > 0) {
      const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
      avgRating = totalRating / comments.length;
      
      // Sprawdź czy wynik jest prawidłową liczbą
      if (isNaN(avgRating) || !isFinite(avgRating)) {
        console.warn(`Nieprawidłowa średnia ocena dla profilu ${profileId}, ustawiam null`);
        avgRating = null;
      }
    }
    
    // Zaktualizuj średnią ocenę w profilu - użyj $unset jeśli avgRating to null
    const updateData = avgRating !== null ? { avgRating } : { $unset: { avgRating: 1 } };
    await InstagramProfile.findByIdAndUpdate(profileId, updateData);
    
    console.log(`Średnia ocena dla profilu ${profileId} zaktualizowana: ${avgRating}`);
    
    return avgRating;
  } catch (error) {
    console.error('Błąd podczas przeliczania średniej oceny:', error);
    throw error;
  }
};

module.exports = recalculateAvgRating;