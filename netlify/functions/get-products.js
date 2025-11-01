const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
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

      return createJsonResponse(200, products.map(p => ({
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
      })));
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return createErrorResponse(500, 'Failed to fetch products');
  }
};
