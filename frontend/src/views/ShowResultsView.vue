<script setup>
import { onMounted, ref } from 'vue'
import { useResultsStore } from '@/stores/results'
import Layout from '@/layout/Layout.vue'

const resultsStore = useResultsStore()

const results = ref([])
const resultGroups = ref([])

onMounted(() => {
  // ✅ ดึงข้อมูลจาก Pinia store
  results.value = resultsStore.results || []
  resultGroups.value = resultsStore.resultGroups || []

  console.log('📦 ผลลัพธ์ทั้งหมด:', results.value)
  console.log('📦 กลุ่มวิชา:', resultGroups.value)
})
</script>

<template>
  <Layout>
    <section class="p-6">
      <h1 class="text-2xl font-bold mb-6">📊 ผลลัพธ์การวิเคราะห์</h1>

      <div v-if="!results.length">
        <p class="text-gray-500 text-lg">ไม่พบข้อมูลผลลัพธ์ กรุณากลับไปทำแบบประเมินใหม่</p>
        <router-link to="/matchcase" class="btn btn-primary mt-4">ย้อนกลับ</router-link>
      </div>

      <div v-else>
        <!-- ✅ แสดงผลรายวิชา -->
        <div
          v-for="(r, idx) in results"
          :key="r.subject_ID || idx"
          class="p-4 mb-4 bg-blue-100 rounded-xl shadow hover:bg-blue-200 transition"
        >
          <h2 class="text-xl font-semibold text-blue-900">
            {{ r.subject_ID }} - {{ r.subject_Name }}
          </h2>
          <p class="text-gray-700">
            ความเหมือน: <b>{{ (r.similarity ?? 0).toFixed(2) }}%</b>
          </p>
          <p class="text-gray-700">หมวดวิชา: {{ r.group_type_name || '-' }}</p>
          <p class="text-gray-700">เกรดเฉลี่ย: {{ r.grade_Name || '-' }}</p>
          <p v-if="r.review" class="text-gray-600 italic mt-1">
            "{{ r.review }}"
          </p>
        </div>

        <div class="mt-6">
          <router-link to="/matchcase" class="btn btn-outline btn-primary">🔁 ทำใหม่อีกครั้ง</router-link>
        </div>
      </div>
    </section>
  </Layout>
</template>
