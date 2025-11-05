import { getModels } from '../lib/mongodb.js';
import { sendError, sendSuccess, handleCors } from '../lib/helpers.js';
import { hashPassword, createSessionToken } from '../lib/auth.js';

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const { email, password, name, phone, role } = req.body || {};

    if (!email || !password || !name || !role) {
      return sendError(res, 400, 'Missing required fields: email, password, name, and role');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return sendError(res, 400, 'Invalid role: must be "industry" or "buyer"');
    }

    const { User, Wallet } = await getModels();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 409, 'Email already registered');
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      name,
      phone: phone || '',
      role,
    });

    await user.save();

    // Create wallet for new user
    const wallet = new Wallet({
      user_id: user._id.toString(),
      balance: 0,
      currency: 'USD',
    });

    await wallet.save();

    const token = createSessionToken(user);

    return sendSuccess(res, {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 500, 'Registration failed: ' + error.message);
  }
};
