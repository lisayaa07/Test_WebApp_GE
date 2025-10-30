<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(farHeart, fasHeart)

// Base API URL (ตั้งใน .env: VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const router = useRouter()
const groupedSubjects = ref([])

// อ่านค่าจาก localStorage แบบที่โปรเจ็กต์คุณใช้อยู่แล้ว
const studentId = ref(localStorage.getItem('student_ID') || '')
const token = ref(localStorage.getItem('token') || '')
const isLoggedIn = computed(() => localStorage.getItem('auth') === '1' && !!studentId.value)

// รายการโปรด (subject_ID เป็นชุด)
const favoriteIds = ref(new Set())
const isFav = (subjectId) => favoriteIds.value.has(String(subjectId).trim())

// --- ฟังก์ชันช่วยสร้าง headers (ใส่ token ถ้ามี) ---
function authHeaders() {
  const h = { 'Content-Type': 'application/json' }
  const t = localStorage.getItem('token') || token.value
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

// โหลด favorites (ids) ของผู้ใช้
async function fetchFavorites () {
  if (!isLoggedIn.value) return
  try {
    const url = `${API_URL}/favorites/ids?student_id=${encodeURIComponent(studentId.value)}`
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: authHeaders()
      
    })
    if (!res.ok) {
      // อ่าน message จาก backend ถ้ามี
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
    // ไม่ต้องโยน error ไป UI ตรงนี้ (แต่คุณอาจจะแสดง toast ได้)
  }
}

// toggle favorite (optimistic update)
async function toggleFavorite (subjectId) {
  if (!isLoggedIn.value) {
    alert('กรุณาเข้าสู่ระบบก่อนจึงจะใช้งานรายการโปรดได้')
    return
  }
  const sid = String(subjectId).trim()
  const wasFav = favoriteIds.value.has(sid)

  // optimistic update
  const next = new Set(favoriteIds.value)
  wasFav ? next.delete(sid) : next.add(sid)
  favoriteIds.value = next

  try {
    if (wasFav) {
      // DELETE with query params
      const url = `${API_URL}/favorites?student_id=${encodeURIComponent(studentId.value)}&subject_id=${encodeURIComponent(sid)}`
      const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (!res.ok) {
        let j = {}
        try { j = await res.json() } catch(e){}
        throw new Error(j?.message || res.statusText)
      }
    } else {
      // POST to add favorite
      const url = `${API_URL}/favorites`
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ student_id: studentId.value, subject_id: sid })
      })
      if (!res.ok) {
        let j = {}
        try { j = await res.json() } catch(e){}
        throw new Error(j?.message || res.statusText)
      }
    }
  } catch (err) {
    console.error('❌ toggle favorite error', err)
    // rollback
    const rollback = new Set(favoriteIds.value)
    wasFav ? rollback.add(sid) : rollback.delete(sid)
    favoriteIds.value = rollback
    alert('ไม่สามารถอัปเดตรายการโปรดได้ กรุณาลองใหม่')
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

// โหลดข้อมูลเมื่อ component mount
oonMounted(async () => {
  try {
    const res = await api.get('/grouped-subjects')
    groupedSubjects.value = res.data
    console.log('📦 grouped-subjects:', res.data)
  } catch (err) {
    console.error('❌ โหลดข้อมูลไม่สำเร็จ:', err)
  }
})

// ไปหน้ารีวิวรายวิชา
function Comments (subject) {
  if (!subject?.subject_ID) return
  router.push({
    name: 'reviewsubjects',
    params: { id: subject.subject_ID },
    query: { name: subject.subject_Name || '' },
  })
}
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
              <!-- ปุ่มดูคอมเมนต์ -->
              <button type="button" class="btn btn-ghost btn-circle" @click="Comments(subject)"
                      aria-label="ดูคอมเมนต์ของวิชานี้" title="ดูคอมเมนต์">
                <FontAwesomeIcon icon="comment-dots" size="xl" class="text-gray-600" />
              </button>

              <!-- ปุ่มหัวใจ -->
              <button
                type="button"
                class="btn btn-ghost btn-circle"
                :aria-pressed="isFav(subject.subject_ID)"
                @click="toggleFavorite(subject.subject_ID)"
                :title="isFav(subject.subject_ID) ? 'เอาออกจากรายการโปรด' : 'เพิ่มเป็นรายการโปรด'">
                <FontAwesomeIcon
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
