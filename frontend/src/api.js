import axios from 'axios'

const api = axios.create({
  baseURL: 'https://test-webapp-ge.onrender.com',  // 👈 ตรงนี้แทน /api
  withCredentials: true,
  timeout: 15000,
});
export default api;