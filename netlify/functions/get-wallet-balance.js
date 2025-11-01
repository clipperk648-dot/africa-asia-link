const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { userId, currency = 'USD' } = event.queryStringParameters || {};

    if (!userId) {
      return createErrorResponse(400, 'userId is required');
    }

    try {
      const { Wallet } = await getModels();

      let wallet = await Wallet.findOne({ user_id: userId, currency }).lean();

      if (!wallet) {
        wallet = { user_id: userId, balance: 0, currency };
      }

      return createJsonResponse(200, {
        balance: wallet.balance || 0,
        currency: currency,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return createErrorResponse(500, 'Failed to fetch wallet balance');
  }
};
