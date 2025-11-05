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
    const { Message } = await getModels();

    if (req.method === 'GET') {
      const { sender_id, recipient_id, limit = '20', offset = '0' } = req.query || {};

      if (!sender_id || !recipient_id) {
        return sendError(res, 400, 'Both sender_id and recipient_id are required');
      }

      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      const messages = await Message.find({
        $or: [
          { sender_id, recipient_id },
          { sender_id: recipient_id, recipient_id: sender_id },
        ],
      })
        .sort({ created_at: 1 })
        .skip(offsetNum)
        .limit(limitNum)
        .lean();

      return sendSuccess(res, {
        messages: messages.map(m => ({
          id: m._id.toString(),
          sender_id: m.sender_id,
          recipient_id: m.recipient_id,
          content: m.content,
          media_url: m.media_url,
          created_at: m.created_at,
        })),
      });
    } else if (req.method === 'POST') {
      const { sender_id, recipient_id, content, media_url } = req.body || {};

      if (!sender_id || !recipient_id || !content) {
        return sendError(res, 400, 'Missing required fields: sender_id, recipient_id, and content');
      }

      const message = new Message({
        sender_id,
        recipient_id,
        content,
        media_url,
      });

      await message.save();

      return sendSuccess(res, {
        success: true,
        message: {
          id: message._id.toString(),
          sender_id: message.sender_id,
          recipient_id: message.recipient_id,
          content: message.content,
          media_url: message.media_url,
          created_at: message.created_at,
        },
      }, 201);
    } else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Messages endpoint error:', error);
    return sendError(res, 500, 'Failed to process request: ' + error.message);
  }
};
