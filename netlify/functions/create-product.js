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
    const {
      name,
      category,
      price,
      company,
      location,
      image,
      description,
      sellerId,
    } = data;

    if (!name || !sellerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and seller ID are required' }),
      };
    }

    try {
      const sql = getConnection();
      const result = await sql`
        INSERT INTO products (
          name, category, price, company, location, image, description,
          seller_id, created_at
        )
        VALUES (
          ${name},
          ${category || null},
          ${price || 0},
          ${company || null},
          ${location || null},
          ${image || null},
          ${description || null},
          ${sellerId},
          NOW()
        )
        RETURNING *
      `;

      return {
        statusCode: 201,
        body: JSON.stringify(result[0]),
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
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create product' }),
    };
  }
};
