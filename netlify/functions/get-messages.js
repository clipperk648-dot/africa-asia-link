const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, peerId } = event.queryStringParameters || {};

    if (!userId || !peerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId and peerId are required' }),
      };
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

      return {
        statusCode: 200,
        body: JSON.stringify(messages.map(m => ({
          id: m._id.toString(),
          sender_id: m.sender_id,
          recipient_id: m.recipient_id,
          content: m.content,
          media_url: m.media_url,
          created_at: m.created_at,
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
    console.error('Error fetching messages:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch messages' }),
    };
  }
};
