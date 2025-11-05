const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');
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

const parseBody = (event) => {
  let body = event.body;

  if (!body) {
    throw new Error('Request body is empty');
  }

  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString('utf-8');
  }

  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  return body;
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = parseBody(event);
    const { email, password, name, phone, role } = data;

    if (!email || !password || !name || !role) {
      return createErrorResponse(400, 'Missing required fields');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return createErrorResponse(400, 'Invalid role');
    }

    try {
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
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error: ' + dbError.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse(500, 'Registration failed: ' + error.message);
  }
};
