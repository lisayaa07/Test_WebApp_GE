// api.js
import axios from 'axios'   // ✅ ต้องมีบรรทัดนี้

const api = axios.create({
  baseURL: '/api',          // ✅ ใช้ proxy ของ Vercel
  withCredentials: true,    // ✅ ให้แนบ cookie อัตโนมัติ
  timeout: 15000,
})

export default api
