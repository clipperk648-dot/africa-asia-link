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

      return {
        statusCode: 200,
        body: JSON.stringify(conversations.map(c => ({
          id: c._id.toString(),
          sender_id: c.sender_id,
          recipient_id: c.recipient_id,
          content: c.content,
          media_url: c.media_url,
          created_at: c.created_at,
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
    console.error('Error fetching conversations:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch conversations' }),
    };
  }
};
