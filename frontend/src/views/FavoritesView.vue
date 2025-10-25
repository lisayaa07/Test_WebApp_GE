<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'

library.add(farHeart, fasHeart)

const API_URL = import.meta.env.VITE_API_URL || 'https://test-webapp-ge.onrender.com'
const router = useRouter()

// -------- state --------
const user = ref(null) // จะได้ { email, student_ID, ... } จาก /me
const groupedFavs = ref([]) // [{ group_ID, group_Name, subjects:[{subject_ID, subject_Name}] }]
const loading = ref(false)
const errorMsg = ref('')

// -------- helpers --------
const isLoggedIn = computed(() => !!user.value?.student_ID)

async function fetchMe() {
  try {
    const res = await fetch(`${API_URL}/me`, {
      method: 'GET',
      credentials: 'include', // ต้องมีเพื่อส่งคุกกี้
    })
    const data = await res.json()
    if (data?.ok && data.user) {
      user.value = data.user
    } else {
      user.value = null
      router.replace({ name: 'login' })
    }
  } catch (err) {
    console.error('fetchMe error:', err)
    user.value = null
    router.replace({ name: 'login' })
  }
}

async function fetchFavoritesGrouped() {
  if (!user.value?.student_ID) return
  loading.value = true
  errorMsg.value = ''
  try {
    const url = `${API_URL}/favorites/grouped?student_id=${encodeURIComponent(user.value.student_ID)}`
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include', // ใช้คุกกี้ ไม่ใช้ header token
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || res.statusText)
    const data = await res.json()
    groupedFavs.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('❌ โหลด favorites grouped ล้มเหลว', e)
    errorMsg.value = e.message || 'โหลดรายการโปรดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

// ลบรายการโปรด (optimistic update)
async function removeFavorite(subjectId) {
  if (!user.value?.student_ID) {
    alert('กรุณาเข้าสู่ระบบก่อนจึงจะใช้งานรายการโปรดได้')
    return
  }
  const sid = String(subjectId).trim()
  const snapshot = JSON.parse(JSON.stringify(groupedFavs.value))

  try {
    // อัปเดตหน้าจอทันที
    for (const g of groupedFavs.value) {
      g.subjects = g.subjects.filter(s => String(s.subject_ID) !== sid)
    }
    groupedFavs.value = groupedFavs.value.filter(g => g.subjects.length > 0)

    // เรียก API ลบจริง
    const url = `${API_URL}/favorites?student_id=${encodeURIComponent(user.value.student_ID)}&subject_id=${encodeURIComponent(sid)}`
    const res = await fetch(url, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || res.statusText)
  } catch (e) {
    console.error('❌ remove favorite error', e)
    groupedFavs.value = snapshot // rollback
    alert('ลบรายการโปรดไม่สำเร็จ กรุณาลองใหม่')
  }
}

function goToReviews(subject) {
  if (!subject?.subject_ID) return
  router.push({ name: 'reviewsubjects', params: { id: subject.subject_ID }, query: { name: subject.subject_Name || '' } })
}

// เริ่มทำงาน
onMounted(async () => {
  await fetchMe()               // 1) รู้ว่าเป็นใครจากคุกกี้
  if (isLoggedIn.value) {
    await fetchFavoritesGrouped() // 2) โหลดรายการโปรดของคนนั้น
  }
})
</script>

<template>
  <Layout>
    <div class="p-6">
      <h1 class="text-2xl font-semibold mb-4">รายการโปรดของฉัน</h1>

      <div v-if="!isLoggedIn" class="text-gray-600">
        กรุณาเข้าสู่ระบบเพื่อดูรายการโปรด
      </div>

      <div v-else-if="loading" class="text-gray-600">
        กำลังโหลดรายการโปรด...
      </div>

      <div v-else-if="errorMsg" class="text-red-600">
        {{ errorMsg }}
      </div>

      <div v-else>
        <div v-if="groupedFavs.length === 0" class="text-gray-600">
          ยังไม่มีวิชาที่ถูกใจ
        </div>

        <div v-for="group in groupedFavs" :key="group.group_ID" class="mb-6">
          <h2 class="text-xl font-medium mb-3">
            {{ group.group_Name || ('หมวด ' + group.group_ID) }}
          </h2>

          <div class="space-y-2">
            <div
              v-for="subject in group.subjects"
              :key="subject.subject_ID"
              class="flex items-center justify-between bg-pink rounded-lg px-4 py-2 shadow-sm"
            >
              <button type="button" class="text-left" @click="goToReviews(subject)" title="ดูรีวิววิชานี้">
                {{ subject.subject_ID }} {{ subject.subject_Name }}
              </button>

              <button
                type="button"
                class="btn btn-ghost btn-circle"
                @click="removeFavorite(subject.subject_ID)"
                title="เอาออกจากรายการโปรด"
              >
                <FontAwesomeIcon :icon="['fas','heart']" size="xl" class="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
