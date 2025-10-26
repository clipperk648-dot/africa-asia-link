const { getConnection } = require('./db-connection');

exports.handler = async (event, context) => {
  try {
    const limit = parseInt(event.queryStringParameters?.limit || '20', 10);

    try {
      const sql = getConnection();
      const posts = await sql`
        SELECT *
        FROM social_posts
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return {
        statusCode: 200,
        body: JSON.stringify(posts),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30',
        },
      };
    } catch (dbError) {
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error' }),
      };
    }
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch social posts' }),
    };
  }
};
