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
    const { buyerId, sellerId, productId, quantity, total } = data;

    if (!buyerId || !productId || !total) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'buyerId, productId, and total are required' }),
      };
    }

    try {
      const { Order } = await getModels();

      const newOrder = new Order({
        buyer_id: buyerId,
        seller_id: sellerId || null,
        product_id: productId,
        quantity: quantity || 1,
        total,
        status: 'pending',
        created_at: new Date(),
      });

      const savedOrder = await newOrder.save();

      return {
        statusCode: 201,
        body: JSON.stringify({
          id: savedOrder._id.toString(),
          buyer_id: savedOrder.buyer_id,
          product_id: savedOrder.product_id,
          quantity: savedOrder.quantity,
          total: savedOrder.total,
          status: savedOrder.status,
          created_at: savedOrder.created_at,
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
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create order' }),
    };
  }
};
