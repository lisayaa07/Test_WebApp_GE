<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/api.js'

const router = useRouter()

// ✅ เก็บค่าที่ผู้ใช้เลือกไว้
const formData = ref({
  interestd: [],
  groupwork: '',
  solowork: '',
  exam: '',
  attendance: '',
  instruction: '',
  present: '',
  experience: '',
  challenge: '',
  time: '',
  group_types: []
})

// ✅ ฟังก์ชันกดปุ่ม "คำนวณ"
async function calculateResult() {
  try {
    console.log('📤 ส่งข้อมูลไปคำนวณ:', formData.value)

    const res = await api.post('/cbr-match', formData.value)
    console.log('📥 ได้ผลลัพธ์:', res.data)

    // ✅ ถ้ามีผลลัพธ์
    if (res.data?.ok && res.data.top?.length) {
      router.push({
        name: 'showresults',
        query: { results: JSON.stringify(res.data.top) }
      })
    } else {
      alert('ไม่พบผลลัพธ์ที่เหมาะสม')
    }
  } catch (err) {
    console.error('❌ คำนวณไม่สำเร็จ:', err)
    alert('ไม่สามารถคำนวณได้ กรุณาลองใหม่')
  }
}
</script>

<template>
  <section class="p-8">
    <h1 class="text-2xl font-bold mb-6">🔍 ระบบคำนวณวิชาที่เหมาะสม</h1>

    <div class="grid gap-4">
      <!-- ตัวอย่างช่อง -->
      <div>
        <label class="block font-semibold mb-1">เลือกรูปแบบงานกลุ่ม</label>
        <select v-model="formData.groupwork" class="select select-bordered w-full max-w-xs">
          <option disabled value="">เลือก...</option>
          <option value="1">น้อย</option>
          <option value="2">ปานกลาง</option>
          <option value="3">มาก</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold mb-1">เลือกรูปแบบงานเดี่ยว</label>
        <select v-model="formData.solowork" class="select select-bordered w-full max-w-xs">
          <option disabled value="">เลือก...</option>
          <option value="1">น้อย</option>
          <option value="2">ปานกลาง</option>
          <option value="3">มาก</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold mb-1">เลือกระดับการสอบ</label>
        <select v-model="formData.exam" class="select select-bordered w-full max-w-xs">
          <option disabled value="">เลือก...</option>
          <option value="1">ง่าย</option>
          <option value="2">ปานกลาง</option>
          <option value="3">ยาก</option>
        </select>
      </div>

      <!-- ปุ่มคำนวณ -->
      <button
        class="btn btn-primary mt-6 w-48"
        @click="calculateResult"
      >
        คำนวณ
      </button>
    </div>
  </section>
</template>
