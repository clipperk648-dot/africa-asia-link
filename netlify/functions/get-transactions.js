const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { userId } = event.queryStringParameters || {};

    if (!userId) {
      return createErrorResponse(400, 'userId is required');
    }

    try {
      const { Transaction } = await getModels();

      const transactions = await Transaction.find({ user_id: userId })
        .sort({ created_at: -1 })
        .lean();

      return createJsonResponse(200, transactions.map(t => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        note: t.note,
        created_at: t.created_at,
      })));
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return createErrorResponse(500, 'Failed to fetch transactions');
  }
};
