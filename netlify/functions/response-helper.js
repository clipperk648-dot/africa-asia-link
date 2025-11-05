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

  if (!body) {
    throw new Error('Request body is empty');
  }

  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString('utf-8');
  }

  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  return body;
};

module.exports = { createJsonResponse, createErrorResponse, createSuccessResponse, parseBody };
