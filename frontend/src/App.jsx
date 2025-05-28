import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InstagramProfileFetcher from './InstagramProfileFetcher';  // import komponentu

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Strona główna</Link>
        <Link to="/login" style={{ marginRight: "1rem" }}>Logowanie</Link>
        <Link to="/instagram-checker">Instagram Checker</Link>  {/* nowy link */}
      </nav>

      <Routes>
        <Route path="/" element={<h1>Strona Główna</h1>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/instagram-checker" element={<InstagramProfileFetcher />} /> {/* nowa trasa */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;