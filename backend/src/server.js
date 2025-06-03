const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: function (origin, callback) {
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

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();

const userSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

userSchema.index({ login: 1 });

const User = mongoose.model('User', userSchema);

const InstagramProfile = require('../models/InstagramProfile');

const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};


app.get('/api/instagram/recent', async (req, res) => {
  try {
    console.log('Fetching recent profiles...');
    
    const recentProfiles = await InstagramProfile.find({})
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('username followers following posts fullName bio avgRating createdAt updatedAt');
    
    console.log(`Found ${recentProfiles.length} recent profiles`);
    
    res.json({
      success: true,
      profiles: recentProfiles
    });
  } catch (error) {
    console.error('Error fetching recent profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent profiles'
    });
  }
});

try {
  const instagramRouter = require("./routes/instagram");
  app.use("/api/instagram", instagramRouter);
  console.log('Instagram routes loaded successfully');
} catch (error) {
  console.error('Error loading Instagram routes:', error);
}

try {
  const commentRoutes = require('./routes/comments');
  app.use('/api/comments', commentRoutes);
  console.log('Comment routes loaded successfully');
} catch (error) {
  console.error('Error loading comment routes:', error);
}

try {
  const ratingRoutes = require('./routes/ratings');
  app.use('/api/ratings', ratingRoutes);
  console.log('Rating routes loaded successfully');
} catch (error) {
  console.error('Error loading rating routes:', error);
}

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

    const existingUser = await User.findOne({ 
      login: { $regex: new RegExp(`^${req.body.login}$`, 'i') } 
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      login: login.trim().toLowerCase(),
      passwordHash: hashedPassword
    });

    await newUser.save();

    console.log('User registered successfully:', newUser.login);

    return res.status(201).json({ 
      message: 'Registration successful',
      user: { id: newUser._id, login: newUser.login }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { login: req.body.login });
    
    const { login, password } = req.body;
    
    if (!login?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const user = await User.findOne({ login: login.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, login: user.login },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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

app.get('/verify-token', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId, 'login');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: { id: user._id, login: user.login }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  return res.status(200).json({ message: 'Logout successful' });
});

app.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'login createdAt').sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    mongo_uri: process.env.MONGO_URI ? 'configured' : 'not configured',
    jwt_secret: process.env.JWT_SECRET ? 'configured' : 'not configured',
    port: PORT
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
  console.log('Available endpoints:');
  console.log('POST /register - User registration');
  console.log('POST /login - User login');
  console.log('POST /logout - User logout');
  console.log('GET /verify-token - Verify authentication');
  console.log('GET /users - Get all users (protected)');
  console.log('GET /health - Health check');
  console.log('GET /api/instagram/recent - Get recent profiles');
  console.log('GET /api/instagram/:username - Instagram profile data');
  console.log('GET /api/comments/:username - Get comments for user');
  console.log('POST /api/comments - Add new comment');
  console.log('POST /api/ratings - Add/update rating');
});
