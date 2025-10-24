// ในไฟล์ db.js

const mysql = require('mysql2');
const fs = require('fs');

// ⚠️ ตัวแปร caCert นี้ไม่ได้ถูกใช้, สามารถลบออกหรือคอมเมนต์ไว้ได้
// const caCert = process.env.CA_CERT_CONTENT; 


let sslConfig = undefined; // เริ่มจากไม่ตั้ง SSL

if (process.env.DB_SSL === '1') {
  sslConfig = { rejectUnauthorized: true };
  if (process.env.AIVEN_CA_CERT) {
    sslConfig.ca = process.env.AIVEN_CA_CERT;
  } else if (process.env.ALLOW_INSECURE_SSL === '1') {
    // โหมดผ่อนปรน (เฉพาะชั่วคราว)
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