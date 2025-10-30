import { ref } from 'vue'

export const user = ref(null)
export const isLoggedIn = ref(false)

export async function fetchUser() {
  try {
    const res = await fetch('/me', { credentials: 'include' })
    const data = await res.json()
    if (data.ok && data.user) {
      user.value = data.user
      isLoggedIn.value = true
    } else {
      isLoggedIn.value = false
    }
  } catch (err) {
    console.error('fetchUser error:', err)
    isLoggedIn.value = false
  }
}
