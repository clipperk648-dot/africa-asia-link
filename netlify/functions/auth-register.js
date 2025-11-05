const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse, parseBody } = require('./response-helper');
const crypto = require('crypto');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'echina_salt').digest('hex');
};

const createSessionToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    let data;
    try {
      data = parseBody(event);
    } catch (parseErr) {
      console.error('Body parse error:', parseErr);
      return createErrorResponse(400, 'Invalid request body');
    }

    const { email, password, name, phone, role } = data || {};

    if (!email || !password || !name || !role) {
      return createErrorResponse(400, 'Missing required fields');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return createErrorResponse(400, 'Invalid role');
    }

    const { User, Wallet } = await getModels();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return createErrorResponse(409, 'Email already registered');
    }

    const user = new User({
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      name,
      phone: phone || '',
      role,
    });

    await user.save();

    const wallet = new Wallet({
      user_id: user._id.toString(),
      balance: 0,
      currency: 'USD',
    });

    await wallet.save();

    const token = createSessionToken(user);

    return createJsonResponse(201, {
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
    console.error('Registration error:', error);
    return createErrorResponse(500, 'Registration failed: ' + (error.message || 'Unknown error'));
  }
};
