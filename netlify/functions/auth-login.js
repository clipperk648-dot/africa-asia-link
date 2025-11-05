const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse, parseBody } = require('./response-helper');
const crypto = require('crypto');

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

    const { email, password, role } = data || {};

    if (!email || !password || !role) {
      return createErrorResponse(400, 'Email, password, and role are required');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return createErrorResponse(400, 'Invalid role');
    }

    const { User } = await getModels();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return createErrorResponse(401, 'Invalid credentials');
    }

    if (user.role !== role) {
      return createErrorResponse(403, `This account is registered as a ${user.role}. Please select the correct role.`);
    }

    const isValid = verifyPassword(password, user.password_hash);

    if (!isValid) {
      return createErrorResponse(401, 'Invalid credentials');
    }

    const token = createSessionToken(user);

    return createJsonResponse(200, {
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
    console.error('Login handler error:', error);
    return createErrorResponse(500, 'Login failed: ' + (error.message || 'Unknown error'));
  }
};
