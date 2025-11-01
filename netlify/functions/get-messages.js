const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { userId, peerId } = event.queryStringParameters || {};

    if (!userId || !peerId) {
      return createErrorResponse(400, 'userId and peerId are required');
    }

    try {
      const { Message } = await getModels();

      const messages = await Message.find({
        $or: [
          { sender_id: userId, recipient_id: peerId },
          { sender_id: peerId, recipient_id: userId },
        ],
      })
        .sort({ created_at: 1 })
        .lean();

      return createJsonResponse(200, messages.map(m => ({
        id: m._id.toString(),
        sender_id: m.sender_id,
        recipient_id: m.recipient_id,
        content: m.content,
        media_url: m.media_url,
        created_at: m.created_at,
      })));
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return createErrorResponse(500, 'Failed to fetch messages');
  }
};
