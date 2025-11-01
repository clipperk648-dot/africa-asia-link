const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = JSON.parse(event.body);
    const { userId, type, amount, currency = 'USD', note } = data;

    if (!userId || !type || !amount) {
      return createErrorResponse(400, 'userId, type, and amount are required');
    }

    if (!['deposit', 'payment'].includes(type)) {
      return createErrorResponse(400, 'type must be deposit or payment');
    }

    try {
      const { Transaction } = await getModels();

      const newTransaction = new Transaction({
        user_id: userId,
        type,
        amount,
        currency,
        note: note || null,
        created_at: new Date(),
      });

      const savedTransaction = await newTransaction.save();

      return createJsonResponse(201, {
        id: savedTransaction._id.toString(),
        type: savedTransaction.type,
        amount: savedTransaction.amount,
        currency: savedTransaction.currency,
        note: savedTransaction.note,
        created_at: savedTransaction.created_at,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    return createErrorResponse(500, 'Failed to add transaction');
  }
};
