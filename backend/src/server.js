const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'projectreact',
  waitForConnections: true,
  connectionLimit: 10
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE login = ? LIMIT 1', 
      [login.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.execute(
      'INSERT INTO users (login, password) VALUES (?, ?)',
      [login.trim(), hashedPassword]
    );

    return res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const [users] = await pool.execute(
      'SELECT id, login, password FROM users WHERE login = ? LIMIT 1',
      [login.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ 
      message: 'Login successful',
      user: { id: user.id, login: user.login }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler - musi być na końcu
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('POST /register - User registration');
  console.log('POST /login - User login');
  console.log('GET /health - Health check');
});