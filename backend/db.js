
require('dotenv').config();
const mysql = require('mysql2/promise'); // ✅ ใช้ promise version เท่านั้น

let sslConfig = undefined;

if (process.env.DB_SSL === '1') {
  sslConfig = { rejectUnauthorized: true };
  if (process.env.ALLOW_INSECURE_SSL === '1') {
    sslConfig.rejectUnauthorized = false;
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
