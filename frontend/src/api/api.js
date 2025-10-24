// frontend/src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // ตั้งค่าใน Vercel เป็น URL ของ Render
  withCredentials: false,
  timeout: 15000,
});

export default api;
