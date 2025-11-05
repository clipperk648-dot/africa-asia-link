const { getModels } = require('../lib/mongodb');
const { sendError, sendSuccess, handleCors } = require('../lib/helpers');
const { createSessionToken, parseGoogleToken } = require('../lib/auth');

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
    const { token, role } = req.body || {};

    if (!token || !role) {
      return sendError(res, 400, 'Missing required fields: token and role');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return sendError(res, 400, 'Invalid role: must be "industry" or "buyer"');
    }

    // Decode and parse Google token
    let payload;
    try {
      payload = parseGoogleToken(token);
    } catch (err) {
      return sendError(res, 401, err.message);
    }

    if (!payload.email) {
      return sendError(res, 401, 'Invalid token payload: missing email');
    }

    const { User, Wallet } = await getModels();

    // Find or create user
    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      // Create new user for first-time Google login
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

      // Create wallet for new user
      const wallet = new Wallet({
        user_id: user._id.toString(),
        balance: 0,
        currency: 'USD',
      });

      await wallet.save();
    } else {
      // Update OAuth info if not already set
      if (!user.oauth_id) {
        user.oauth_id = payload.sub;
        user.oauth_provider = 'google';
        user.updated_at = new Date();
        await user.save();
      }

      // Verify role matches
      if (user.role !== role) {
        return sendError(res, 403, `This account is registered as a ${user.role}. Please select the correct role.`);
      }
    }

    const sessionToken = createSessionToken(user);

    return sendSuccess(res, {
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
    return sendError(res, 500, 'Google authentication failed: ' + error.message);
  }
};
