<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL || 'https://test-webapp-ge.onrender.com'
const router = useRouter()

// ---------- State ----------
const user = ref(null)
const groupedFavorites = ref([])
const loading = ref(true)
const errorMsg = ref('')

// ---------- โหลดโปรไฟล์ผู้ใช้ ----------
async function fetchUser() {
  try {
    const res = await fetch(`${API_URL}/me`, {
      method: 'GET',
      credentials: 'include',       // ส่งคุกกี้ไปด้วย
    })
    const data = await res.json()
    if (data.ok && data.user) {
      user.value = data.user
    } else {
      router.replace({ name: 'login' })
    }
  } catch (err) {
    console.error('โหลดข้อมูลผู้ใช้ล้มเหลว:', err)
    router.replace({ name: 'login' })
  }
}

// ---------- โหลดรายการโปรด ----------
async function loadFavorites() {
  if (!user.value?.student_ID) return
  try {
    const res = await fetch(`${API_URL}/favorites/grouped?student_id=${encodeURIComponent(user.value.student_ID)}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('โหลดรายการโปรดไม่สำเร็จ')
    groupedFavorites.value = await res.json()
  } catch (err) {
    console.error('loadFavorites error:', err)
    errorMsg.value = 'เกิดข้อผิดพลาดในการโหลดรายการโปรด'
  } finally {
    loading.value = false
  }
}

// ---------- เอาออกจากรายการโปรด ----------
async function removeFavorite(subjectId) {
  if (!user.value?.student_ID) return
  try {
    await fetch(
      `${API_URL}/favorites?student_id=${encodeURIComponent(user.value.student_ID)}&subject_id=${encodeURIComponent(subjectId)}`,
      { method: 'DELETE', credentials: 'include' }
    )
    // โหลดใหม่หลังลบ
    await loadFavorites()
  } catch (err) {
    console.error('removeFavorite error:', err)
  }
}

// ---------- เริ่มทำงาน ----------
onMounted(async () => {
  await fetchUser()
  await loadFavorites()
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">รายการโปรดของฉัน</h1>

    <div v-if="loading" class="text-gray-500">กำลังโหลด...</div>
    <div v-else-if="errorMsg" class="text-red-500">{{ errorMsg }}</div>
    <div v-else>
      <div v-if="groupedFavorites.length === 0" class="text-gray-600">
        คุณยังไม่มีรายการโปรด
      </div>

      <div v-for="group in groupedFavorites" :key="group.group_ID" class="mb-8">
        <h2 class="text-2xl font-semibold mb-3 text-[#374151]">
          {{ group.group_Name }}
        </h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <li
            v-for="subj in group.subjects"
            :key="subj.subject_ID"
            class="p-4 rounded-lg shadow bg-white flex justify-between items-center"
          >
            <span>{{ subj.subject_Name }}</span>
            <button
              @click="removeFavorite(subj.subject_ID)"
              class="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
            >
              ลบ
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  transition: all 0.2s ease;
}
</style>
