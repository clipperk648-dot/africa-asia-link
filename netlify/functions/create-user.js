const { getModels } = require('./mongodb-connection');

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
      const { User } = await getModels();

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: 'User already exists' }),
        };
      }

      const newUser = new User({
        email,
        password_hash: passwordHash,
        name: name || email,
        phone: phone || '',
        role,
        created_at: new Date(),
      });

      const savedUser = await newUser.save();

      return {
        statusCode: 201,
        body: JSON.stringify({
          id: savedUser._id.toString(),
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (dbError) {
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error: ' + dbError.message }),
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
