import { ref } from 'vue'
import api from '@/api/api.js'  // ✅ ใช้ axios instance ที่ตั้งไว้แล้ว

export const user = ref(null)
export const isLoggedIn = ref(false)

export async function fetchUser() {
  try {
    const res = await api.get('/me')   // ✅ ใช้ api (มี baseURL + cookie แล้ว)
    if (res.data.ok && res.data.user) {
      user.value = res.data.user
      isLoggedIn.value = true
    } else {
      isLoggedIn.value = false
    }
  } catch (err) {
    console.error('fetchUser error:', err)
    isLoggedIn.value = false
  }
}
