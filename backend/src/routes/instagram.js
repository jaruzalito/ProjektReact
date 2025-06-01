const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const InstagramProfile = require('../../models/InstagramProfile');

function parseNumberWithSuffix(str) {
  if (!str) return 0;

  const cleaned = str.replace(/[,\s]/g, '').toUpperCase();
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

function parseInstagramDescription(description, requestedUsername, pageTitle) {
  if (!description) return null;

  console.log('Parsowanie opisu:', description);
  console.log('Żądany username:', requestedUsername);
  const fullRegex = /(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?\s*-\s*(.*?)\s*\(@([\w.]+)\)\s*on\s*Instagram:\s*"([\s\S]*?)"$/i;
  
  const fullMatch = description.match(fullRegex);
  console.log('Pełny match result:', fullMatch);

  if (fullMatch) {
    const followers = parseNumberWithSuffix(fullMatch[1]);
    const following = parseNumberWithSuffix(fullMatch[2]);
    const posts = parseNumberWithSuffix(fullMatch[3]);
    const fullName = fullMatch[4] ? fullMatch[4].trim() : null;
    const username = fullMatch[5] ? fullMatch[5].trim() : requestedUsername;
    const bio = fullMatch[6] ? fullMatch[6].trim().replace(/\s+/g, ' ') : '';

    console.log('Parsed data (full):', { followers, following, posts, fullName, username, bio });

    return {
      followers,
      following,
      posts,
      fullName: fullName || username,
      username,
      bio: bio || 'Brak opisu'
    };
  }

  const basicRegex = /(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?/i;
  const basicMatch = description.match(basicRegex);
  console.log('Basic match result:', basicMatch);

  if (basicMatch) {
    return {
      followers: parseNumberWithSuffix(basicMatch[1]),
      following: parseNumberWithSuffix(basicMatch[2]),
      posts: parseNumberWithSuffix(basicMatch[3]),
      fullName: requestedUsername, 
      username: requestedUsername,
      bio: 'Brak opisu'
    };
  }
  console.log('Próba ręcznej ekstrakcji...');
  
  const followersMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?/i);
  const followingMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following/i);
  const postsMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?/i);
  
  if (followersMatch && followingMatch && postsMatch) {
    // Próba wyciągnięcia username z opisu
    const usernameMatch = description.match(/(?:Posts\s*)?-\s*.*?\(@([\w.]+)\)\s*on\s*Instagram/i) || 
                         description.match(/@([\w.]+)/);
    const nameMatch = description.match(/Posts?\s*-\s*(.*?)(?:\s*\(@[\w.]+\)|@|on\s+Instagram)/i);
    const bioMatch = description.match(/Instagram:\s*"([\s\S]*?)"$/i);
    
    const extractedUsername = usernameMatch ? usernameMatch[1] : requestedUsername;
    let extractedFullName = null;
    
    if (nameMatch && nameMatch[1].trim() && nameMatch[1].trim() !== '') {
      extractedFullName = nameMatch[1].trim();
    } else if (pageTitle) {
      const titleParts = pageTitle.split('•');
      if (titleParts.length > 0) {
        const titleName = titleParts[0].trim();
        if (titleName && titleName !== extractedUsername && !titleName.includes('Instagram')) {
          extractedFullName = titleName;
        }
      }
    }
    
    const extractedBio = bioMatch ? bioMatch[1].trim().replace(/\s+/g, ' ') : '';
    
    return {
      followers: parseNumberWithSuffix(followersMatch[1]),
      following: parseNumberWithSuffix(followingMatch[1]),
      posts: parseNumberWithSuffix(postsMatch[1]),
      fullName: extractedFullName || extractedUsername,
      username: extractedUsername,
      bio: extractedBio || 'Brak opisu'
    };
  }

  return null;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function launchBrowser() {
  return await puppeteer.launch({
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
}

async function setupPage(browser) {
  const page = await browser.newPage();
  
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
  
  await page.setViewport({ width: 1920, height: 1080 });
  
  return page;
}

async function checkProfileAvailability(page) {
  const pageContent = await page.content();
  const currentUrl = page.url();
  
  if (currentUrl.includes('/accounts/login/') || currentUrl.includes('/challenge/')) {
    throw new Error('Instagram wymaga logowania lub wykrył bota');
  }

  if (pageContent.includes('Sorry, this page isn\'t available') ||
      pageContent.includes('The link you followed may be broken')) {
    return { exists: false };
  }
  
  return { exists: true };
}

async function extractProfileData(page) {
  return await page.evaluate(() => {
    const meta = document.querySelector('meta[name="description"]');
    return {
      description: meta ? meta.content : null,
      title: document.title
    };
  });
}

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  let browser = null;

  try {
    console.log(`Pobieranie profilu Instagram dla: ${username}`);

    browser = await launchBrowser();
    const page = await setupPage(browser);

    await delay(Math.random() * 2000 + 1000);

    const instagramUrl = `https://www.instagram.com/${username}/`;
    console.log(`Przechodzenie do URL: ${instagramUrl}`);

    const response = await page.goto(instagramUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    console.log(`Obecny URL: ${page.url()}`);
    
    const availability = await checkProfileAvailability(page);
    if (!availability.exists) {
      return res.status(404).json({
        error: 'Profil nie istnieje lub jest niedostępny',
        username: username
      });
    }

    await delay(2000);

    const profile = await extractProfileData(page);
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
    const parsedData = parseInstagramDescription(profile.description, username, profile.title);

    if (!parsedData) {
      console.log('Nie udało się sparsować opisu:', profile.description);
      return res.status(500).json({
        error: 'Nie udało się sparsować danych profilu',
        rawDescription: profile.description,
        pageTitle: profile.title
      });
    }

    const result = {
      username: parsedData.username,
      fullName: parsedData.fullName,
      bio: parsedData.bio,
      followers: parsedData.followers,
      following: parsedData.following,
      posts: parsedData.posts,
      createdAt: new Date()
    };

    const savedProfile = await InstagramProfile.findOneAndUpdate(
      { username: result.username },
      { $set: result },
      { upsert: true, new: true }
    );

    res.json({ 
      success: true, 
      ...result,
      avgRating: savedProfile.avgRating
    });

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