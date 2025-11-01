const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { id } = event.queryStringParameters || {};

    if (!id) {
      return createErrorResponse(400, 'id is required');
    }

    try {
      const { Product } = await getModels();

      const product = await Product.findById(id).lean();

      if (!product) {
        return createErrorResponse(404, 'Product not found');
      }

      return createJsonResponse(200, {
        id: product._id.toString(),
        name: product.name,
        category: product.category,
        price: product.price,
        company: product.company,
        location: product.location,
        image: product.image,
        images: product.images,
        rating: product.rating,
        description: product.description,
        seller_id: product.seller_id,
        created_at: product.created_at,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return createErrorResponse(500, 'Failed to fetch product');
  }
};
