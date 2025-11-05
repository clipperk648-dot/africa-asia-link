const { getModels } = require('./lib/mongodb');
const { sendError, sendSuccess, handleCors } = require('./lib/helpers');

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (handleCors(req, res)) return;

  try {
    const { Order } = await getModels();

    if (req.method === 'GET') {
      const { buyer_id, seller_id, limit = '20', offset = '0' } = req.query || {};
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      const query = {};
      if (buyer_id) query.buyer_id = buyer_id;
      if (seller_id) query.seller_id = seller_id;

      const orders = await Order.find(query)
        .skip(offsetNum)
        .limit(limitNum)
        .lean();

      return sendSuccess(res, {
        orders: orders.map(o => ({
          id: o._id.toString(),
          buyer_id: o.buyer_id,
          seller_id: o.seller_id,
          product_id: o.product_id,
          quantity: o.quantity,
          total: o.total,
          status: o.status,
          created_at: o.created_at,
        })),
      });
    } else if (req.method === 'POST') {
      const { buyer_id, seller_id, product_id, quantity, total } = req.body || {};

      if (!buyer_id || !seller_id || !product_id || !total) {
        return sendError(res, 400, 'Missing required fields');
      }

      const order = new Order({
        buyer_id,
        seller_id,
        product_id,
        quantity: quantity || 1,
        total,
        status: 'pending',
      });

      await order.save();

      return sendSuccess(res, {
        success: true,
        order: {
          id: order._id.toString(),
          buyer_id: order.buyer_id,
          seller_id: order.seller_id,
          product_id: order.product_id,
          quantity: order.quantity,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
        },
      }, 201);
    } else if (req.method === 'PUT') {
      const { id, status } = req.body || {};

      if (!id || !status) {
        return sendError(res, 400, 'Missing required fields: id and status');
      }

      const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return sendError(res, 400, 'Invalid status');
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status, updated_at: new Date() },
        { new: true }
      );

      if (!order) {
        return sendError(res, 404, 'Order not found');
      }

      return sendSuccess(res, {
        success: true,
        order: {
          id: order._id.toString(),
          buyer_id: order.buyer_id,
          seller_id: order.seller_id,
          product_id: order.product_id,
          quantity: order.quantity,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
        },
      });
    } else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Orders endpoint error:', error);
    return sendError(res, 500, 'Failed to process request: ' + error.message);
  }
};
