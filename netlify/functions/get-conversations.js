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
      const { Message } = await getModels();

      const messages = await Message.find({
        $or: [{ sender_id: userId }, { recipient_id: userId }],
      }).lean();

      const conversationMap = new Map();

      messages.forEach(msg => {
        const peerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
        if (!conversationMap.has(peerId)) {
          conversationMap.set(peerId, msg);
        }
      });

      const conversations = Array.from(conversationMap.values());

      return createJsonResponse(200, conversations.map(c => ({
        id: c._id.toString(),
        sender_id: c.sender_id,
        recipient_id: c.recipient_id,
        content: c.content,
        media_url: c.media_url,
        created_at: c.created_at,
      })));
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return createErrorResponse(500, 'Failed to fetch conversations');
  }
};
