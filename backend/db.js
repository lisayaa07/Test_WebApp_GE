// ✅ ใช้ mysql2 ไม่ใช่ Pool (PostgreSQL)
const mysql = require('mysql2');
const fs = require('fs');

const caCert = process.env.CA_CERT_CONTENT; 



// ✅ สร้าง connection สำหรับ MySQL (ไม่ต้องใช้ Pool)
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslConfig
});

// ✅ export connection ไปใช้ใน server.js
module.exports = connection;
