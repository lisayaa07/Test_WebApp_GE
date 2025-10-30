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

// ---------- state ----------
const user = ref(null)
const groupedFavs = ref([])
const loading = ref(false)
const errorMsg = ref('')
const busy = ref(false) // กันดับเบิลคลิก

const isLoggedIn = computed(() => !!user.value?.student_ID)
// ---------- utils ----------
async function handle401(res) {
 if (res.status === 401) {
  // session หาย/คุกกี้หมดอายุ
  router.replace({ name: 'login' })
  throw new Error('Unauthorized')
 }
}

// ---------- โหลดข้อมูลผู้ใช้ ----------
async function fetchMe() {
 try {
  const res = await fetch(`${API_URL}/me`, {
   method: 'GET',
   credentials: 'include',
  })
  await handle401(res)
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
// ---------- โหลดรายการโปรด ----------
async function fetchFavoritesGrouped() {
 loading.value = true
 errorMsg.value = ''
 try {
  const res = await fetch(`${API_URL}/favorites/grouped`, {
   method: 'GET',
   credentials: 'include',
  })
  await handle401(res)
  if (!res.ok)
   throw new Error((await res.json().catch(() => ({})))?.message || res.statusText)
  const data = await res.json()
  groupedFavs.value = Array.isArray(data) ? data : []
 } catch (e) {
  console.error('❌ โหลด favorites grouped ล้มเหลว', e)
  errorMsg.value = e.message || 'โหลดรายการโปรดไม่สำเร็จ'
 } finally {
  loading.value = false
 }
}

// ---------- เพิ่มรายการโปรด (เก็บไว้แม้ไม่ได้ใช้ปุ่มในหน้านี้) ----------
async function addFavorite(subjectId) {
 if (!isLoggedIn.value || busy.value) {
  if (!isLoggedIn.value) alert('กรุณาเข้าสู่ระบบก่อนจึงจะเพิ่มรายการโปรดได้')
  return
 }
 busy.value = true
 try {
  const res = await fetch(`${API_URL}/favorites`, {
   method: 'POST',
   credentials: 'include',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ subject_id: String(subjectId).trim() })
  })
  await handle401(res)
  if (!res.ok)
   throw new Error((await res.json().catch(() => ({})))?.message || res.statusText)
  await fetchFavoritesGrouped()
 } catch (e) {
  console.error('addFavorite error:', e)
  alert('ไม่สามารถเพิ่มรายการโปรดได้ กรุณาลองใหม่')
 } finally {
  busy.value = false
 }
}

// ---------- ลบรายการโปรด ----------
async function removeFavorite(subjectId) {
 if (!isLoggedIn.value || busy.value) {
  if (!isLoggedIn.value) alert('กรุณาเข้าสู่ระบบก่อนจึงจะใช้งานรายการโปรดได้')
  return
 }
 busy.value = true
 try {
  const res = await fetch(`${API_URL}/favorites?subject_id=${encodeURIComponent(subjectId)}`, {
   method: 'DELETE',
   credentials: 'include',
  })
  await handle401(res)
  if (!res.ok)
   throw new Error((await res.json().catch(() => ({})))?.message || res.statusText)
  await fetchFavoritesGrouped()
 } catch (e) {
  console.error('❌ remove favorite error', e)
  alert('ลบรายการโปรดไม่สำเร็จ กรุณาลองใหม่')
 } finally {
  busy.value = false
 }
}

// ---------- ไปหน้ารีวิว ----------
function goToReviews(subject) {
 if (!subject?.subject_ID) return
 router.push({
  name: 'reviewsubjects',
  params: { id: subject.subject_ID },
  query: { name: subject.subject_Name || '' },
 })
}

// ---------- lifecycle ----------
onMounted(async () => {
 await fetchMe()
 if (isLoggedIn.value) await fetchFavoritesGrouped()
})
</script>

<template>
 <Layout>
  <div class="p-6">
   <h1 class="text-2xl font-semibold mb-4">รายการโปรดของฉัน</h1>

   <div v-if="!isLoggedIn" class="text-gray-600">กรุณาเข้าสู่ระบบเพื่อดูรายการโปรด</div>
   <div v-else-if="loading" class="text-gray-600">กำลังโหลดรายการโปรด...</div>
   <div v-else-if="errorMsg" class="text-red-600">{{ errorMsg }}</div>

   <div v-else>
    <div v-if="groupedFavs.length === 0" class="text-gray-600">ยังไม่มีวิชาที่ถูกใจ</div>

    <div v-for="group in groupedFavs" :key="group.group_ID" class="mb-6">
     <h2 class="text-xl font-medium mb-3">{{ group.group_Name || ('หมวด ' + group.group_ID) }}</h2>

     <div class="space-y-2">
      <div
       v-for="subject in group.subjects"
       :key="subject.subject_ID"
       class="flex items-center justify-between bg-pink rounded-lg px-4 py-2 shadow-sm"
      >
       <button type="button" class="text-left" @click="goToReviews(subject)">
        {{ subject.subject_ID }} {{ subject.subject_Name }}
       </button>

       <div class="flex gap-2">
                <button
         type="button"
         class="btn btn-ghost btn-circle"
         :disabled="busy"
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
  </div>
 </Layout>
</template>
