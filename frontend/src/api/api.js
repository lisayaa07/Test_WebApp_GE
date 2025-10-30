import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL
const api = axios.create({
  baseURL: API_URL || 'https://test-webapp-ge.onrender.com',
  withCredentials: true, // 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

export default api
