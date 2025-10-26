const { getConnection } = require('./db-connection');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { userId, type, amount, currency = 'USD', note } = JSON.parse(event.body || '{}');
    if (!userId || !type || amount === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId, type, amount are required' }) };
    }
    const sql = getConnection();
    const rows = await sql`
      INSERT INTO transactions (user_id, type, amount, currency, note, created_at)
      VALUES (${userId}, ${type}, ${amount}, ${currency}, ${note || null}, NOW())
      RETURNING id, user_id, type, amount, currency, note, created_at
    `;
    return { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows[0]) };
  } catch (e) {
    console.error('add-transaction error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }
};
