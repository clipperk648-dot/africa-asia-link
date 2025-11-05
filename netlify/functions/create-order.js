const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse, parseBody } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = parseBody(event);
    const { buyerId, sellerId, productId, quantity, total } = data;

    if (!buyerId || !productId || !total) {
      return createErrorResponse(400, 'buyerId, productId, and total are required');
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

      return createJsonResponse(201, {
        id: savedOrder._id.toString(),
        buyer_id: savedOrder.buyer_id,
        product_id: savedOrder.product_id,
        quantity: savedOrder.quantity,
        total: savedOrder.total,
        status: savedOrder.status,
        created_at: savedOrder.created_at,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return createErrorResponse(500, 'Failed to create order');
  }
};
