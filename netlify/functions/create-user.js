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
    const { email, passwordHash, name, phone, role } = data;

    if (!email || !passwordHash || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email, password, and role are required' }),
      };
    }

    try {
      const sql = getConnection();
      const result = await sql`
        INSERT INTO users (email, password_hash, name, phone, role, created_at)
        VALUES (${email}, ${passwordHash}, ${name || null}, ${phone || null}, ${role}, NOW())
        RETURNING id, email, name, role
      `;

      return {
        statusCode: 201,
        body: JSON.stringify(result[0]),
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (dbError) {
      if (dbError.message.includes('duplicate')) {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: 'User already exists' }),
        };
      }
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error' }),
      };
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create user' }),
    };
  }
};
