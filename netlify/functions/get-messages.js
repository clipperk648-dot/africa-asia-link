const { getConnection } = require('./db-connection');

exports.handler = async (event) => {
  try {
    const { userId, peerId } = event.queryStringParameters || {};
    if (!userId || !peerId) return { statusCode: 400, body: JSON.stringify({ error: 'userId and peerId are required' }) };
    const sql = getConnection();
    const rows = await sql`
      SELECT id, sender_id, recipient_id, content, media_url, created_at
      FROM messages
      WHERE (sender_id = ${userId} AND recipient_id = ${peerId}) OR (sender_id = ${peerId} AND recipient_id = ${userId})
      ORDER BY created_at ASC
    `;
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) };
  } catch (e) {
    console.error('get-messages error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }
};
