import axios from 'axios'

const api = axios.create({
  baseURL: '/api',           // ✅ ใช้ proxy แทน URL จริง
  withCredentials: true,     // ✅ แนบ cookie
  timeout: 15000,
})

export default api
