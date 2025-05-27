const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

function parseInstagramDescription(description) {
  if (!description) return null;

  // Regex do wyciągania danych z opisu Instagram
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
  
  // Fallback dla innych formatów
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

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  let browser;
  
  try {
    console.log(`Pobieranie profilu Instagram dla: ${username}`);
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    
    await page.goto(`https://www.instagram.com/${username}/`, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    const profile = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      const img = document.querySelector('img[alt*="profile picture"], img[alt*="Profile picture"]');
      
      return {
        description: meta ? meta.content : null,
        profilePic: img ? img.src : null
      };
    });
    
    await browser.close();
    browser = null;
    
    console.log('Opis profilu:', profile.description);
    
    if (!profile.description) {
      return res.status(404).json({ 
        error: 'Profil nie istnieje lub jest prywatny',
        username: username
      });
    }
    
    const parsedData = parseInstagramDescription(profile.description);
    
    if (!parsedData) {
      return res.status(500).json({ 
        error: 'Nie udało się sparsować danych profilu',
        rawDescription: profile.description
      });
    }
    
    console.log('Sparsowane dane:', parsedData);
    
    res.json({
      success: true,
      username: parsedData.username,
      fullName: parsedData.fullName,
      bio: parsedData.bio,
      followers: parsedData.followers,
      following: parsedData.following,
      posts: parsedData.posts,
      profilePic: profile.profilePic,
      rawDescription: profile.description // dla debugowania
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
    res.status(500).json({ 
      error: 'Błąd podczas pobierania profilu',
      message: error.message
    });
  }
});

module.exports = router;