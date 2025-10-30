<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import api from '@/api/api.js'   // ✅ ต้องใส่ .js ด้วย

library.add(farHeart, fasHeart)

// API URL (จะไม่ใช้ตรง ๆ ถ้าเรียกผ่าน api)
const router = useRouter()
const groupedSubjects = ref([])

// ข้อมูลผู้ใช้
const studentId = ref(localStorage.getItem('student_ID') || '')
const token = ref(localStorage.getItem('token') || '')
const isLoggedIn = computed(() => localStorage.getItem('auth') === '1' && !!studentId.value)

// รายการโปรด
const favoriteIds = ref(new Set())
const isFav = (subjectId) => favoriteIds.value.has(String(subjectId).trim())

function authHeaders() {
  const h = { 'Content-Type': 'application/json' }
  const t = localStorage.getItem('token') || token.value
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

// โหลดรายการโปรด
async function fetchFavorites() {
  if (!isLoggedIn.value) return
  try {
    const res = await api.get(`/favorites/ids?student_id=${encodeURIComponent(studentId.value)}`, {
      withCredentials: true,
      headers: authHeaders()
    })
    favoriteIds.value = new Set((res.data || []).map(String))
  } catch (err) {
    console.error('❌ โหลด favorites ล้มเหลว:', err)
  }
}

// toggle รายการโปรด
// ✅ toggle รายการโปรด (แก้เวอร์ชัน)
async function toggleFavorite(subjectId) {
  const sid = String(subjectId).trim()
  const wasFav = favoriteIds.value.has(sid)

  // ✅ อัปเดต UI ทันที (Optimistic update)
  const next = new Set(favoriteIds.value)
  if (wasFav) next.delete(sid)
  else next.add(sid)
  favoriteIds.value = next

  try {
    if (wasFav) {
      // 🔻 ลบออกจากรายการโปรด
      await api.delete('/favorites', {
        params: { subject_id: sid },
        withCredentials: true,
      })
    } else {
      // ❤️ เพิ่มเป็นรายการโปรด
      await api.post('/favorites', { subject_id: sid }, {
        withCredentials: true,
      })
    }

    console.log('✅ อัปเดตรายการโปรดสำเร็จ:', sid)
  } catch (err) {
    console.error('❌ toggle favorite error:', err.response?.data || err)
    // ❌ ถ้า API ล้มเหลว ให้ rollback กลับไปค่าเดิม
    const rollback = new Set(favoriteIds.value)
    if (wasFav) rollback.add(sid)
    else rollback.delete(sid)
    favoriteIds.value = rollback
    alert('ไม่สามารถอัปเดตรายการโปรดได้ กรุณาลองใหม่')
  }
}

// โหลดกลุ่มรายวิชา
onMounted(async () => {
  try {
    const [favRes, subjRes] = await Promise.all([
      api.get('/favorites/ids', { withCredentials: true }),
      api.get('/grouped-subjects')
    ])

    favoriteIds.value = new Set((favRes.data || []).map(String))
    groupedSubjects.value = subjRes.data || []

    console.log('✅ โหลดข้อมูลสำเร็จ:', {
      subjects: groupedSubjects.value.length,
      favorites: favoriteIds.value.size
    })
  } catch (err) {
    console.error('❌ โหลดข้อมูลไม่สำเร็จ:', err.response?.data || err.message)
  }
})


// ไปหน้ารีวิวรายวิชา
function Comments(subject) {
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
    <section class="p-6">
      <h1 class="text-3xl mb-5">หมวดวิชาศึกษาทั่วไป</h1>

      <div v-if="!groupedSubjects.length" class="text-gray-500 ml-20">
        ⏳ กำลังโหลดข้อมูล...
      </div>

      <div v-else>
        <div v-for="group in groupedSubjects" :key="group.group_ID" class="ml-20 mb-8">
          <h2 class="text-xl mb-3 font-semibold">{{ group.group_Name }}</h2>

          <div v-for="subject in group.subjects" :key="subject.subject_ID"
               class="flex justify-between items-center py-1">
            <span>
              {{ subject.subject_ID }} {{ subject.subject_Name }}
            </span>

            <div class="flex pr-20 gap-6">
              <!-- ปุ่มดูคอมเมนต์ -->
              <button
                type="button"
                class="btn btn-ghost btn-circle"
                @click="Comments(subject)"
                aria-label="ดูคอมเมนต์ของวิชานี้"
                title="ดูคอมเมนต์"
              >
                <FontAwesomeIcon icon="comment-dots" size="xl" class="text-gray-600" />
              </button>

              <!-- ปุ่มหัวใจ -->
              <button
                type="button"
                class="btn btn-ghost btn-circle"
                :aria-pressed="isFav(subject.subject_ID)"
                @click="toggleFavorite(subject.subject_ID)"
                :title="isFav(subject.subject_ID)
                  ? 'เอาออกจากรายการโปรด'
                  : 'เพิ่มเป็นรายการโปรด'"
              >
                <FontAwesomeIcon
                  :icon="isFav(subject.subject_ID) ? ['fas', 'heart'] : ['far', 'heart']"
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
    </section>
  </Layout>
</template>
