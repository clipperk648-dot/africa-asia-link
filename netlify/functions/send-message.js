const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = JSON.parse(event.body);
    const { senderId, recipientId, content, mediaUrl } = data;

    if (!senderId || !recipientId) {
      return createErrorResponse(400, 'senderId and recipientId are required');
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

      return createJsonResponse(201, {
        id: savedMessage._id.toString(),
        sender_id: savedMessage.sender_id,
        recipient_id: savedMessage.recipient_id,
        content: savedMessage.content,
        media_url: savedMessage.media_url,
        created_at: savedMessage.created_at,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return createErrorResponse(500, 'Failed to send message');
  }
};
