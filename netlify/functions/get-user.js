const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { id, email } = event.queryStringParameters || {};

    if (!id && !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Either id or email is required' }),
      };
    }

    try {
      const { User } = await getModels();

      let user;
      if (id) {
        user = await User.findById(id).lean();
      } else if (email) {
        user = await User.findOne({ email }).lean();
      }

      if (!user) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          password_hash: user.password_hash,
          created_at: user.created_at,
        }),
        headers: { 'Content-Type': 'application/json' },
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
