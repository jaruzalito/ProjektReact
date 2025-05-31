// routes/instagram.js - Dodaj lub zastąp istniejący kod

const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const InstagramProfile = require('../../models/InstagramProfile');
const Comment = require('../../models/Comment');

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

router.get('/:username', verifyToken, async (req, res) => {
  let browser;
  
  try {
    const username = req.params.username.toLowerCase().trim();
    console.log(`Pobieranie profilu Instagram dla: ${username}`);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const url = `https://www.instagram.com/${username}/`;
    console.log(`Przechodzenie do URL: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    console.log(`Obecny URL: ${page.url()}`);

    // Pobierz opis meta
    const metaDescription = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
    console.log(`Znaleziony opis meta: ${metaDescription}`);

    // Pobierz tytuł strony
    const title = await page.title();
    console.log(`Tytuł strony: ${title}`);

    if (!metaDescription) {
      throw new Error('Nie znaleziono opisu meta - profil może nie istnieć');
    }

    console.log(`Parsowanie opisu: ${metaDescription}`);

    // Parsuj dane z opisu meta
    const regex = /(\d+(?:,\d+)*)\s+Followers?,\s+(\d+(?:,\d+)*)\s+Following,\s+(\d+(?:,\d+)*)\s+Posts?\s+-\s+@(\w+)\s+on\s+Instagram:\s*"([^"]*)"/i;
    const basicRegex = /(\d+(?:,\d+)*)\s+Followers?,\s+(\d+(?:,\d+)*)\s+Following,\s+(\d+(?:,\d+)*)\s+Posts?/i;

    console.log(`Żądany username: ${username}`);

    const fullMatch = metaDescription.match(regex);
    console.log(`Pełny match result: ${JSON.stringify(fullMatch)}`);

    const basicMatch = metaDescription.match(basicRegex);
    console.log(`Basic match result: ${JSON.stringify(basicMatch)}`);

    let followers, following, posts, fullName = 'Nieznane', bio = 'Brak opisu';

    if (fullMatch) {
      [, followers, following, posts, , bio] = fullMatch;
      bio = bio || 'Brak opisu';
    } else if (basicMatch) {
      [, followers, following, posts] = basicMatch;
      
      // Spróbuj wyciągnąć bio z pozostałej części
      const bioMatch = metaDescription.match(/on Instagram:\s*"([^"]*)"/i);
      if (bioMatch) {
        bio = bioMatch[1] || 'Brak opisu';
      }
    } else {
      throw new Error('Nie udało się sparsować danych profilu');
    }

    // Usuń przecinki z liczb i konwertuj na int
    const parseNumber = (str) => parseInt(str.replace(/,/g, ''), 10);
    
    const profileData = {
      username: username,
      followers: parseNumber(followers),
      following: parseNumber(following),
      posts: parseNumber(posts),
      fullName: fullName,
      bio: bio.trim(),
      success: true
    };

    console.log(`Dane profilu: ${JSON.stringify(profileData)}`);

    // Znajdź lub utwórz profil w bazie danych
    let dbProfile = await InstagramProfile.findOne({ username: username });
    
    if (dbProfile) {
      // Aktualizuj istniejący profil
      dbProfile.followers = profileData.followers;
      dbProfile.following = profileData.following;
      dbProfile.posts = profileData.posts;
      dbProfile.fullName = profileData.fullName;
      dbProfile.bio = profileData.bio;
      await dbProfile.save();
    } else {
      // Utwórz nowy profil
      dbProfile = new InstagramProfile({
        username: profileData.username,
        followers: profileData.followers,
        following: profileData.following,
        posts: profileData.posts,
        fullName: profileData.fullName,
        bio: profileData.bio
      });
      await dbProfile.save();
    }

    // Oblicz średnią ocenę z komentarzy
    const comments = await Comment.find({ profile: dbProfile._id });
    let avgRating = null;
    
    if (comments.length > 0) {
      const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
      avgRating = totalRating / comments.length;
      
      // Sprawdź czy wynik jest prawidłową liczbą
      if (isNaN(avgRating) || !isFinite(avgRating)) {
        console.warn(`Nieprawidłowa średnia ocena dla profilu ${dbProfile._id}, ustawiam null`);
        avgRating = null;
      }
      
      // Bezpiecznie aktualizuj średnią ocenę w profilu
      if (avgRating !== null) {
        dbProfile.avgRating = avgRating;
        await dbProfile.save();
      }
    } else {
      // Jeśli nie ma komentarzy, usuń avgRating jeśli istnieje
      if (dbProfile.avgRating !== undefined) {
        dbProfile.avgRating = undefined;
        await dbProfile.save();
      }
    }

    // Dodaj avgRating do odpowiedzi
    const responseData = {
      ...profileData,
      avgRating: avgRating
    };

    res.json(responseData);

  } catch (error) {
    console.error('Błąd podczas pobierania profilu Instagram:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Błąd podczas pobierania profilu Instagram'
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = router;