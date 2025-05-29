const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const InstagramProfile = require('../../models/InstagramProfile');

function parseInstagramDescription(description) {
  if (!description) return null;

  const regex = /(\d+(?:,\d+)*)\s+Followers?,\s*(\d+(?:,\d+)*)\s+Following,\s*(\d+(?:,\d+)*)\s+Posts?\s*-\s*(.+?)\s*\(@(.+?)\)\s*on\s*Instagram:?\s*"?([^"]*)"?/i;

  const match = description.match(regex);

  if (match) {
    return {
      followers: parseInt(match[1].replace(/,/g, ''), 10),
      following: parseInt(match[2].replace(/,/g, ''), 10),
      posts: parseInt(match[3].replace(/,/g, ''), 10),
      fullName: match[4].trim(),
      username: match[5].trim(),
      bio: match[6].trim() || 'Brak opisu'
    };
  }

  const simpleRegex = /(\d+(?:,\d+)*)\s+Followers?,\s*(\d+(?:,\d+)*)\s+Following,\s*(\d+(?:,\d+)*)\s+Posts?/i;
  const simpleMatch = description.match(simpleRegex);

  if (simpleMatch) {
    return {
      followers: parseInt(simpleMatch[1].replace(/,/g, ''), 10),
      following: parseInt(simpleMatch[2].replace(/,/g, ''), 10),
      posts: parseInt(simpleMatch[3].replace(/,/g, ''), 10),
      fullName: 'Nieznane',
      username: 'Nieznane',
      bio: 'Brak opisu'
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

    // Ustawienie bardziej realistycznego user agenta
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    
    // Dodatkowe właściwości przeglądarki
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Ustawienie viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Dodanie losowego opóźnienia
    await delay(Math.random() * 2000 + 1000);

    console.log(`Przechodzenie do URL: https://www.instagram.com/${username}/`);
    
    const response = await page.goto(`https://www.instagram.com/${username}/`, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Sprawdzenie czy strona się załadowała poprawnie
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    // Sprawdzenie czy nie zostaliśmy przekierowani na stronę logowania
    const currentUrl = page.url();
    console.log(`Obecny URL: ${currentUrl}`);
    
    if (currentUrl.includes('/accounts/login/') || currentUrl.includes('/challenge/')) {
      throw new Error('Instagram wymaga logowania lub wykrył bota');
    }

    // Dodatkowe opóźnienie przed sprawdzeniem zawartości
    await delay(2000);

    // Sprawdzenie czy strona zawiera błąd 404
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

    // Zapisanie do bazy danych
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
    
    // Różne typy błędów
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