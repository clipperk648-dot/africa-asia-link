const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

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
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = JSON.parse(event.body);
    const { token, role } = data;

    if (!token || !role) {
      return createErrorResponse(400, 'Token and role are required');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return createErrorResponse(400, 'Invalid role');
    }

    let payload;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    } catch (err) {
      console.error('Token decode error:', err);
      return createErrorResponse(401, 'Invalid token');
    }

    if (!payload.email) {
      return createErrorResponse(401, 'Invalid token payload');
    }

    try {
      const { User, Wallet } = await getModels();

      let user = await User.findOne({ email: payload.email.toLowerCase() });

      if (!user) {
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

        const wallet = new Wallet({
          user_id: user._id.toString(),
          balance: 0,
          currency: 'USD',
        });

        await wallet.save();
      } else {
        if (!user.oauth_id) {
          user.oauth_id = payload.sub;
          user.oauth_provider = 'google';
          user.updated_at = new Date();
          await user.save();
        }

        if (user.role !== role) {
          return createErrorResponse(403, `This account is registered as a ${user.role}. Please select the correct role.`);
        }
      }

      const sessionToken = createSessionToken(user);

      return createJsonResponse(200, {
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
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error: ' + dbError.message);
    }
  } catch (error) {
    console.error('Google auth error:', error);
    return createErrorResponse(500, 'Google authentication failed: ' + error.message);
  }
};
