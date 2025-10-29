// db.js
const mysql = require('mysql2/promise'); // ✅ ใช้ promise version
require('dotenv').config();

let sslConfig = undefined;

if (process.env.DB_SSL === '1') {
  sslConfig = { rejectUnauthorized: true };
  if (process.env.VITE_API_URL) {
    sslConfig.ca = process.env.VITE_API_URL;
  } else if (process.env.ALLOW_INSECURE_SSL === '1') {
    sslConfig = { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
