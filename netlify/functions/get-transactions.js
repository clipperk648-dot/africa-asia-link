const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId is required' }),
      };
    }

    try {
      const { Transaction } = await getModels();

      const transactions = await Transaction.find({ user_id: userId })
        .sort({ created_at: -1 })
        .lean();

      return {
        statusCode: 200,
        body: JSON.stringify(transactions.map(t => ({
          id: t._id.toString(),
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          note: t.note,
          created_at: t.created_at,
        }))),
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
    console.error('Error fetching transactions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch transactions' }),
    };
  }
};
