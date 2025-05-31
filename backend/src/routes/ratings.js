const express = require('express');
const router = express.Router();
const Rating = require('../../models/Rating');
const InstagramProfile = require('../../models/InstagramProfile');
const recalculateAvgRating = require('../../utils/recalculateAvgRating');

// POST /api/ratings - dodaj lub zaktualizuj ocenę
router.post('/', async (req, res) => {
  const { username, rating, userId } = req.body;

  if (!username || !rating || !userId) {
    return res.status(400).json({ error: 'Brakuje wymaganych danych' });
  }

  try {
    const profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      return res.status(404).json({ error: 'Nie znaleziono profilu' });
    }

    // upsert = znajdź i zaktualizuj lub dodaj nową
    await Rating.findOneAndUpdate(
      { user: userId, profile: profile._id },
      { value: rating },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Przelicz średnią ocenę profilu
    await recalculateAvgRating(profile._id);

    res.status(200).json({ message: 'Ocena zapisana' });
  } catch (error) {
    console.error('Błąd zapisu oceny:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
