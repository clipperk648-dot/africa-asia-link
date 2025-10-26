const { getConnection } = require('./db-connection');

exports.handler = async (event, context) => {
  try {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Product ID is required' }),
      };
    }

    try {
      const sql = getConnection();
      const products = await sql`
        SELECT * FROM products
        WHERE id = ${id}
        LIMIT 1
      `;

      if (products.length === 0) {
        throw new Error('Product not found');
      }

      return {
        statusCode: 200,
        body: JSON.stringify(products[0]),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
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
    console.error('Error fetching product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch product' }),
    };
  }
};
