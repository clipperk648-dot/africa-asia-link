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
      const { Order } = await getModels();

      const orders = await Order.find({ buyer_id: userId }).lean();

      return {
        statusCode: 200,
        body: JSON.stringify(orders.map(o => ({
          id: o._id.toString(),
          buyer_id: o.buyer_id,
          product_id: o.product_id,
          quantity: o.quantity,
          total: o.total,
          status: o.status,
          created_at: o.created_at,
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
    console.error('Error fetching orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch orders' }),
    };
  }
};
