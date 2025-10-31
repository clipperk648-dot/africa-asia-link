const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { id } = event.queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'id is required' }),
      };
    }

    try {
      const { Product } = await getModels();

      const product = await Product.findById(id).lean();

      if (!product) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Product not found' }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
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
    console.error('Error fetching product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch product' }),
    };
  }
};
