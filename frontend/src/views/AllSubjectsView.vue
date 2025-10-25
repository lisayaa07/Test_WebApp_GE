<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(farHeart, fasHeart)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()
const groupedSubjects = ref([])

// --- State ใหม่สำหรับ User Info/Auth ---
const user = ref(null) 
const isLoggedIn = computed(() => !!user.value?.student_ID) 
const busy = ref(false) // เพิ่ม busy state เพื่อกันดับเบิลคลิก

// รายการโปรด (subject_ID เป็นชุด)
const favoriteIds = ref(new Set())
const isFav = (subjectId) => favoriteIds.value.has(String(subjectId).trim())

// --- ฟังก์ชัน handle 401 ---
async function handle401(res) {
  if (res.status === 401) {
    router.replace({ name: 'login' })
    throw new Error('Unauthorized')
  }
}

// --- โหลดข้อมูลผู้ใช้ (จาก FavoritesView.vue) ---
async function fetchMe() {
  try {
    const res = await fetch(`${API_URL}/me`, {
      method: 'GET',
      credentials: 'include', // ต้องใช้ credentials เพื่อส่ง cookie
    })
    const data = await res.json()
    if (data?.ok && data.user) {
      user.value = data.user
    } else {
      user.value = null
    }
  } catch (err) {
    console.error('fetchMe error:', err)
    user.value = null
  }
}

// โหลด favorites (ids) ของผู้ใช้
async function fetchFavorites () {
  if (!isLoggedIn.value) return 
  try {
    const url = `${API_URL}/favorites/ids`
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include', // ✅ สำคัญ: ต้องส่ง Cookie
    })
    await handle401(res) 
    if (!res.ok) {
      let errText = res.statusText
      try {
        const j = await res.json()
        errText = j?.message || errText
      } catch (e) {}
      throw new Error(errText)
    }
    const data = await res.json()
    // คาดว่า backend ส่ง array ของ subject_IDs
    favoriteIds.value = new Set((data || []).map(String))
  } catch (err) {
    console.error('❌ โหลด favorites ล้มเหลว', err)
  }
}

// toggle favorite
async function toggleFavorite (subjectId) {
  if (!isLoggedIn.value) {
    alert('กรุณาเข้าสู่ระบบก่อนจึงจะใช้งานรายการโปรดได้')
    return
  }
  if (busy.value) return // กันดับเบิลคลิก
  
  const sid = String(subjectId).trim()
  const wasFav = favoriteIds.value.has(sid)

  // optimistic update
  const next = new Set(favoriteIds.value)
  wasFav ? next.delete(sid) : next.add(sid)
  favoriteIds.value = next
  busy.value = true

  try {
    let res
    if (wasFav) {
      // DELETE
      const url = `${API_URL}/favorites?subject_id=${encodeURIComponent(sid)}`
      res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include', // ✅ สำคัญ
      })
    } else {
      // POST to add favorite
      const url = `${API_URL}/favorites`
      res = await fetch(url, {
        method: 'POST',
        credentials: 'include', // ✅ สำคัญ
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id: sid }) // Backend อ่าน student_id จาก Cookie
      })
    }
    
    await handle401(res)
    if (!res.ok) {
      let j = {}
      try { j = await res.json() } catch(e){}
      throw new Error(j?.message || res.statusText)
    }
  } catch (err) {
    console.error('❌ toggle favorite error', err)
    // rollback
    const rollback = new Set(favoriteIds.value)
    wasFav ? rollback.add(sid) : rollback.delete(sid)
    favoriteIds.value = rollback
    alert('ไม่สามารถอัปเดตรายการโปรดได้ กรุณาลองใหม่')
  } finally {
    busy.value = false
  }
}

// โหลด grouped subjects (All Subjects)
async function loadGroupedSubjects () {
  try {
    const res = await fetch(`${API_URL}/grouped-subjects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) {
      let msg = res.statusText
      try { const j = await res.json(); msg = j?.message || msg } catch(e){}
      throw new Error(msg)
    }
    const data = await res.json()
    groupedSubjects.value = data
  } catch (err) {
    console.error('❌ โหลด grouped subjects ล้มเหลว', err)
    // ถ้าต้องการแสดงข้อความ error ให้เพิ่ม state และแสดงใน template
  }
}

// ไปหน้ารีวิวรายวิชา
function Comments (subject) {
  if (!subject?.subject_ID) return
  router.push({
    name: 'reviewsubjects',
    params: { id: subject.subject_ID },
    query: { name: subject.subject_Name || '' },
  })
}

// โหลดข้อมูลเมื่อ component mount
onMounted(async () => {
  await loadGroupedSubjects() // โหลดวิชาทั้งหมด
  await fetchMe() // โหลดข้อมูลผู้ใช้ (อ่าน Cookie)
  await fetchFavorites() // โหลด Favorites (ใช้ Cookie)
})
</script>

<template>
  <Layout>
    <p class="text-3xl m-4 mb-5">หมวดวิชาศึกษาทั่วไป</p>

    <div v-for="group in groupedSubjects" :key="group.group_ID" class="ml-20">
      <p class="text-xl mb-2.5">{{ group.group_Name }}</p>

      <div class="ml-25">
        <div>
          <div v-for="subject in group.subjects" :key="subject.subject_ID"
               class="flex justify-between items-center">
            <span>
              {{ subject.subject_ID }} {{ subject.subject_Name }}
            </span>

            <div class="flex pr-20 gap-6">
              <button type="button" class="btn btn-ghost btn-circle" @click="Comments(subject)"
                      aria-label="ดูคอมเมนต์ของวิชานี้" title="ดูคอมเมนต์">
                <FontAwesomeIcon icon="comment-dots" size="xl" class="text-gray-600" />
              </button>

              <button
                type="button"
                class="btn btn-ghost btn-circle"
                :aria-pressed="isFav(subject.subject_ID)"
                @click="toggleFavorite(subject.subject_ID)"
                :title="isFav(subject.subject_ID) ? 'เอาออกจากรายการโปรด' : 'เพิ่มเป็นรายการโปรด'"
                :disabled="busy"> <FontAwesomeIcon
                  :icon="isFav(subject.subject_ID) ? ['fas','heart'] : ['far','heart']"
                  size="xl"
                  :class="isFav(subject.subject_ID)
                    ? 'text-red-500 transition-transform duration-150 scale-110'
                    : 'text-red-500/40 hover:text-red-500 transition-colors duration-150'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>