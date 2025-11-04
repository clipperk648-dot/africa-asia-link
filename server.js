import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
})
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['industry', 'buyer'], required: true },
  oauth_id: { type: String, default: null },
  oauth_provider: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Wallet Schema
const walletSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  updated_at: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Wallet = mongoose.model('Wallet', walletSchema);

// Helper functions
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'echina_salt').digest('hex');
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

const createSessionToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['industry', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      name,
      phone: phone || '',
      role,
    });

    await user.save();

    // Create wallet
    const wallet = new Wallet({
      user_id: user._id.toString(),
      balance: 0,
      currency: 'USD',
    });

    await wallet.save();

    const token = createSessionToken(user);

    res.status(201).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['industry', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify role
    if (user.role !== role) {
      return res.status(403).json({
        error: `This account is registered as a ${user.role}. Please select the correct role.`,
      });
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createSessionToken(user);

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Google OAuth
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token || !role) {
      return res.status(400).json({ error: 'Token and role are required' });
    }

    if (!['industry', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Decode Google token (basic decoding, production should verify signature)
    let payload;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    } catch (err) {
      console.error('Token decode error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!payload.email) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      // Create new user
      user = new User({
        email: payload.email.toLowerCase(),
        password_hash: `google_${payload.sub}`,
        name: payload.name || payload.email.split('@')[0],
        phone: '',
        role,
        oauth_id: payload.sub,
        oauth_provider: 'google',
      });

      await user.save();

      // Create wallet
      const wallet = new Wallet({
        user_id: user._id.toString(),
        balance: 0,
        currency: 'USD',
      });

      await wallet.save();
    } else {
      // Update OAuth info if not set
      if (!user.oauth_id) {
        user.oauth_id = payload.sub;
        user.oauth_provider = 'google';
        user.updated_at = new Date();
        await user.save();
      }

      // Verify role
      if (user.role !== role) {
        return res.status(403).json({
          error: `This account is registered as a ${user.role}. Please select the correct role.`,
        });
      }
    }

    const sessionToken = createSessionToken(user);

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        oauth_provider: 'google',
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed: ' + error.message });
  }
});

// Get user by ID
app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user: ' + error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// In production, serve index.html for non-API routes (React Router fallback)
if (NODE_ENV === 'production') {
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In development, return 404 for non-API routes
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  if (NODE_ENV === 'production') {
    console.log(`📄 Serving frontend from ${PORT}`);
  }
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/auth/register - Register new user`);
  console.log(`  POST /api/auth/login - Login with email/password`);
  console.log(`  POST /api/auth/google - Login with Google OAuth`);
  console.log(`  GET  /api/auth/user/:id - Get user by ID`);
  console.log(`\n`);
});
