const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { id, email } = event.queryStringParameters || {};

    if (!id && !email) {
      return createErrorResponse(400, 'Either id or email is required');
    }

    try {
      const { User } = await getModels();

      let user;
      if (id) {
        user = await User.findById(id).lean();
      } else if (email) {
        user = await User.findOne({ email }).lean();
      }

      if (!user) {
        return createErrorResponse(404, 'User not found');
      }

      return createJsonResponse(200, {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          created_at: user.created_at,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return createErrorResponse(500, 'Failed to fetch user');
  }
};
