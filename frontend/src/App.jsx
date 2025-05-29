import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

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
                  <span className="user-greeting">Witaj, {user.login}!</span>
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

  const handleSearch = () => {
    if (!user) {
      alert('Zaloguj się, aby móc sprawdzać profile!');
      return;
    }
    
    if (!username.trim()) {
      alert('Wprowadź nazwę użytkownika!');
      return;
    }
    
    // Tutaj logika wyszukiwania
    console.log('Searching for:', username);
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
            disabled={!user}
          />
          <button 
            className="search-button" 
            onClick={handleSearch}
            disabled={!user}
          >
            <i className="fas fa-search"></i> Szukaj
          </button>
        </div>
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