const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { senderId, recipientId, content, mediaUrl } = data;

    if (!senderId || !recipientId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'senderId and recipientId are required' }),
      };
    }

    try {
      const { Message } = await getModels();

      const newMessage = new Message({
        sender_id: senderId,
        recipient_id: recipientId,
        content: content || null,
        media_url: mediaUrl || null,
        created_at: new Date(),
      });

      const savedMessage = await newMessage.save();

      return {
        statusCode: 201,
        body: JSON.stringify({
          id: savedMessage._id.toString(),
          sender_id: savedMessage.sender_id,
          recipient_id: savedMessage.recipient_id,
          content: savedMessage.content,
          media_url: savedMessage.media_url,
          created_at: savedMessage.created_at,
        }),
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
    console.error('Error sending message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message' }),
    };
  }
};
