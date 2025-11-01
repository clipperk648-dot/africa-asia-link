const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = JSON.parse(event.body);
    const { userId, username, avatar, content, imageUrl, type = 'text' } = data;

    if (!userId || !content) {
      return createErrorResponse(400, 'userId and content are required');
    }

    try {
      const { SocialPost } = await getModels();

      const newPost = new SocialPost({
        user_id: userId,
        username: username || 'user',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        type: imageUrl ? 'image' : type,
        content,
        media_url: imageUrl || null,
        likes: 0,
        comments: 0,
        created_at: new Date(),
      });

      const savedPost = await newPost.save();

      return createJsonResponse(201, {
        id: savedPost._id.toString(),
        user_id: savedPost.user_id,
        username: savedPost.username,
        avatar: savedPost.avatar,
        type: savedPost.type,
        content: savedPost.content,
        media_url: savedPost.media_url,
        likes: savedPost.likes,
        comments: savedPost.comments,
        created_at: savedPost.created_at,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return createErrorResponse(500, 'Failed to create post');
  }
};
