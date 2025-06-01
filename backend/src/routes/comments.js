const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const InstagramProfile = require('../../models/InstagramProfile');
const User = require('../../models/User');
const Rating = require('../../models/Rating');

// GET /api/comments/:username - pobierz komentarze dla profilu
router.get('/:username', async (req, res) => {
  try {
    const profile = await InstagramProfile.findOne({ username: req.params.username });
    if (!profile) {
      return res.status(404).json({ error: 'Profil nie istnieje' });
    }

    const comments = await Comment.find({ profile: profile._id })
      .populate('user', 'login')
      .sort({ createdAt: -1 })
      .select('user profile content rating createdAt');

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Błąd pobierania komentarzy:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});
// ...existing code...

// Endpoint do sprawdzania czy użytkownik ma już komentarz
router.get('/check/:username/:userId', async (req, res) => {
  try {
    const { username, userId } = req.params;
    
    const profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      return res.json({ hasComment: false });
    }

    const existingComment = await Comment.findOne({ 
      user: userId, 
      profile: profile._id 
    }).populate('user', 'login');

    if (existingComment) {
      return res.json({ 
        hasComment: true, 
        comment: existingComment 
      });
    }

    res.json({ hasComment: false });
  } catch (error) {
    console.error('Błąd sprawdzania komentarza:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment, rating, userId } = req.body;

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Ocena musi być w zakresie 1-10' });
    }

    const existingComment = await Comment.findOne({ 
      _id: commentId, 
      user: userId 
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Komentarz nie znaleziony lub brak uprawnień' });
    }

    existingComment.content = comment;
    existingComment.rating = rating;
    await existingComment.save();

    // Przelicz średnią ocenę profilu
    const comments = await Comment.find({ profile: existingComment.profile });
    const avgRating = comments.reduce((sum, c) => sum + c.rating, 0) / comments.length;
    
    await InstagramProfile.findByIdAndUpdate(existingComment.profile, { avgRating });

    const updatedComment = await Comment.findById(commentId).populate('user', 'login');
    
    res.json({ 
      message: 'Komentarz zaktualizowany', 
      comment: updatedComment 
    });
  } catch (error) {
    console.error('Błąd aktualizacji komentarza:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/', async (req, res) => {
  const { username, comment, rating, userId } = req.body;

  if (!username || !comment || !userId || !rating) {
    return res.status(400).json({ error: 'Brakuje wymaganych danych' });
  }

  if (rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Ocena musi być w zakresie 1-10' });
  }

  try {
    const profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      return res.status(404).json({ error: 'Nie znaleziono profilu' });
    }

    // Sprawdź czy użytkownik już dodał komentarz/ocenę
    const existingComment = await Comment.findOne({
      user: userId,
      profile: profile._id
    });

    if (existingComment) {
      return res.status(409).json({ 
        error: 'Już dodałeś opinię dla tego profilu' 
      });
    }

    // Dodaj komentarz z oceną
    const newComment = new Comment({
      user: userId,
      profile: profile._id,
      content: comment,
      rating: rating
    });

    await newComment.save();

    // Przelicz średnią ocenę profilu
    const comments = await Comment.find({ profile: profile._id });
    const avgRating = comments.reduce((sum, c) => sum + c.rating, 0) / comments.length;
    
    await InstagramProfile.findByIdAndUpdate(profile._id, { avgRating });

    const savedComment = await Comment.findById(newComment._id).populate('user', 'login');

    res.status(201).json({ 
      message: 'Komentarz i ocena dodane', 
      comment: savedComment 
    });
  } catch (error) {
    console.error('Błąd dodawania komentarza:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;