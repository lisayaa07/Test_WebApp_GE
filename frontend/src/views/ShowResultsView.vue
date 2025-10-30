<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const results = ref([])

onMounted(() => {
  try {
    const queryResults = route.query.results
    results.value = queryResults ? JSON.parse(queryResults) : []
    console.log('📦 ผลลัพธ์ที่ได้รับ:', results.value)
  } catch (err) {
    console.error('❌ อ่านผลลัพธ์ไม่สำเร็จ:', err)
  }
})
</script>

<template>
  <section class="p-8">
    <h1 class="text-2xl font-bold mb-6">📊 ผลลัพธ์การคำนวณ</h1>

    <div v-if="!results.length" class="text-gray-500">
      ไม่มีข้อมูลผลลัพธ์
    </div>

    <div v-else>
      <div
        v-for="(r, index) in results"
        :key="r.subject_ID || index"
        class="p-4 mb-4 bg-base-200 rounded-lg shadow"
      >
        <h2 class="text-lg font-semibold">
          {{ r.subject_ID }} - {{ r.subject_Name }}
        </h2>
        <p>กลุ่ม: {{ r.group_type_name }}</p>
        <p>ความเหมือน: {{ r.similarity }}%</p>
        <p>เกรดเฉลี่ย: {{ r.grade_Name }}</p>
        <p class="text-sm mt-1 text-gray-600 italic">{{ r.review }}</p>
      </div>
    </div>
  </section>
</template>
