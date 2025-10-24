// ในไฟล์ db.js

const mysql = require('mysql2');
const fs = require('fs');

// ⚠️ ตัวแปร caCert นี้ไม่ได้ถูกใช้, สามารถลบออกหรือคอมเมนต์ไว้ได้
// const caCert = process.env.CA_CERT_CONTENT; 


let sslConfig = { rejectUnauthorized: true };

if (process.env.AIVEN_CA_CERT) {
  // ✅ ถ้า Render มี cert ใน environment variable
  sslConfig.ca = process.env.AIVEN_CA_CERT;
} else {
  // ✅ ถ้า run ในเครื่อง ใช้ไฟล์ cert จาก local
  sslConfig.ca = fs.readFileSync('./certificate/ca.pem').toString();
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
  queueLimit: 0 
});


module.exports = pool;