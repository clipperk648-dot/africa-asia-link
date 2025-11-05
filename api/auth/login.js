import { getModels } from '../lib/mongodb.js';
import { sendError, sendSuccess, handleCors } from '../lib/helpers.js';
import { verifyPassword, createSessionToken } from '../lib/auth.js';

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
    const { email, password, role } = req.body || {};

    if (!email || !password || !role) {
      return sendError(res, 400, 'Missing required fields: email, password, and role');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return sendError(res, 400, 'Invalid role: must be "industry" or "buyer"');
    }

    const { User } = await getModels();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Verify role matches
    if (user.role !== role) {
      return sendError(res, 403, `This account is registered as a ${user.role}. Please select the correct role.`);
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return sendError(res, 401, 'Invalid credentials');
    }

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
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Login failed: ' + error.message);
  }
};
