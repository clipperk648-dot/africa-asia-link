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
    const { userId, amount, currency = 'USD' } = data;

    if (!userId || amount === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId and amount are required' }),
      };
    }

    try {
      const { Wallet } = await getModels();

      const wallet = await Wallet.findOneAndUpdate(
        { user_id: userId, currency },
        { user_id: userId, balance: amount, currency, updated_at: new Date() },
        { upsert: true, new: true }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          balance: wallet.balance,
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
    console.error('Error setting wallet balance:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to set wallet balance' }),
    };
  }
};
