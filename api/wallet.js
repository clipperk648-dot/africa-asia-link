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
    const { Wallet } = await getModels();

    if (req.method === 'GET') {
      const { user_id } = req.query || {};

      if (!user_id) {
        return sendError(res, 400, 'User ID is required');
      }

      const wallet = await Wallet.findOne({ user_id });

      if (!wallet) {
        return sendError(res, 404, 'Wallet not found');
      }

      return sendSuccess(res, {
        wallet: {
          user_id: wallet.user_id,
          balance: wallet.balance,
          currency: wallet.currency,
          updated_at: wallet.updated_at,
        },
      });
    } else if (req.method === 'PUT') {
      const { user_id, balance } = req.body || {};

      if (!user_id || balance === undefined) {
        return sendError(res, 400, 'Missing required fields: user_id and balance');
      }

      if (typeof balance !== 'number' || balance < 0) {
        return sendError(res, 400, 'Balance must be a non-negative number');
      }

      const wallet = await Wallet.findOneAndUpdate(
        { user_id },
        { balance, updated_at: new Date() },
        { new: true, upsert: true }
      );

      return sendSuccess(res, {
        success: true,
        wallet: {
          user_id: wallet.user_id,
          balance: wallet.balance,
          currency: wallet.currency,
          updated_at: wallet.updated_at,
        },
      });
    } else if (req.method === 'POST') {
      const { user_id, balance, currency } = req.body || {};

      if (!user_id || balance === undefined) {
        return sendError(res, 400, 'Missing required fields: user_id and balance');
      }

      // Check if wallet already exists
      const existingWallet = await Wallet.findOne({ user_id });
      if (existingWallet) {
        return sendError(res, 409, 'Wallet already exists for this user');
      }

      const wallet = new Wallet({
        user_id,
        balance,
        currency: currency || 'USD',
      });

      await wallet.save();

      return sendSuccess(res, {
        success: true,
        wallet: {
          user_id: wallet.user_id,
          balance: wallet.balance,
          currency: wallet.currency,
          updated_at: wallet.updated_at,
        },
      }, 201);
    } else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Wallet endpoint error:', error);
    return sendError(res, 500, 'Failed to process request: ' + error.message);
  }
};
