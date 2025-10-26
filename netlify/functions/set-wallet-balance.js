const { getConnection } = require('./db-connection');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { userId, amount, currency = 'USD' } = JSON.parse(event.body || '{}');
    if (!userId || amount === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId and amount are required' }) };
    }
    const sql = getConnection();
    const updated = await sql`
      UPDATE wallet SET balance = ${amount}
      WHERE user_id = ${userId} AND currency = ${currency}
      RETURNING user_id, balance, currency
    `;
    if (updated.length) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated[0]) };
    }
    const inserted = await sql`
      INSERT INTO wallet (user_id, balance, currency, updated_at)
      VALUES (${userId}, ${amount}, ${currency}, NOW())
      RETURNING user_id, balance, currency
    `;
    return { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inserted[0]) };
  } catch (e) {
    console.error('set-wallet-balance error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }
};
