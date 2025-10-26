const { getConnection } = require('./db-connection');

exports.handler = async (event, context) => {
  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    try {
      const sql = getConnection();
      const orders = await sql`
        SELECT * FROM orders
        WHERE buyer_id = ${userId} OR seller_id = ${userId}
        ORDER BY created_at DESC
      `;

      return {
        statusCode: 200,
        body: JSON.stringify(orders),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30',
        },
      };
    } catch (dbError) {
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error' }),
      };
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch orders' }),
    };
  }
};
