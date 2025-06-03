import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
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
            <Route path="/add-review/:username" element={<AddReviewPage user={user} />} />
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
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState('');

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'http://localhost:3001' 
    : 'http://localhost:3001';

  useEffect(() => {
    const fetchRecentProfiles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/instagram/recent`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setRecentProfiles(data.profiles || []);
        } else {
          console.error('Błąd podczas pobierania ostatnich profili');
          setProfilesError('Nie udało się pobrać ostatnich profili');
        }
      } catch (error) {
        console.error('Błąd podczas pobierania ostatnich profili:', error);
        setProfilesError('Błąd połączenia z serwerem');
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchRecentProfiles();
  }, [API_BASE_URL]);

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

  const generateWarnings = (profile, trustLevel) => {
    const warnings = [];
    
    if (trustLevel < 30) warnings.push('Bardzo niski poziom zaufania!');
    if (profile.following / Math.max(profile.followers, 1) > 5) warnings.push('Podejrzanie dużo obserwowanych!');
    if (profile.posts < 5) warnings.push('Bardzo mało postów');
    if (profile.followers < 50 && profile.following > 500) warnings.push('Możliwy bot lub spam');
    
    return warnings;
  };

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
        {loadingProfiles ? (
          <div className="loading-profiles">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Ładowanie ostatnich profili...</p>
          </div>
        ) : profilesError ? (
          <div className="profiles-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{profilesError}</p>
          </div>
        ) : recentProfiles.length > 0 ? (
          <div className="profile-grid">
            {recentProfiles.map((profile, index) => {
              const trustLevel = calculateTrustLevel(profile);
              const warnings = generateWarnings(profile, trustLevel);
              
              return (
                <ProfileCard 
                  key={index}
                  username={profile.username}
                  trustLevel={trustLevel}
                  avgRating={profile.avgRating}
                  warning={warnings.length > 0 ? warnings[0] : null}
                  user={user}
                />
              );
            })}
          </div>
        ) : (
          <div className="no-profiles">
            <i className="fas fa-search"></i>
            <p>Brak ostatnio sprawdzonych profili</p>
            <Link to="/search" className="cta-button">Sprawdź pierwszy profil</Link>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileCard({ username, trustLevel, avgRating, warning, user }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">
        <i className="fas fa-user-circle"></i>
      </div>
      <h3>@{username}</h3>
      <div className={`trust-level ${trustLevel > 70 ? 'high' : 'low'}`}>
        Zaufanie: {trustLevel}% {trustLevel > 70 ? '✅' : '⚠️'}
      </div>


{user ? (
  <Link to={`/search?username=${username}`} className="view-button">
    Zobacz opinie
  </Link>
) : (
  <button className="view-button" disabled>
    Zaloguj się aby zobaczyć
  </button>
)}
    </div>
  );
}

function ProfileSearchPage({ user }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

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

  const loadComments = async (username) => {
    if (!user) return;
    
    setLoadingComments(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${username}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Błąd podczas ładowania komentarzy:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const usernameFromQuery = params.get('username');
    if (usernameFromQuery) {
      setUsername(usernameFromQuery);
      if (user) {
        handleSearch(usernameFromQuery);
      }
    }
    // eslint-disable-next-line
  }, [location.search, user]);

  // Zmień handleSearch tak, by przyjmował argument:
  const handleSearch = async (searchUsername) => {
    const uname = (typeof searchUsername === 'string' ? searchUsername : username).trim();
    if (!user) {
      alert('Zaloguj się, aby móc sprawdzać profile!');
      return;
    }
    if (!uname) {
      alert('Wprowadź nazwę użytkownika!');
      return;
    }
    setLoading(true);
    setError('');
    setProfileData(null);
    setComments([]);
    try {
      const apiUrl = `${API_BASE_URL}/api/instagram/${uname}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Serwer zwrócił HTML zamiast JSON - sprawdź konfigurację CORS i URL API');
      }
      const data = await response.json();
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
        await loadComments(uname);
      } else {
        throw new Error(data.error || 'Nie udało się pobrać danych profilu');
      }
    } catch (err) {
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
                <div className="profile-name-rating">
                  <div className="profile-name-section">
                    <h2>@{profileData.username}</h2>
                    <p className="full-name">{profileData.fullName}</p>
                  </div>
                  {profileData.avgRating && (
                    <div className="avg-rating-display">
                      <i className="fas fa-star rating-star"></i>
                      <span className="avg-rating-value">{profileData.avgRating.toFixed(1)}</span>
                      <span className="rating-scale">/10</span>
                    </div>
                  )}
                </div>
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
                <span className="stat-label"> Obserwujących</span>
              </div>
              <div className="stat">
                <i className="fas fa-user-plus"></i>
                <span className="stat-number">{profileData.following.toLocaleString()}</span>
                <span className="stat-label"> Obserwowanych</span>
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
              <Link to={`/add-review/${profileData.username}`} className="btn-primary">
                <i className="fas fa-thumbs-up"></i> Dodaj opinię
              </Link>
              <button className="btn-secondary">
                <i className="fas fa-flag"></i> Zgłoś profil
              </button>
            </div>

            <div className="comments-section">
              <h3>Opinie użytkowników</h3>
              {loadingComments ? (
                <div className="loading-comments">
                  <i className="fas fa-spinner fa-spin"></i> Ładowanie opinii...
                </div>
              ) : comments.length > 0 ? (
                <div className="comments-list">
                  {comments.map((comment, index) => (
                    <CommentCard key={index} comment={comment}/>
                  ))}
                </div>
              ) : (
                <div className="no-comments">
                  <p>Brak opinii dla tego profilu. <Link to={`/add-review/${profileData.username}`}>Dodaj pierwszą!</Link></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentCard({ comment }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="comment-author">
          <i className="fas fa-user-circle"></i>
          <span className="author-name">{comment.user?.login || 'Anonimowy'}</span>
        </div>
        <div className="comment-meta">
          {comment.rating && (
            <div className="comment-rating">
              <i className="fas fa-star rating-star-small"></i>
              <span className="rating-text">{comment.rating}/10</span>
            </div>
          )}
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
      </div>
      <div className="comment-content">
        <p>{comment.content}</p>
      </div>
    </div>
  );
}

function AddReviewPage({ user }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [existingComment, setExistingComment] = useState(null);

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'http://localhost:3001' 
    : 'http://localhost:3001';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const checkExistingComment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/check/${username}/${user.id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.hasComment) {
            setExistingComment(data.comment);
            setComment(data.comment.content);
            setRating(data.comment.rating);
            setIsEditing(true);
          }
        }
      } catch (err) {
        console.error('Błąd sprawdzania komentarza:', err);
      }
    };

    checkExistingComment();
  }, [user, navigate, username, API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError('Wybierz ocenę od 1 do 10 gwiazdek');
      return;
    }

    if (!comment.trim()) {
      setError('Napisz komentarz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        const response = await fetch(`${API_BASE_URL}/api/comments/${existingComment._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ comment, rating, userId: user.id })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Błąd podczas aktualizacji komentarza');
        }

        alert('Komentarz został zaktualizowany!');
      } else {
        const response = await fetch(`${API_BASE_URL}/api/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, comment, rating, userId: user.id })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Błąd podczas dodawania komentarza');
        }

        alert('Komentarz został dodany!');
      }

      navigate(`/search`);
    } catch (err) {
      console.error('Błąd:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="add-review-page">
      <div className="review-container">
        <div className="review-header">
          <h1>{isEditing ? 'Edytuj opinię' : 'Dodaj opinię'}</h1>
          <p>Oceń profil <strong>@{username}</strong></p>
          {isEditing && (
            <p className="edit-notice">Edytujesz swoją wcześniejszą opinię</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-section">
            <label>Oceń profil (1-10 gwiazdek):</label>
            <div className="star-rating">
              {[...Array(10)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`star ${(hoverRating || rating) >= starValue ? 'active' : ''}`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <p className="rating-text">Wybrana ocena: {rating}/10 gwiazdek</p>
            )}
          </div>

          <div className="comment-section">
            <label htmlFor="comment">Twój komentarz:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Opisz swoje doświadczenie z tym profilem..."
              rows="5"
              maxLength="500"
            />
            <div className="char-count">
              {comment.length}/500 znaków
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="btn-secondary"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !rating || !comment.trim()}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> {isEditing ? 'Aktualizowanie...' : 'Dodawanie...'}
                </>
              ) : (
                <>
                  <i className="fas fa-thumbs-up"></i> {isEditing ? 'Zaktualizuj opinię' : 'Dodaj opinię'}
                </>
              )}
            </button>
          </div>
        </form>
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