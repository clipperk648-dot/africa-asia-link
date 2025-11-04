const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');
const crypto = require('crypto');

// Simple password hashing (in production use bcrypt)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'echina_salt').digest('hex');
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = JSON.parse(event.body);
    const { email, password, role } = data;

    if (!email || !password || !role) {
      return createErrorResponse(400, 'Email, password, and role are required');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return createErrorResponse(400, 'Invalid role');
    }

    try {
      const { User } = await getModels();

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return createErrorResponse(401, 'Invalid credentials');
      }

      // Verify role matches
      if (user.role !== role) {
        return createErrorResponse(403, `This account is registered as a ${user.role}. Please select the correct role.`);
      }

      // Verify password
      const isValid = verifyPassword(password, user.password_hash);

      if (!isValid) {
        return createErrorResponse(401, 'Invalid credentials');
      }

      // Create session token
      const sessionToken = Buffer.from(
        JSON.stringify({
          userId: user._id.toString(),
          email: user.email,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
        })
      ).toString('base64');

      return createJsonResponse(200, {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        },
        token: sessionToken,
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
