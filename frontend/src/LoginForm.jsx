import React, { useState } from 'react';

const LoginForm = () => {
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
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Logowanie udane!');
        setMessageType('success');
        
        // Zapisz dane użytkownika (opcjonalnie w localStorage)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Przekieruj użytkownika lub zaktualizuj stan aplikacji
        console.log('Zalogowany użytkownik:', data.user);
        
        // Opcjonalnie: przekierowanie po udanym logowaniu
        // window.location.href = '/dashboard';
        
      } else {
        setMessage(data.error || 'Błąd logowania');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Błąd połączenia z serwerem');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const formStyle = {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: loading ? '#ccc' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '1rem'
  };

  const messageStyle = {
    padding: '0.75rem',
    margin: '1rem 0',
    borderRadius: '4px',
    textAlign: 'center',
    backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
    color: messageType === 'success' ? '#155724' : '#721c24',
    border: messageType === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
  };

  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Logowanie</h2>
      
      {message && <div style={messageStyle}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login">Login:</label>
          <input
            type="text"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="Wprowadź login"
          />
        </div>

        <div>
          <label htmlFor="password">Hasło:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="Wprowadź hasło"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Nie masz konta? <a href="/register">Zarejestruj się</a>
      </p>
    </div>
  );
};

export default LoginForm;