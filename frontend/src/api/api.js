import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://test-webapp-ge.onrender.com',
  withCredentials: true, // 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

export default api
