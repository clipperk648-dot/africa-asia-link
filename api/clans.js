const { getModels } = require('./lib/mongodb');
const { sendError, sendSuccess, handleCors } = require('./lib/helpers');

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (handleCors(req, res)) return;

  try {
    const { Clan } = await getModels();

    if (req.method === 'GET') {
      const { limit = '20', offset = '0' } = req.query || {};
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      const clans = await Clan.find()
        .sort({ created_at: -1 })
        .skip(offsetNum)
        .limit(limitNum)
        .lean();

      return sendSuccess(res, {
        clans: clans.map(c => ({
          id: c._id.toString(),
          name: c.name,
          description: c.description,
          creator_id: c.creator_id,
          creator_name: c.creator_name,
          target_product_id: c.target_product_id,
          target_product_name: c.target_product_name,
          target_price: c.target_price,
          current_funded: c.current_funded,
          deadline: c.deadline,
          status: c.status,
          members: c.members,
          created_at: c.created_at,
        })),
      });
    } else if (req.method === 'POST') {
      const { name, description, creator_id, creator_name, target_product_id, target_product_name, target_price, deadline } = req.body || {};

      if (!name || !creator_id || !creator_name || !target_price) {
        return sendError(res, 400, 'Missing required fields');
      }

      const clan = new Clan({
        name,
        description,
        creator_id,
        creator_name,
        target_product_id,
        target_product_name,
        target_price,
        current_funded: 0,
        deadline,
        status: 'active',
        members: [],
      });

      await clan.save();

      return sendSuccess(res, {
        success: true,
        clan: {
          id: clan._id.toString(),
          name: clan.name,
          description: clan.description,
          creator_id: clan.creator_id,
          creator_name: clan.creator_name,
          target_product_id: clan.target_product_id,
          target_product_name: clan.target_product_name,
          target_price: clan.target_price,
          current_funded: clan.current_funded,
          deadline: clan.deadline,
          status: clan.status,
          members: clan.members,
          created_at: clan.created_at,
        },
      }, 201);
    } else if (req.method === 'PUT') {
      const { id, current_funded, status, members } = req.body || {};

      if (!id) {
        return sendError(res, 400, 'Clan ID is required');
      }

      const updateData = { updated_at: new Date() };
      if (current_funded !== undefined) updateData.current_funded = current_funded;
      if (status !== undefined) updateData.status = status;
      if (members !== undefined) updateData.members = members;

      const clan = await Clan.findByIdAndUpdate(id, updateData, { new: true });

      if (!clan) {
        return sendError(res, 404, 'Clan not found');
      }

      return sendSuccess(res, {
        success: true,
        clan: {
          id: clan._id.toString(),
          name: clan.name,
          description: clan.description,
          creator_id: clan.creator_id,
          creator_name: clan.creator_name,
          target_product_id: clan.target_product_id,
          target_product_name: clan.target_product_name,
          target_price: clan.target_price,
          current_funded: clan.current_funded,
          deadline: clan.deadline,
          status: clan.status,
          members: clan.members,
          created_at: clan.created_at,
        },
      });
    } else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Clans endpoint error:', error);
    return sendError(res, 500, 'Failed to process request: ' + error.message);
  }
};
