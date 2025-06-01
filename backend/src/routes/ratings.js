const express = require('express');
const router = express.Router();
const Rating = require('../../models/Rating');
const InstagramProfile = require('../../models/InstagramProfile');
const recalculateAvgRating = require('../../utils/recalculateAvgRating');
router.post('/', async (req, res) => {
  const { username, rating, userId } = req.body;

  if (!username || !rating || !userId) {
    return res.status(400).json({ error: 'Brakuje wymaganych danych' });
  }

  // Walidacja zakresu oceny
  if (rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Ocena musi być w zakresie 1-10' });
  }

  try {
    const profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      return res.status(404).json({ error: 'Nie znaleziono profilu' });
    }

    // Sprawdź czy użytkownik już oceniał ten profil
    const existingRating = await Rating.findOne({ 
      user: userId, 
      profile: profile._id 
    });

    if (existingRating) {
      return res.status(409).json({ 
        error: 'Już oceniłeś ten profil', 
        message: 'Możesz ocenić profil tylko raz' 
      });
    }

    // Dodaj nową ocenę
    const newRating = new Rating({
      user: userId,
      profile: profile._id,
      value: rating
    });

    await newRating.save();

    // Przelicz średnią ocenę profilu
    await recalculateAvgRating(profile._id);

    res.status(200).json({ message: 'Ocena zapisana pomyślnie' });
  } catch (error) {
    console.error('Błąd zapisu oceny:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;