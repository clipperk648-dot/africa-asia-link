const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { limit = '20' } = event.queryStringParameters || {};
    const limitNum = Math.min(parseInt(limit) || 20, 100);

    try {
      const { SocialPost } = await getModels();

      const posts = await SocialPost.find()
        .sort({ created_at: -1 })
        .limit(limitNum)
        .lean();

      return createJsonResponse(200, posts.map(p => ({
        id: p._id.toString(),
        user_id: p.user_id,
        username: p.username,
        avatar: p.avatar,
        type: p.type,
        content: p.content,
        media_url: p.media_url,
        likes: p.likes,
        comments: p.comments,
        created_at: p.created_at,
      })));
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return createErrorResponse(500, 'Failed to fetch posts');
  }
};
