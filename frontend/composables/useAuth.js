
import { ref } from 'vue'
import api from '@/api/api.js'

export const user = ref(null)

export async function fetchUser() {
  try {
    const res = await api.get('/me')
    if (res.data.ok && res.data.user) {
      user.value = res.data.user
      return true
    }
  } catch (err) {
    console.error('fetchUser failed:', err)
  }
  user.value = null
  return false
}

export const isLoggedIn = () => !!user.value?.student_ID
