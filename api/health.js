import { getModels } from './lib/mongodb.js';
import { sendSuccess, handleCors } from './lib/helpers.js';

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Handle CORS preflight
  if (handleCors(req, res)) return;

  try {
    // Try to connect to database
    await getModels();

    return sendSuccess(res, {
      status: 'ok',
      message: 'Backend server is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return sendSuccess(res, {
      status: 'ok',
      message: 'Backend server is running',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
