const { getConnection } = require('./db-connection');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { senderId, recipientId, content, mediaUrl } = JSON.parse(event.body || '{}');
    if (!senderId || !recipientId || (!content && !mediaUrl)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'senderId, recipientId and content or mediaUrl required' }) };
    }
    const sql = getConnection();
    const rows = await sql`
      INSERT INTO messages (sender_id, recipient_id, content, media_url, created_at)
      VALUES (${senderId}, ${recipientId}, ${content || null}, ${mediaUrl || null}, NOW())
      RETURNING id, sender_id, recipient_id, content, media_url, created_at
    `;
    return { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows[0]) };
  } catch (e) {
    console.error('send-message error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }
};
