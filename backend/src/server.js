const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create app instance FIRST
const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS - allow both common Vite ports
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ login: 1 });

// User model
const User = mongoose.model('User', userSchema);

// Import routes AFTER database connection and models
try {
  const instagramRouter = require("./routes/instagram");
  app.use("/api/instagram", instagramRouter);
} catch (error) {
  console.error('Error loading Instagram routes:', error);
  // Continue without Instagram routes if there's an error
}

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { login: req.body.login });
    
    const { login, password } = req.body;
    
    if (!login?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
    login: { $regex: new RegExp(`^${req.body.login}$`, 'i') } 
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      login: login.trim().toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();

    console.log('User registered successfully:', newUser.login);

    return res.status(201).json({ 
      message: 'Registration successful',
      user: { id: newUser._id, login: newUser.login }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { login: req.body.login });
    
    const { login, password } = req.body;
    
    if (!login?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    // Find user by login
    const user = await User.findOne({ login: login.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', user.login);

    return res.status(200).json({ 
      message: 'Login successful',
      user: { id: user._id, login: user.login }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get all users endpoint (for testing/admin purposes)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'login createdAt').sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    mongo_uri: process.env.MONGO_URI ? 'configured' : 'not configured',
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
  console.log('Available endpoints:');
  console.log('POST /register - User registration');
  console.log('POST /login - User login');
  console.log('GET /users - Get all users');
  console.log('GET /health - Health check');
  console.log('GET /api/instagram/:username - Instagram profile data');
});