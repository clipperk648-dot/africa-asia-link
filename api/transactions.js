const { getModels } = require('./lib/mongodb');
const { sendError, sendSuccess, handleCors } = require('./lib/helpers');

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (handleCors(req, res)) return;

  try {
    const { Transaction } = await getModels();

    if (req.method === 'GET') {
      const { user_id, limit = '20', offset = '0' } = req.query || {};

      if (!user_id) {
        return sendError(res, 400, 'User ID is required');
      }

      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      const transactions = await Transaction.find({ user_id })
        .sort({ created_at: -1 })
        .skip(offsetNum)
        .limit(limitNum)
        .lean();

      return sendSuccess(res, {
        transactions: transactions.map(t => ({
          id: t._id.toString(),
          user_id: t.user_id,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          note: t.note,
          created_at: t.created_at,
        })),
      });
    } else if (req.method === 'POST') {
      const { user_id, type, amount, currency, note } = req.body || {};

      if (!user_id || !type || !amount) {
        return sendError(res, 400, 'Missing required fields: user_id, type, and amount');
      }

      if (!['deposit', 'payment'].includes(type)) {
        return sendError(res, 400, 'Invalid transaction type');
      }

      const transaction = new Transaction({
        user_id,
        type,
        amount,
        currency: currency || 'USD',
        note: note || '',
      });

      await transaction.save();

      return sendSuccess(res, {
        success: true,
        transaction: {
          id: transaction._id.toString(),
          user_id: transaction.user_id,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          note: transaction.note,
          created_at: transaction.created_at,
        },
      }, 201);
    } else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Transactions endpoint error:', error);
    return sendError(res, 500, 'Failed to process request: ' + error.message);
  }
};
