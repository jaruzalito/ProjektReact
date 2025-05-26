import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Strona główna</Link>
        <Link to="/register" style={{ marginRight: "1rem" }}>Rejestracja</Link>
        <Link to="/login">Logowanie</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Strona Główna</h1>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;