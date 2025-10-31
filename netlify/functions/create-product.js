const { getModels } = require('./mongodb-connection');
const { createErrorResponse, createJsonResponse } = require('./response-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
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
      images,
      description,
      sellerId,
      rating,
    } = data;

    if (!name || !sellerId) {
      return createErrorResponse(400, 'Name and seller ID are required');
    }

    try {
      const { Product } = await getModels();

      const newProduct = new Product({
        name,
        category: category || null,
        price: price || 0,
        company: company || null,
        location: location || null,
        image: image || null,
        images: images || [],
        description: description || null,
        seller_id: sellerId,
        rating: rating || null,
        created_at: new Date(),
      });

      const savedProduct = await newProduct.save();

      return createJsonResponse(201, {
        id: savedProduct._id.toString(),
        name: savedProduct.name,
        category: savedProduct.category,
        price: savedProduct.price,
        company: savedProduct.company,
        location: savedProduct.location,
        image: savedProduct.image,
        images: savedProduct.images,
        rating: savedProduct.rating,
        description: savedProduct.description,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse(500, 'Database error');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return createErrorResponse(500, 'Failed to create product');
  }
};
