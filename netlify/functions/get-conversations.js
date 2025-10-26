const { getConnection } = require('./db-connection');

exports.handler = async (event) => {
  try {
    const { userId } = event.queryStringParameters || {};
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'userId is required' }) };
    const sql = getConnection();
    const rows = await sql`
      WITH related AS (
        SELECT CASE WHEN sender_id = ${userId} THEN recipient_id ELSE sender_id END AS other_id,
               content,
               created_at
        FROM messages
        WHERE sender_id = ${userId} OR recipient_id = ${userId}
      ), ranked AS (
        SELECT other_id, content, created_at,
               ROW_NUMBER() OVER (PARTITION BY other_id ORDER BY created_at DESC) AS rn
        FROM related
      )
      SELECT other_id, content AS last_message, created_at AS last_time
      FROM ranked WHERE rn = 1
      ORDER BY last_time DESC
    `;
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) };
  } catch (e) {
    console.error('get-conversations error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }
};
