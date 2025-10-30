// frontend/src/api/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://test-webapp-ge.onrender.com', // URL ของ backend
  withCredentials: true,
  timeout: 15000,
})

export default api
