<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// subjectId จาก route
const subjectId = String(route.params.id || '')
// subjectName เริ่มจาก query (ถ้ามี) — จะถูกอัปเดตจากผลตอบกลับหาก backend คืนชื่อ
const subjectName = ref(route.query.name || (subjectId ? `วิชา #${subjectId}` : ''))

const loading = ref(false)
const errorMsg = ref('')
const comments = ref([])

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// helper: headers (ใส่ Authorization ถ้ามี token)
function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

// แปลงให้แสดงผลง่าย (รองรับโครงสร้างที่ต่างกันได้เล็กน้อย)
function normalize(r) {
  return {
    id: r?.id ?? r?.fr_ID ?? crypto?.randomUUID?.() ?? Math.random(),
    text: r?.text ?? r?.review ?? r?.comment ?? r?.review_text ?? '',
    author: r?.author?.name ?? r?.author ?? r?.user_name ?? r?.student_Name ?? 'ผู้ใช้',
    rating: r?.rating ?? r?.score ?? null,
    date: r?.created_at ?? r?.date ?? r?.fr_Date ?? null,
  }
}

// โหลดรีวิวทั้งหมด
async function fetchAllReviews() {
  if (!subjectId) {
    errorMsg.value = 'ไม่มี subjectId'
    return
  }

  loading.value = true
  errorMsg.value = ''
  comments.value = []

  try {
    const url = `${API_URL}/subjects/${encodeURIComponent(subjectId)}/reviews`
    const res = await fetch(url, {
      method: 'GET',
      headers: authHeaders()
    })
    // อ่าน json (หรือ null ถ้าไม่ใช่ json)
    const j = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(j?.message || res.statusText || 'Request failed')
    }

    // ถ้า backend คืนชื่อวิชา ก็อัปเดต
    if (j?.subjectName) subjectName.value = j.subjectName

    // หา array ของรีวิว: รองรับทั้ง { reviews: [...] } หรือ [...direct array...]
    const list = Array.isArray(j?.reviews) ? j.reviews : (Array.isArray(j) ? j : (Array.isArray(j?.items) ? j.items : []))
    comments.value = list.map(normalize)
  } catch (e) {
    console.error('โหลดคอมเมนต์ไม่สำเร็จ', e)
    errorMsg.value = e?.message || 'โหลดคอมเมนต์ไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(fetchAllReviews)

function back() {
  router.back()
}
</script>

<template>
    <Layout>
        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
                <div class="text-2xl font-bold">รีวิวจากรุ่นพี่</div>
                <button class="btn btn-active" @click="back">ย้อนกลับ</button>
            </div>

            <div class=" bg-base-200/70 rounded-4xl py-5 shadow">
                <div class="ml-13">
                    <div class="text-xl font-bold">
                        วิชา {{ subjectName }}
                    </div>

                    <div v-if="loading" class="p-4">กำลังโหลดคอมเมนต์…</div>
                    <div v-else-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

                    <div v-else>
                        <div class="mb-2 text-sm opacity-70">ทั้งหมด {{ comments.length }} คอมเมนต์</div>

                        <div v-if="!comments.length" class="opacity-60">ยังไม่มีคอมเมนต์สำหรับวิชานี้</div>

                        <div v-else class="space-y-3">
                            <div v-for="c in comments" :key="c.id" class="chat chat-start">
                                <div class="chat-bubble">
                                    <!-- <div class="flex items-center justify-between">
                                    <div class="text-sm">
                                        <span v-if="c.rating">★ {{ c.rating }}</span>
                                        <span v-if="c.date" class="ml-2">{{ c.date }}</span>
                                    </div>
                                </div> -->
                                    <p class="text-base whitespace-pre-wrap">{{ c.text }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </Layout>
</template>
