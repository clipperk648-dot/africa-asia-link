const { getModels } = require('./lib/mongodb');
const { sendError, sendSuccess, handleCors } = require('./lib/helpers');

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (handleCors(req, res)) return;

  try {
    const { Product } = await getModels();

    if (req.method === 'GET') {
      const { limit = '20', offset = '0' } = req.query || {};
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      const products = await Product.find()
        .skip(offsetNum)
        .limit(limitNum)
        .lean();

      return sendSuccess(res, {
        products: products.map(p => ({
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
          seller_id: p.seller_id,
          created_at: p.created_at,
        })),
      });
    } else if (req.method === 'POST') {
      const { name, category, price, company, location, image, images, rating, description, seller_id } = req.body || {};

      if (!name || !price || !seller_id) {
        return sendError(res, 400, 'Missing required fields: name, price, seller_id');
      }

      const product = new Product({
        name,
        category,
        price,
        company,
        location,
        image,
        images: images || [],
        rating: rating || 0,
        description,
        seller_id,
      });

      await product.save();

      return sendSuccess(res, {
        success: true,
        product: {
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
        },
      }, 201);
    } else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Products endpoint error:', error);
    return sendError(res, 500, 'Failed to process request: ' + error.message);
  }
};
