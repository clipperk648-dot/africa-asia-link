const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse, parseBody } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const data = parseBody(event);
    const { email, passwordHash, name, phone, role } = data;

    if (!email || !passwordHash || !role) {
      return createErrorResponse(400, 'Email, password, and role are required');
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

      return createJsonResponse(201, {
        id: savedUser._id.toString(),
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error: ' + dbError.message);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return createErrorResponse(500, 'Failed to create user');
  }
};
