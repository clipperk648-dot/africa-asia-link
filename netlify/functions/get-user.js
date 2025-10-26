const { getConnection } = require('./db-connection');

exports.handler = async (event, context) => {
  try {
    const { id, email } = event.queryStringParameters || {};

    if (!id && !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID or email is required' }),
      };
    }

    try {
      const sql = getConnection();
      let users;

      if (id) {
        users = await sql`
          SELECT id, email, name, phone, role, created_at
          FROM users
          WHERE id = ${id}
        `;
      } else {
        users = await sql`
          SELECT id, email, password_hash, name, phone, role, created_at
          FROM users
          WHERE email = ${email}
        `;
      }

      if (users.length === 0) {
        return {
          statusCode: 200,
          body: JSON.stringify(null),
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=60',
          },
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(users[0]),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=300',
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
    console.error('Error fetching user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch user' }),
    };
  }
};
