const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { limit = '20', offset = '0' } = event.queryStringParameters || {};
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    try {
      const { Product } = await getModels();

      const products = await Product.find()
        .skip(offsetNum)
        .limit(limitNum)
        .lean();

      return {
        statusCode: 200,
        body: JSON.stringify(products.map(p => ({
          id: p._id.toString(),
          name: p.name,
          category: p.category,
          price: p.price,
          company: p.company,
          location: p.location,
          image: p.image,
          images: p.images,
          rating: p.rating,
          description: p.description,
        }))),
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
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch products' }),
    };
  }
};
