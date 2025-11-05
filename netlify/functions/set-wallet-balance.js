const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse, parseBody } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = parseBody(event);
    const { userId, amount, currency = 'USD' } = data;

    if (!userId || amount === undefined) {
      return createErrorResponse(400, 'userId and amount are required');
    }

    try {
      const { Wallet } = await getModels();

      const wallet = await Wallet.findOneAndUpdate(
        { user_id: userId, currency },
        { user_id: userId, balance: amount, currency, updated_at: new Date() },
        { upsert: true, new: true }
      );

      return createJsonResponse(200, {
        success: true,
        balance: wallet.balance,
        currency: currency,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error setting wallet balance:', error);
    return createErrorResponse(500, 'Failed to set wallet balance');
  }
};
