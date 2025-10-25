const { getConnection } = require('./db-connection');
const { mockProducts } = require('../../src/utils/mockData');

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
      console.warn('Database query failed, using mock data:', dbError.message);
      const products = mockProducts.slice(offset, offset + limit);
      return {
        statusCode: 200,
        body: JSON.stringify(products),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
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
