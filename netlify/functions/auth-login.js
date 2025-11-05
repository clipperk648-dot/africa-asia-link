const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');
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
    const { email, password, role } = data;

    if (!email || !password || !role) {
      return createErrorResponse(400, 'Email, password, and role are required');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return createErrorResponse(400, 'Invalid role');
    }

    try {
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
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error: ' + dbError.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse(500, 'Login failed: ' + error.message);
  }
};
