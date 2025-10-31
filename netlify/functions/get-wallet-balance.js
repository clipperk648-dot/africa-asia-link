const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, currency = 'USD' } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId is required' }),
      };
    }

    try {
      const { Wallet } = await getModels();

      let wallet = await Wallet.findOne({ user_id: userId, currency }).lean();

      if (!wallet) {
        wallet = { user_id: userId, balance: 0, currency };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          balance: wallet.balance || 0,
          currency: currency,
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
    console.error('Error fetching wallet balance:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch wallet balance' }),
    };
  }
};
