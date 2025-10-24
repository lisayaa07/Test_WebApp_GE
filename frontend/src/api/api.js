import axios from 'axios'

import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // <= ใช้ env ข้างบน
  withCredentials: false, // ถ้าไม่มี cookie ข้ามโดเมน ให้ปิด
  timeout: 15000,
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
