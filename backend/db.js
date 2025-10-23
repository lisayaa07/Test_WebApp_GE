// ในไฟล์ db.js

const mysql = require('mysql2');
const fs = require('fs');

// ⚠️ ตัวแปร caCert นี้ไม่ได้ถูกใช้, สามารถลบออกหรือคอมเมนต์ไว้ได้
// const caCert = process.env.CA_CERT_CONTENT; 


let sslConfig = { rejectUnauthorized: true };

if (process.env.AIVEN_CA_CERT) {
  // ✅ ถ้า Render มี cert ใน environment variable
  sslConfig.ca = process.env.AIVEN_CA_CERT;
  
  // 🟢 แก้ไข: ตั้งค่า rejectUnauthorized เป็น false เพื่อแก้ปัญหา self-signed
  sslConfig.rejectUnauthorized = false; 
} else {
  // ✅ ถ้า run ในเครื่อง ใช้ไฟล์ cert จาก local
  sslConfig.ca = fs.readFileSync('./certificate/ca.pem').toString();
  // ⚠️ สำหรับ Local/Dev คุณอาจจะตั้งค่า rejectUnauthorized: true เหมือนเดิมก็ได้
}


// ✅ สร้าง connection สำหรับ MySQL
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
