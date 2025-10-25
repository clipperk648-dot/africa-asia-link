const { getConnection } = require('./db-connection');
const { mockSocialPosts } = require('../../src/utils/mockData');

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
      console.warn('Database query failed, using mock data:', dbError.message);
      const posts = mockSocialPosts.slice(0, limit);
      return {
        statusCode: 200,
        body: JSON.stringify(posts),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
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
