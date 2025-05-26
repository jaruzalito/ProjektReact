const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Middleware CORS - zezwalamy na frontend na porcie 5173
app.use(cors({
  origin: 'http://localhost:5173',   // dopasuj do portu Twojego frontu
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Middleware do parsowania JSON
app.use(express.json());

// Połączenie z bazą MySQL (zmień parametry według swojego środowiska)
const pool = mysql.createPool({
  host: 'localhost',
  port: 3305, 
  user: 'root',
  password: '',    // uzupełnij jeśli masz hasło
  database: 'projectreact',
});

// Obsługa rejestracji użytkownika
app.post('/register', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Login i hasło są wymagane' });
  }

  try {
    // Sprawdź czy login jest zajęty
    const [rows] = await pool.query('SELECT * FROM users WHERE login = ?', [login]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Login zajęty' });
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Dodaj użytkownika do bazy
    await pool.query('INSERT INTO users (login, password) VALUES (?, ?)', [login, hashedPassword]);

    res.status(201).json({ message: 'Użytkownik zarejestrowany' });
  } catch (err) {
    console.error('Błąd podczas rejestracji:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Nasłuch na porcie 3000
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
