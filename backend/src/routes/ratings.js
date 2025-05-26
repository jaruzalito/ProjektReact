const express = require('express');
const router = express.Router();

const Rating = require('../../models/Rating');
const recalculateAvgRating = require('../../utils/recalculateAvgRating');

router.post('/', async (req, res) => {
  try {
    const { user, profile, value } = req.body;

    const rating = await Rating.findOneAndUpdate(
      { user, profile },
      { value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await recalculateAvgRating(profile);

    res.status(200).json({ success: true, rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd zapisu oceny' });
  }
});

module.exports = router;
