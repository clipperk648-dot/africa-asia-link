// Shared database connection for Netlify Functions
const postgres = require('postgres');

let sql = null;

const getConnection = () => {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    sql = postgres(dbUrl, {
      connect_timeout: 10,
      idle_timeout: 30,
      max_lifetime: 60 * 60, // 1 hour
      // SSL is required by Neon
      ssl: 'require',
    });
  }
  
  return sql;
};

const closeConnection = async () => {
  if (sql) {
    await sql.end();
    sql = null;
  }
};

module.exports = { getConnection, closeConnection };
