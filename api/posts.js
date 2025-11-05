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
    const { SocialPost } = await getModels();

    if (req.method === 'GET') {
      const { limit = '20', offset = '0' } = req.query || {};
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      const posts = await SocialPost.find()
        .sort({ created_at: -1 })
        .skip(offsetNum)
        .limit(limitNum)
        .lean();

      return sendSuccess(res, {
        posts: posts.map(p => ({
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
        })),
      });
    } else if (req.method === 'POST') {
      const { user_id, username, avatar, type, content, media_url } = req.body || {};

      if (!user_id || !content) {
        return sendError(res, 400, 'Missing required fields: user_id and content');
      }

      const post = new SocialPost({
        user_id,
        username,
        avatar,
        type: type || 'text',
        content,
        media_url,
        likes: 0,
        comments: 0,
      });

      await post.save();

      return sendSuccess(res, {
        success: true,
        post: {
          id: post._id.toString(),
          user_id: post.user_id,
          username: post.username,
          avatar: post.avatar,
          type: post.type,
          content: post.content,
          media_url: post.media_url,
          likes: post.likes,
          comments: post.comments,
          created_at: post.created_at,
        },
      }, 201);
    } else if (req.method === 'PUT') {
      const { id, likes, comments } = req.body || {};

      if (!id) {
        return sendError(res, 400, 'Post ID is required');
      }

      const updateData = { updated_at: new Date() };
      if (likes !== undefined) updateData.likes = likes;
      if (comments !== undefined) updateData.comments = comments;

      const post = await SocialPost.findByIdAndUpdate(id, updateData, { new: true });

      if (!post) {
        return sendError(res, 404, 'Post not found');
      }

      return sendSuccess(res, {
        success: true,
        post: {
          id: post._id.toString(),
          user_id: post.user_id,
          username: post.username,
          avatar: post.avatar,
          type: post.type,
          content: post.content,
          media_url: post.media_url,
          likes: post.likes,
          comments: post.comments,
          created_at: post.created_at,
        },
      });
    } else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Posts endpoint error:', error);
    return sendError(res, 500, 'Failed to process request: ' + error.message);
  }
};
