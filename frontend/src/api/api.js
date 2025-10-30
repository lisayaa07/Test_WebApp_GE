import axios from 'axios'

const api = axios.create({
  baseURL: 'https://test-webapp-ge.onrender.com',
  withCredentials: true, // ✅ สำคัญมาก
  timeout: 40000,
  headers: { 'Content-Type': 'application/json' },
})
