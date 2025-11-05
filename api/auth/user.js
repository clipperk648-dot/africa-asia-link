const { getModels } = require('../lib/mongodb');
const { sendError, sendSuccess, handleCors } = require('../lib/helpers');

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const { id } = req.query;

    if (!id) {
      return sendError(res, 400, 'User ID is required');
    }

    const { User } = await getModels();
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return sendError(res, 500, 'Failed to get user: ' + error.message);
  }
};
