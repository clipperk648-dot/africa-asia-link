const { getConnection } = require('./db-connection');

exports.handler = async (event) => {
  try {
    const { userId } = event.queryStringParameters || {};
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'userId is required' }) };
    const sql = getConnection();
    const rows = await sql`
      SELECT id, user_id, type, amount, currency, note, created_at
      FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) };
  } catch (e) {
    console.error('get-transactions error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }
};
