import axios from 'axios'

const api = axios.create({
  baseURL: 'https://test-webapp-ge.onrender.com', // ✅ ใช้ URL ของ backend บน Render
  withCredentials: true, // ✅ เพื่อให้ส่ง cookie ข้ามโดเมน
  timeout: 40000, // ✅ เพิ่มเวลาเป็น 40 วิ กันตอน Render ตื่นช้า
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
