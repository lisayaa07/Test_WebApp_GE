import axios from 'axios'

const api = axios.create({
  baseURL: '/api',          // ✅ ใช้ proxy ของ Vercel
  withCredentials: true,    // ✅ ให้แนบ cookie
  timeout: 15000,
})

export default api
