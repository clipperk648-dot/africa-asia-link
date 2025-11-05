const createJsonResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
};

const createErrorResponse = (statusCode, message) => {
  return createJsonResponse(statusCode, { error: message });
};

const createSuccessResponse = (data) => {
  return createJsonResponse(200, data);
};

const parseBody = (event) => {
  let body = event.body;

  // Handle empty body
  if (!body) {
    return {};
  }

  // Decode base64 if needed
  if (event.isBase64Encoded && typeof body === 'string') {
    try {
      body = Buffer.from(body, 'base64').toString('utf-8');
    } catch (err) {
      console.error('Base64 decode error:', err);
      return {};
    }
  }

  // Parse JSON if body is a string
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (err) {
      console.error('JSON parse error:', err);
      return {};
    }
  }

  // If body is already an object, return it
  return body || {};
};

module.exports = { createJsonResponse, createErrorResponse, createSuccessResponse, parseBody };
