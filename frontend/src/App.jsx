import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/verify-token', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Błąd podczas sprawdzania statusu logowania:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    
    fetch('http://localhost:3001/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(err => console.error('Błąd podczas wylogowywania:', err));
  };

  // Pokaż loading podczas sprawdzania statusu logowania
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <Link to="/" className="logo-link">
              <span className="logo">Instagram Checker</span>
            </Link>
            <nav className="nav">
              <Link to="/" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Strona główna</span>
              </Link>
              <Link to="/search" className="nav-link">
                <i className="fas fa-search"></i>
                <span>Sprawdź profil</span>
              </Link>
              <Link to="/faq" className="nav-link">
                <i className="fas fa-question-circle"></i>
                <span>FAQ</span>
              </Link>
              {!user ? (
                <Link to="/login" className="nav-link login-link">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Zaloguj się</span>
                </Link>
              ) : (
                <div className="user-nav">
                  <span className="user-greeting">Witaj, {user.login || user.username}!</span>
                  <button onClick={handleLogout} className="logout-btn-nav">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Wyloguj</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/search" element={<ProfileSearchPage user={user} />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} user={user} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>© 2025 Instagram Checker | Sprawdź z kim masz do czynienia!</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function HomePage({ user }) {
  const recentProfiles = [
    { username: 'janek123', trustLevel: 92 },
    { username: 'monika_bb', trustLevel: 45, warning: 'Podejrzenie bot-a!' },
    { username: 'official_tom', trustLevel: 87 }
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Sprawdź, kto Cię dodał!</h1>
          <p>Unikaj fake profilów i oszustów. Weryfikuj użytkowników przed dodaniem.</p>
          {user ? (
            <Link to="/search" className="cta-button">Sprawdź teraz</Link>
          ) : (
            <div className="cta-buttons">
              <Link to="/search" className="cta-button">Sprawdź teraz</Link>
              <Link to="/login" className="cta-button secondary">Zaloguj się dla pełnych funkcji</Link>
            </div>
          )}
        </div>
      </section>

      <section className="recent-checks">
        <h2 className="section-title">Ostatnio sprawdzone profile</h2>
        <div className="profile-grid">
          {recentProfiles.map((profile, index) => (
            <ProfileCard 
              key={index}
              username={profile.username}
              trustLevel={profile.trustLevel}
              warning={profile.warning}
              user={user}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ username, trustLevel, warning, user }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">
        <i className="fas fa-user-circle"></i>
      </div>
      <h3>@{username}</h3>
      <div className={`trust-level ${trustLevel > 70 ? 'high' : 'low'}`}>
        Zaufanie: {trustLevel}% {trustLevel > 70 ? '✅' : '⚠️'}
      </div>
      {warning && <div className="warning-badge">{warning}</div>}
      <button className="view-button" disabled={!user}>
        {user ? 'Zobacz opinie' : 'Zaloguj się aby zobaczyć'}
      </button>
    </div>
  );
}

function ProfileSearchPage({ user }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'http://localhost:3001' 
    : 'http://localhost:3001';

  const calculateTrustLevel = (profile) => {
    let trust = 50; 
    
    if (profile.followers > 1000) trust += 15;
    if (profile.followers > 10000) trust += 10;
    if (profile.followers > 100000) trust += 5;
    
    const ratio = profile.following / Math.max(profile.followers, 1);
    if (ratio < 0.5) trust += 10; 
    if (ratio > 2) trust -= 15; 
    if (ratio > 5) trust -= 20; 
    
    if (profile.posts > 50) trust += 10;
    if (profile.posts < 10) trust -= 15;
    
    if (profile.fullName && profile.fullName !== 'Nieznane') trust += 5;
    if (profile.bio && profile.bio !== 'Brak opisu' && profile.bio.length > 10) trust += 10;
    
    return Math.max(0, Math.min(100, trust));
  };

  const handleSearch = async () => {
    if (!user) {
      alert('Zaloguj się, aby móc sprawdzać profile!');
      return;
    }
    
    if (!username.trim()) {
      alert('Wprowadź nazwę użytkownika!');
      return;
    }
    
    setLoading(true);
    setError('');
    setProfileData(null);
    
    try {
      const apiUrl = `${API_BASE_URL}/api/instagram/${username.trim()}`;
      console.log('Wysyłam żądanie do:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Status odpowiedzi:', response.status);
      console.log('Headers odpowiedzi:', response.headers);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Otrzymano HTML zamiast JSON:', textResponse.substring(0, 200));
        throw new Error('Serwer zwrócił HTML zamiast JSON - sprawdź konfigurację CORS i URL API');
      }
      
      const data = await response.json();
      console.log('Otrzymane dane:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Błąd podczas pobierania profilu`);
      }
      
      if (data.success) {
        const trustLevel = calculateTrustLevel(data);
        setProfileData({
          ...data,
          trustLevel,
          warnings: generateWarnings(data, trustLevel)
        });
      } else {
        throw new Error(data.error || 'Nie udało się pobrać danych profilu');
      }
    } catch (err) {
      console.error('Błąd podczas wyszukiwania profilu:', err);
      setError(`Błąd: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateWarnings = (profile, trustLevel) => {
    const warnings = [];
    
    if (trustLevel < 30) warnings.push('Bardzo niski poziom zaufania!');
    if (profile.following / Math.max(profile.followers, 1) > 5) warnings.push('Podejrzanie dużo obserwowanych!');
    if (profile.posts < 5) warnings.push('Bardzo mało postów');
    if (profile.followers < 50 && profile.following > 500) warnings.push('Możliwy bot lub spam');
    
    return warnings;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1>Sprawdź profil</h1>
        {!user && (
          <div className="login-prompt">
            <p>⚠️ Musisz być zalogowany, aby sprawdzać profile</p>
            <Link to="/login" className="login-prompt-link">Zaloguj się tutaj</Link>
          </div>
        )}
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Wpisz nazwę użytkownika..." 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!user || loading}
          />
          <button 
            className="search-button" 
            onClick={handleSearch}
            disabled={!user || loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Sprawdzam...
              </>
            ) : (
              <>
                <i className="fas fa-search"></i> Szukaj
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
          </div>
        )}

        {profileData && (
          <div className="profile-result">
            <div className="profile-header">
              <div className="profile-avatar-large">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="profile-info">
                <h2>@{profileData.username}</h2>
                <p className="full-name">{profileData.fullName}</p>
                <div className={`trust-score ${profileData.trustLevel > 70 ? 'high' : profileData.trustLevel > 40 ? 'medium' : 'low'}`}>
                  <span className="trust-label">Poziom zaufania:</span>
                  <span className="trust-value">{profileData.trustLevel}%</span>
                  <span className="trust-icon">
                    {profileData.trustLevel > 70 ? '✅' : profileData.trustLevel > 40 ? '⚠️' : '❌'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <i className="fas fa-users"></i>
                <span className="stat-number">{profileData.followers.toLocaleString()}</span>
                <span className="stat-label">Obserwujący</span>
              </div>
              <div className="stat">
                <i className="fas fa-user-plus"></i>
                <span className="stat-number">{profileData.following.toLocaleString()}</span>
                <span className="stat-label">Obserwowani</span>
              </div>
              <div className="stat">
                <i className="fas fa-camera"></i>
                <span className="stat-number">{profileData.posts.toLocaleString()}</span>
                <span className="stat-label">Posty</span>
              </div>
            </div>

            {profileData.bio && profileData.bio !== 'Brak opisu' && (
              <div className="profile-bio">
                <h4>Opis profilu:</h4>
                <p>"{profileData.bio}"</p>
              </div>
            )}

            {profileData.warnings && profileData.warnings.length > 0 && (
              <div className="warnings">
                <h4>⚠️ Ostrzeżenia:</h4>
                <ul>
                  {profileData.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="profile-actions">
              <button className="btn-primary">
                <i className="fas fa-thumbs-up"></i> Dodaj opinię
              </button>
              <button className="btn-secondary">
                <i className="fas fa-flag"></i> Zgłoś profil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FAQPage() {
  const faqItems = [
    {
      question: "✅ Czy Instagram Checker jest darmowy?",
      answer: "Tak! Weryfikacja profili jest całkowicie bezpłatna."
    },
    {
      question: "🔍 Skąd bierzemy dane?",
      answer: "Analizujemy aktywność profilu i opinie innych użytkowników."
    },
    {
      question: "⚖️ Jak działa system ocen?",
      answer: "Ocena zaufania opiera się na analizie aktywności profilu i zgłoszeniach społeczności."
    },
    {
      question: "🔐 Dlaczego muszę się zalogować?",
      answer: "Logowanie pozwala na dodawanie opinii, pełne sprawdzanie profili i dostęp do historii wyszukiwań."
    }
  ];

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1>Jak to działa?</h1>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;