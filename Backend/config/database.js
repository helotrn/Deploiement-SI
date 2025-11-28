const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'database',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'supervision',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 5
});

module.exports = pool;
