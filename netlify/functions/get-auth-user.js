const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { id } = event.queryStringParameters || {};

    if (!id) {
      return createErrorResponse(400, 'User ID is required');
    }

    try {
      const { User } = await getModels();

      const user = await User.findById(id);

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
      return createErrorResponse(500, 'Database error: ' + dbError.message);
    }
  } catch (error) {
    console.error('Get user error:', error);
    return createErrorResponse(500, 'Failed to get user: ' + error.message);
  }
};
