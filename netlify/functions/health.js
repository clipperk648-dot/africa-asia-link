const { getModels } = require('./mongodb-connection');

exports.handler = async (event, context) => {
  try {
    // Try to connect to MongoDB and fetch the User model
    const { User } = await getModels();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ok',
        message: 'Backend server is running',
        database: 'connected',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'error',
        message: 'Backend server is not fully operational',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
        hint: 'Make sure MONGODB_URI environment variable is set correctly in Netlify or local .env file',
      }),
    };
  }
};
