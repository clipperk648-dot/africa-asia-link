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

module.exports = { createJsonResponse, createErrorResponse, createSuccessResponse };
