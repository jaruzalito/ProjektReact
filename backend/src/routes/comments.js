// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const InstagramProfile = require('../../models/InstagramProfile');
const User = require('../../models/User');
const recalculateAvgRating = require('../../utils/recalculateAvgRating');

// Middleware do weryfikacji tokena
const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/comments/:username - Pobierz komentarze dla profilu
router.get('/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Znajdź profil
    let profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      return res.json({ comments: [] });
    }

    // Pobierz komentarze z populowanymi danymi użytkownika
    const comments = await Comment.find({ profile: profile._id })
      .populate('user', 'login')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/comments - Dodaj nowy komentarz
router.post('/', verifyToken, async (req, res) => {
  try {
    const { username, comment, rating } = req.body;
    const userId = req.userId;

    if (!username || !comment || !rating) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }

    // Znajdź lub utwórz profil Instagram
    let profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      profile = new InstagramProfile({ username });
      await profile.save();
    }

    // Sprawdź czy użytkownik już dodał komentarz
    const existingComment = await Comment.findOne({ 
      user: userId, 
      profile: profile._id 
    });

    if (existingComment) {
      return res.status(409).json({ error: 'You have already commented on this profile' });
    }

    // Utwórz nowy komentarz
    const newComment = new Comment({
      user: userId,
      profile: profile._id,
      content: comment,
      rating: rating
    });

    await newComment.save();

    // Przelicz średnią ocenę
    await recalculateAvgRating(profile._id);

    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: newComment 
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/comments/check/:username/:userId - Sprawdź czy użytkownik ma komentarz
router.get('/check/:username/:userId', verifyToken, async (req, res) => {
  try {
    const { username, userId } = req.params;
    
    const profile = await InstagramProfile.findOne({ username });
    if (!profile) {
      return res.json({ hasComment: false });
    }

    const comment = await Comment.findOne({ 
      user: userId, 
      profile: profile._id 
    });

    if (comment) {
      res.json({ hasComment: true, comment });
    } else {
      res.json({ hasComment: false });
    }
  } catch (error) {
    console.error('Error checking comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/comments/:id - Edytuj komentarz
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;
    const userId = req.userId;

    if (!comment || !rating) {
      return res.status(400).json({ error: 'Comment and rating are required' });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }

    const existingComment = await Comment.findById(id);
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Sprawdź czy użytkownik jest właścicielem komentarza
    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    // Aktualizuj komentarz
    existingComment.content = comment;
    existingComment.rating = rating;
    await existingComment.save();

    // Przelicz średnią ocenę
    await recalculateAvgRating(existingComment.profile);

    res.json({ 
      message: 'Comment updated successfully',
      comment: existingComment 
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;