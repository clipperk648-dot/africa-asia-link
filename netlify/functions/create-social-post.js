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
    const { userId, username, avatar, content, imageUrl, type = 'text' } = data;

    if (!userId || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId and content are required' }),
      };
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

      return {
        statusCode: 201,
        body: JSON.stringify({
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
    console.error('Error creating post:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create post' }),
    };
  }
};
