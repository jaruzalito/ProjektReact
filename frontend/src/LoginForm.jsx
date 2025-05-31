import React, { useState, useEffect } from 'react';

const LoginForm = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/verify-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (onLogin) onLogin(data.user);
      }
    } catch (error) {
      console.log('No valid session found');
    } finally {
      setIsLoading(false);
    }
  };

  const LoginFormComponent = () => {
    const [formData, setFormData] = useState({
      login: '',
      password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');

      try {
        console.log('Sending login request:', {
          login: formData.login.trim(),
          passwordLength: formData.password.length
        });

        const response = await fetch('http://localhost:3001/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            login: formData.login.trim(),
            password: formData.password
          })
        });

        console.log('Login response status:', response.status);
        
        const data = await response.json();
        console.log('Login response data:', data);

        if (response.ok) {
          setMessage('Logowanie udane!');
          setMessageType('success');
          
          setUser(data.user);
          if (onLogin) onLogin(data.user);
          
          console.log('Zalogowany użytkownik:', data.user);
          
          setFormData({ login: '', password: '' });
          
        } else {
          if (response.status === 401) {
            setMessage('Nieprawidłowy login lub hasło');
          } else if (response.status === 429) {
            setMessage('Zbyt wiele prób logowania. Spróbuj ponownie później');
          } else {
            setMessage(data.error || data.message || 'Błąd logowania');
          }
          setMessageType('error');
        }
      } catch (error) {
        console.error('Login error:', error);
        setMessage('Błąd połączenia z serwerem. Sprawdź czy serwer działa na porcie 3001');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="form-container">
        <h2>Logowanie</h2>
        
        {message && (
          <div className={`message ${messageType}`} role={messageType === 'error' ? 'alert' : 'status'}>
            {message}
          </div>
        )}
        
        <div>
          <div className="form-group">
            <label htmlFor="login">Login:</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={20}
              placeholder="Wprowadź login"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Wprowadź hasło"
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </div>
        
        <p className="switch-form">
          Nie masz konta? 
          <button 
            type="button" 
            onClick={() => setCurrentView('register')}
            className="link-btn"
          >
            Zarejestruj się
          </button>
        </p>
      </div>
    );
  };

  const RegisterForm = () => {
    const [formData, setFormData] = useState({
      login: "",
      password: "",
      confirmPassword: ""
    });
    const [status, setStatus] = useState({ error: "", success: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setStatus({ error: "", success: "" });
      setLoading(true);

      if (formData.password !== formData.confirmPassword) {
        setStatus({ error: "Hasła się nie zgadzają", success: "" });
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setStatus({ error: "Hasło musi mieć co najmniej 6 znaków", success: "" });
        setLoading(false);
        return;
      }

      if (formData.login.trim().length < 3) {
        setStatus({ error: "Login musi mieć co najmniej 3 znaki", success: "" });
        setLoading(false);
        return;
      }

      try {
        console.log('Sending registration request:', {
          login: formData.login.trim(),
          passwordLength: formData.password.length
        });

        const response = await fetch("http://localhost:3001/register", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            login: formData.login.trim(),
            password: formData.password
          }),
          credentials: "include" 
        });

        console.log('Registration response status:', response.status);
        
        const data = await response.json();
        console.log('Registration response data:', data);

        if (response.ok) {
          setStatus({ 
            success: data.message || "Rejestracja zakończona pomyślnie!",
            error: "" 
          });
          setFormData({
            login: "",
            password: "",
            confirmPassword: ""
          });
        } else {
          if (response.status === 409) {
            setStatus({ error: "Użytkownik o takim loginie już istnieje", success: "" });
          } else if (response.status === 400) {
            setStatus({ error: data.message || "Nieprawidłowe dane", success: "" });
          } else {
            setStatus({ error: data.message || "Nie udało się zarejestrować", success: "" });
          }
        }
      } catch (err) {
        console.error("Registration error:", err);
        setStatus({
          error: "Błąd połączenia z serwerem. Sprawdź czy serwer działa na porcie 3001",
          success: ""
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="form-container">
        <h2>Rejestracja</h2>
        <div>
          <div className="form-group">
            <input
              type="text"
              name="login"
              placeholder="Login (3-20 znaków)"
              value={formData.login}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={20}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Hasło (min. 6 znaków)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Powtórz hasło"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={loading} 
            className="submit-btn"
          >
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
          
          {status.error && (
            <p className="message error" role="alert">
              {status.error}
            </p>
          )}
          {status.success && (
            <p className="message success" role="status">
              {status.success}
            </p>
          )}
        </div>
        
        <p className="switch-form">
          Masz już konto? 
          <button 
            type="button" 
            onClick={() => setCurrentView('login')}
            className="link-btn"
          >
            Zaloguj się
          </button>
        </p>
      </div>
    );
  };

  const Dashboard = () => {
    const handleLogout = async () => {
      try {
        await fetch('http://localhost:3001/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      setUser(null);
      setCurrentView('login');
      if (onLogin) onLogin(null);
    };

    return (
      <div className="form-container">
        <h2>Panel użytkownika</h2>
        <div className="user-info">
          <p>Witaj, <strong>{user?.login || user?.username}</strong>!</p>
          <p>Jesteś pomyślnie zalogowany.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="submit-btn logout-btn"
        >
          Wyloguj się
        </button>
      </div>
    );
  };

  // Pokazuj loader podczas sprawdzania stanu autoryzacji
  if (isLoading) {
    return (
      <div className="form-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Sprawdzanie sesji...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .form-container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #2c3e50;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          background: white;
          color: black;
        }

        input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .submit-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          transform: none;
        }

        .logout-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
        }

        .logout-btn:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        }

        .message {
          padding: 0.75rem;
          margin: 1rem 0;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 2px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 2px solid #f5c6cb;
        }

        .switch-form {
          text-align: center;
          margin-top: 1.5rem;
          color: #6c757d;
        }

        .link-btn {
          background: none;
          border: none;
          color: #3498db;
          cursor: pointer;
          text-decoration: underline;
          font-size: inherit;
          margin-left: 0.5rem;
        }

        .link-btn:hover {
          color: #2980b9;
        }

        .user-info {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .user-info p {
          margin: 0.5rem 0;
          color: #2c3e50;
        }
      `}</style>
      
      {user ? (
        <Dashboard />
      ) : currentView === 'login' ? (
        <LoginFormComponent />
      ) : (
        <RegisterForm />
      )}
    </div>
  );
};

export default LoginForm;