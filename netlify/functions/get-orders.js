const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { userId } = event.queryStringParameters || {};

    if (!userId) {
      return createErrorResponse(400, 'userId is required');
    }

    try {
      const { Order } = await getModels();

      const orders = await Order.find({ buyer_id: userId }).lean();

      return createJsonResponse(200, orders.map(o => ({
        id: o._id.toString(),
        buyer_id: o.buyer_id,
        product_id: o.product_id,
        quantity: o.quantity,
        total: o.total,
        status: o.status,
        created_at: o.created_at,
      })));
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return createErrorResponse(500, 'Failed to fetch orders');
  }
};
