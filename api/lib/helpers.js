// CORS headers for API responses
const getCorsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

// Handle CORS preflight requests
const handleCors = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return true;
  }
  return false;
};

// Send error response
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    error: message,
    status: 'error',
  });
};

// Send success response
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    ...data,
    status: 'success',
  });
};

// Parse request body
const parseBody = async (req) => {
  if (req.method === 'GET') {
    return {};
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return req.body || {};
};

module.exports = {
  getCorsHeaders,
  handleCors,
  sendError,
  sendSuccess,
  parseBody,
};
