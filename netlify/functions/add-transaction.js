const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { userId, type, amount, currency = 'USD', note } = data;

    if (!userId || !type || !amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId, type, and amount are required' }),
      };
    }

    if (!['deposit', 'payment'].includes(type)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'type must be deposit or payment' }),
      };
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

      return {
        statusCode: 201,
        body: JSON.stringify({
          id: savedTransaction._id.toString(),
          type: savedTransaction.type,
          amount: savedTransaction.amount,
          currency: savedTransaction.currency,
          note: savedTransaction.note,
          created_at: savedTransaction.created_at,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (dbError) {
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error' }),
      };
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to add transaction' }),
    };
  }
};
