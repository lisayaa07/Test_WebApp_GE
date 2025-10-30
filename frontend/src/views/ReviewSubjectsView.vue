<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '@/layout/Layout.vue'
import api from '@/api/api.js'

const route = useRoute()
const router = useRouter()

const subjectId = ref(route.params.id)
const subjectName = ref(route.query.name || 'ไม่ระบุชื่อวิชา')
const reviews = ref([])
const loading = ref(true)
const errorMsg = ref('')

async function fetchReviews() {
  try {
    const res = await api.get(`/reviews/${subjectId.value}`)
    if (!res?.data?.ok) throw new Error(res.data?.message || 'โหลดข้อมูลไม่สำเร็จ')
    reviews.value = Array.isArray(res.data.reviews) ? res.data.reviews : []
  } catch (err) {
    errorMsg.value = err.message || 'Request failed'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(fetchReviews)
</script>

<template>
  <Layout>
    <div class="bg-[#6495ED]/35 p-6 rounded-3xl mt-10 mx-3 shadow">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-[#192F4E]">
          รีวิวจากรุ่นพี่
        </h1>
        <button
          @click="goBack"
          class="btn bg-pink-300 hover:bg-pink-500 text-white rounded-full px-6 py-2"
        >
          🔙 ย้อนกลับ
        </button>
      </div>

      <div class="text-2xl font-semibold mb-4 text-gray-700">
        วิชา {{ subjectName }}
      </div>

      <!-- กำลังโหลด -->
      <div v-if="loading" class="text-center text-lg text-gray-500 py-8">
        กำลังโหลดข้อมูล...
      </div>

      <!-- แสดง error -->
      <div v-else-if="errorMsg" class="alert alert-error text-center">
        {{ errorMsg }}
      </div>

      <!-- ไม่มีรีวิว -->
      <div
        v-else-if="reviews.length === 0"
        class="text-center text-gray-600 bg-white rounded-2xl p-8"
      >
        ยังไม่มีรีวิวสำหรับรายวิชานี้
      </div>

      <!-- มีรีวิว -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div
          v-for="(r, i) in reviews"
          :key="r.id || i"
          class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-[1.01]"
        >
          <div class="text-lg text-gray-800 leading-relaxed">
            “{{ r.text || '-' }}”
          </div>

          <div class="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <span class="badge badge-outline">เกรดที่ได้: {{ r.grade || '-' }}</span>
            <span class="badge badge-outline">คณะ: {{ r.faculty || '-' }}</span>
            <span class="badge badge-outline">ชั้นปี: {{ r.level || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
