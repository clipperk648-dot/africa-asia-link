const { getConnection } = require('./db-connection');

exports.handler = async (event) => {
  try {
    const { userId, currency = 'USD' } = event.queryStringParameters || {};
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId is required' }) };
    }
    const sql = getConnection();
    const rows = await sql`
      SELECT balance FROM wallet WHERE user_id = ${userId} AND currency = ${currency} LIMIT 1
    `;
    const balance = rows.length ? Number(rows[0].balance) : 0;
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balance, currency }) };
  } catch (e) {
    console.error('get-wallet-balance error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }
};
