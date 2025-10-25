const { getConnection } = require('./db-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { buyerId, sellerId, productId, quantity, total } = data;

    if (!buyerId || !sellerId || !productId || !quantity || !total) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required' }),
      };
    }

    try {
      const sql = getConnection();
      const result = await sql`
        INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total, status, created_at)
        VALUES (${buyerId}, ${sellerId}, ${productId}, ${quantity}, ${total}, 'pending', NOW())
        RETURNING *
      `;

      return {
        statusCode: 201,
        body: JSON.stringify(result[0]),
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
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create order' }),
    };
  }
};
