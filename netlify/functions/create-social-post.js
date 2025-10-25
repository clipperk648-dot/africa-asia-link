const { getConnection } = require('./db-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { userId, content, imageUrl } = data;

    if (!userId || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID and content are required' }),
      };
    }

    try {
      const sql = getConnection();
      const result = await sql`
        INSERT INTO social_posts (user_id, content, image_url, created_at)
        VALUES (${userId}, ${content}, ${imageUrl || null}, NOW())
        RETURNING *
      `;

      return {
        statusCode: 201,
        body: JSON.stringify(result[0]),
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
    console.error('Error creating social post:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create social post' }),
    };
  }
};
