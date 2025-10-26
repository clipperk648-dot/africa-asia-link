const { getConnection } = require('./db-connection');

exports.handler = async (event, context) => {
  try {
    const limit = parseInt(event.queryStringParameters?.limit || '20', 10);
    const offset = parseInt(event.queryStringParameters?.offset || '0', 10);

    try {
      const sql = getConnection();
      const products = await sql`
        SELECT * FROM products
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      return {
        statusCode: 200,
        body: JSON.stringify(products),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
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
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch products' }),
    };
  }
};
