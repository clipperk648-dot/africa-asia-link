const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse, parseBody } = require('./response-helper');
const crypto = require('crypto');

// Google OAuth2 verification - you would typically use the google-auth-library
// For now, we'll create a basic implementation that verifies the token structure
const verifyGoogleToken = async (token) => {
  try {
    // In production, use: const {OAuth2Client} = require('google-auth-library');
    // This is a simplified version for development
    // The token format is: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // In production, verify the signature using the public keys from Google
    // For development, we'll just validate the basic structure
    if (!payload.email || !payload.sub) {
      throw new Error('Invalid token payload');
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = parseBody(event);
    const { token, role } = data;

    if (!token || !role) {
      return createErrorResponse(400, 'Token and role are required');
    }

    if (!['industry', 'buyer'].includes(role)) {
      return createErrorResponse(400, 'Invalid role');
    }

    // Verify the Google token
    const payload = await verifyGoogleToken(token);

    try {
      const { User, Wallet } = await getModels();

      // Check if user exists
      let user = await User.findOne({ email: payload.email });

      if (!user) {
        // Create new user
        const newUser = new User({
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          phone: '',
          role,
          password_hash: `google_${payload.sub}`, // Mark as OAuth user
          created_at: new Date(),
          updated_at: new Date(),
          oauth_id: payload.sub,
          oauth_provider: 'google',
        });

        user = await newUser.save();

        // Create wallet for new user
        const wallet = new Wallet({
          user_id: user._id.toString(),
          balance: 0,
          currency: 'USD',
          updated_at: new Date(),
        });

        await wallet.save();
      } else {
        // Update user's OAuth info if not already set
        if (!user.oauth_id) {
          user.oauth_id = payload.sub;
          user.oauth_provider = 'google';
          user.updated_at = new Date();
          user = await user.save();
        }

        // Verify role matches
        if (user.role !== role) {
          return createErrorResponse(403, `This account is registered as a ${user.role}. Please select the correct role.`);
        }
      }

      // Create session token (simple JWT-like)
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
    console.error('Google auth error:', error);
    return createErrorResponse(500, 'Authentication failed: ' + error.message);
  }
};
