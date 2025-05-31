const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const InstagramProfile = require('../../models/InstagramProfile');
const User = require('../../models/User');

// GET /api/comments/:username - pobierz komentarze dla profilu
router.get('/:username', async (req, res) => {
  try {
    const profile = await InstagramProfile.findOne({ username: req.params.username });
    if (!profile) {
      return res.status(404).json({ error: 'Profil nie istnieje' });
    }

    const comments = await Comment.find({ profile: profile._id })
      .populate('user', 'login')
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Błąd pobierania komentarzy:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /api/comments - dodaj komentarz
router.post('/', async (req, res) => {
  const { username, comment, userId } = req.body;

  if (!username || !comment || !userId) {
    return res.status(400).json({ error: 'Brakuje wymaganych danych' });
  }

  try {
    const profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      return res.status(404).json({ error: 'Nie znaleziono profilu' });
    }

    const newComment = new Comment({
      user: userId,
      profile: profile._id,
      content: comment
    });

    await newComment.save();
    const savedComment = await Comment.findById(newComment._id).populate('user', 'login');

    res.status(201).json({ message: 'Komentarz dodany', comment: savedComment });
  } catch (error) {
    console.error('Błąd dodawania komentarza:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
