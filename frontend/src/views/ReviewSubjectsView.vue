<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '@/layout/Layout.vue'
import api from '@/api/api.js'

// ✅ ตัวแปรพื้นฐาน
const route = useRoute()
const router = useRouter()

const subjectId = ref(route.params.id)
const subjectName = ref(route.query.name || 'ไม่ระบุชื่อวิชา')

const reviews = ref([])
const loading = ref(true)
const errorMsg = ref('')

// ✅ ฟังก์ชันโหลดรีวิว
async function fetchReviews() {
  try {
    console.log(`📡 กำลังโหลดรีวิวของวิชา ${subjectId.value}`)
    const res = await api.get(`/reviews/${subjectId.value}`)

    if (!res?.data?.ok) throw new Error(res.data?.message || 'โหลดข้อมูลไม่สำเร็จ')

    reviews.value = Array.isArray(res.data.reviews) ? res.data.reviews : []
    console.log('✅ ได้รีวิวแล้ว:', reviews.value)
  } catch (err) {
    console.error('❌ โหลดรีวิวล้มเหลว:', err)
    errorMsg.value = err.message || 'Request failed'
  } finally {
    loading.value = false
  }
}

// ✅ กลับหน้าก่อนหน้า
function goBack() {
  router.back()
}

// ✅ โหลดเมื่อ component mount
onMounted(fetchReviews)
</script>

<template>
  <Layout>
    <div class="p-8 bg-[#f2f5fb] min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-[#192F4E]">รีวิวจากรุ่นพี่</h1>
        <button
          @click="goBack"
          class="btn bg-gray-200 hover:bg-gray-300 text-black rounded-full px-4 py-2"
        >
          ย้อนกลับ
        </button>
      </div>

      <h2 class="text-xl font-semibold mb-4">
        วิชา {{ subjectName }}
      </h2>

      <!-- กำลังโหลด -->
      <div v-if="loading" class="text-center text-lg text-gray-500">
        กำลังโหลดข้อมูล...
      </div>

      <!-- แสดง error -->
      <div v-else-if="errorMsg" class="bg-red-300 text-white p-4 rounded-xl text-center">
        {{ errorMsg }}
      </div>

      <!-- ไม่มีรีวิว -->
      <div
        v-else-if="reviews.length === 0"
        class="text-center text-gray-500 bg-white rounded-2xl p-6"
      >
        ยังไม่มีรีวิวสำหรับรายวิชานี้
      </div>

      <!-- มีรีวิว -->
      <div v-else class="space-y-4">
        <div
          v-for="(r, i) in reviews"
          :key="r.id || i"
          class="bg-white rounded-2xl shadow p-5 border border-blue-100"
        >
          <p class="text-lg font-medium text-gray-800">
            {{ r.text || '-' }}
          </p>
          <div class="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span class="badge badge-ghost">เกรด: {{ r.grade || '-' }}</span>
            <span class="badge badge-outline">คณะ: {{ r.faculty || '-' }}</span>
            <span class="badge badge-outline">ชั้นปี: {{ r.level || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
