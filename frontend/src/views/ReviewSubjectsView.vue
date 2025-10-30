<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import api from '@/api/api.js'

// ✅ ตัวแปรหลัก
const route = useRoute()
const router = useRouter()

const subjectId = ref(route.params.id)
const subjectName = ref(route.query.name || 'ไม่ระบุชื่อวิชา')

const reviews = ref([])
const loading = ref(true)
const errorMsg = ref('')

// ✅ โหลดข้อมูลรีวิวจาก backend
async function fetchReviews() {
  try {
    const res = await api.get(`/reviews/${subjectId.value}`)
    if (!res?.data?.ok) throw new Error(res.data?.message || 'โหลดข้อมูลไม่สำเร็จ')
    reviews.value = Array.isArray(res.data.reviews) ? res.data.reviews : []
  } catch (err) {
    console.error('❌ โหลดรีวิวล้มเหลว:', err)
    errorMsg.value = err.message || 'Request failed'
  } finally {
    loading.value = false
  }
}

// ✅ โหลดเมื่อ component mount
onMounted(fetchReviews)
</script>

<template>
  <Layout>
    <div class="bg-[#6495ED]/35 shadow p-6 rounded-3xl mt-10 mx-3">
      <h1 class="text-3xl font-bold text-black/70 mb-4">
        รีวิวจากรุ่นพี่
      </h1>

      <h2 class="text-2xl font-semibold mb-6 text-[#192F4E]">
        วิชา {{ subjectName }}
      </h2>

      <!-- โหลด -->
      <div v-if="loading" class="text-center text-gray-500 text-lg py-8">
        กำลังโหลดข้อมูล...
      </div>

      <!-- error -->
      <div v-else-if="errorMsg" class="alert alert-error text-center">
        {{ errorMsg }}
      </div>

      <!-- ไม่มีรีวิว -->
      <div
        v-else-if="!reviews.length"
        class="text-center opacity-60 py-6 bg-white/70 rounded-2xl"
      >
        ยังไม่มีรีวิวจากรุ่นพี่สำหรับรายวิชานี้
      </div>

      <!-- มีรีวิว -->
      <div v-else class="ml-5 mt-5">
        <div
          v-for="(r, i) in reviews"
          :key="r.id || i"
          class="bg-white/70 hover:bg-white/90 rounded-2xl p-6 mb-4 shadow transition"
        >
          <p class="text-lg text-gray-800 leading-relaxed">
            “{{ r.text || '-' }}”
          </p>
        </div>
      </div>

      <!-- ปุ่มย้อนกลับ -->
      <div class="text-center mt-8">
        <RouterLink
          to="/showresults"
          class="btn bg-pink-300 hover:bg-pink-500 text-white"
        >
         ย้อนกลับ
        </RouterLink>
      </div>
    </div>
  </Layout>
</template>
