const api = axios.create({
  baseURL: '/api', // ✅ ใช้ proxy ของ Vercel แทน
  withCredentials: true, // ✅ ให้แนบ cookie อัตโนมัติ
  timeout: 15000,
})

export default api
