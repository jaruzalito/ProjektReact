const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const InstagramProfile = require('../../models/InstagramProfile');

function parseInstagramDescription(description) {
  if (!description) return null;

  // Funkcja pomocnicza do konwersji skróconych liczb (1M, 1K, etc.) na liczby całkowite
  function parseNumberWithSuffix(str) {
    if (!str) return 0;

    // Usuń przecinki i spacje
    const cleaned = str.replace(/[,\s]/g, '').toUpperCase();

    // Sprawdź czy ma sufiks
    const match = cleaned.match(/^(\d+(?:\.\d+)?)([KMBTQ]?)$/);
    if (!match) return parseInt(cleaned, 10) || 0;

    const number = parseFloat(match[1]);
    const suffix = match[2];

    const multipliers = {
      'K': 1000,
      'M': 1000000,
      'B': 1000000000,
      'T': 1000000000000,
      'Q': 1000000000000000
    };

    return Math.floor(number * (multipliers[suffix] || 1));
  }

  // Dodaj debug log
  console.log('Parsowanie opisu:', description);

  // Główne wyrażenie regularne - obsługuje różne formaty liczb
  // Poprawione wyrażenie regularne z lepszym dopasowaniem dla wieloliniowego tekstu
  const regex = /(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?\s*-\s*(.*?)\s*\(@([\w.]+)\)\s*on\s*Instagram:\s*"([\s\S]*?)"$/i;

  const match = description.match(regex);
  console.log('Match result:', match);

  if (match) {
    const followers = parseNumberWithSuffix(match[1]);
    const following = parseNumberWithSuffix(match[2]);
    const posts = parseNumberWithSuffix(match[3]);
    const fullName = match[4] ? match[4].trim() : 'Nieznane';
    const username = match[5].trim();
    const bio = match[6] ? match[6].trim().replace(/\s+/g, ' ') : 'Brak opisu';

    console.log('Parsed data:', { followers, following, posts, fullName, username, bio });

    return {
      followers,
      following,
      posts,
      fullName,
      username,
      bio
    };
  }

  // Fallback - prostsze wyrażenie regularne
  const simpleRegex = /(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?/i;
  const simpleMatch = description.match(simpleRegex);
  console.log('Simple match result:', simpleMatch);

  if (simpleMatch) {
    return {
      followers: parseNumberWithSuffix(simpleMatch[1]),
      following: parseNumberWithSuffix(simpleMatch[2]),
      posts: parseNumberWithSuffix(simpleMatch[3]),
      fullName: 'Nieznane',
      username: 'Nieznane',
      bio: 'Brak opisu'
    };
  }

  // Jeśli żaden regex nie zadziałał, spróbuj wyciągnąć dane manualnie
  console.log('Trying manual extraction...');

  // Spróbuj znaleźć liczby followers, following, posts
  const followersMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?/i);
  const followingMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following/i);
  const postsMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?/i);
  const usernameMatch = description.match(/(?:Posts\s*)?-\s*@([\w.]+)\s+on\s+Instagram/i) || description.match(/@([\w.]+)/); // Fallback to first @ mention
  const nameMatch = description.match(/Posts?\s*-\s*(.*?)(?:@|on\s+Instagram)/);
  const bioMatch = description.match(/Instagram:\s*"([\s\S]*?)"$/);

  if (followersMatch && followingMatch && postsMatch) {
    return {
      followers: parseNumberWithSuffix(followersMatch[1]),
      following: parseNumberWithSuffix(followingMatch[1]),
      posts: parseNumberWithSuffix(postsMatch[1]),
      fullName: nameMatch ? nameMatch[1].trim() : 'Nieznane',
      username: usernameMatch ? usernameMatch[1] : 'Nieznane',
      bio: bioMatch ? bioMatch[1].trim().replace(/\s+/g, ' ') : 'Brak opisu'
    };
  }

  return null;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  let browser = null;

  try {
    console.log(`Pobieranie profilu Instagram dla: ${username}`);

    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    await page.setViewport({ width: 1920, height: 1080 });

    await delay(Math.random() * 2000 + 1000);

    console.log(`Przechodzenie do URL: https://www.instagram.com/${username}/`);

    const response = await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    const currentUrl = page.url();
    console.log(`Obecny URL: ${currentUrl}`);

    if (currentUrl.includes('/accounts/login/') || currentUrl.includes('/challenge/')) {
      throw new Error('Instagram wymaga logowania lub wykrył bota');
    }

    await delay(2000);

    const pageContent = await page.content();
    if (pageContent.includes('Sorry, this page isn\'t available') ||
        pageContent.includes('The link you followed may be broken')) {
      return res.status(404).json({
        error: 'Profil nie istnieje lub jest niedostępny',
        username: username
      });
    }

    const profile = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return {
        description: meta ? meta.content : null,
        title: document.title
      };
    });

    console.log('Znaleziony opis meta:', profile.description);
    console.log('Tytuł strony:', profile.title);

    await browser.close();
    browser = null;

    if (!profile.description) {
      return res.status(404).json({
        error: 'Nie udało się pobrać danych profilu - może być prywatny lub nieistniejący',
        username: username,
        pageTitle: profile.title
      });
    }

    const parsedData = parseInstagramDescription(profile.description);

    if (!parsedData) {
      console.log('Nie udało się sparsować opisu:', profile.description);
      return res.status(500).json({
        error: 'Nie udało się sparsować danych profilu',
        rawDescription: profile.description,
        pageTitle: profile.title
      });
    }

    let result = {
      username: parsedData.username,
      fullName: parsedData.fullName,
      bio: parsedData.bio,
      followers: parsedData.followers,
      following: parsedData.following,
      posts: parsedData.posts,
      createdAt: new Date()
    };

    await InstagramProfile.findOneAndUpdate(
        { username: result.username },
        { $set: result },
        { upsert: true, new: true }
    );

    res.json({ success: true, ...result });

  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Błąd podczas zamykania przeglądarki:', closeError);
      }
    }

    console.error('Błąd podczas pobierania profilu Instagram:', error);

    if (error.message.includes('Navigation timeout')) {
      return res.status(408).json({
        error: 'Przekroczono limit czasu ładowania strony',
        message: 'Instagram może być przeciążony lub blokuje dostęp'
      });
    }

    if (error.message.includes('wykrył bota') || error.message.includes('logowania')) {
      return res.status(403).json({
        error: 'Instagram wykrył automatyczne pobieranie danych',
        message: 'Spróbuj ponownie za kilka minut'
      });
    }

    res.status(500).json({
      error: 'Błąd podczas pobierania profilu',
      message: error.message,
      triedUrl: `https://www.instagram.com/${username}/`
    });
  }
});

module.exports = router;