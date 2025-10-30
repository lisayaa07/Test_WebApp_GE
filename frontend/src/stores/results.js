
import { defineStore } from 'pinia'

export const useResultsStore = defineStore('results', {
  state: () => ({
    results: [],         // เก็บผลลัพธ์รายวิชา (จาก backend)
    resultGroups: [],    // เก็บกลุ่มวิชาที่ backend ส่งมา
    errorMsg: '',        // ข้อความ error (ถ้ามี)
  }),

  actions: {
    // ✅ เซ็ตค่าผลลัพธ์หลังคำนวณเสร็จ
    setResults(payload) {
      this.results = payload.results || []
      this.resultGroups = payload.resultGroups || []
      this.errorMsg = ''
    },

    // ✅ ตั้งค่า error
    setError(msg) {
      this.errorMsg = msg || 'เกิดข้อผิดพลาด'
    },

    // ✅ รีเซ็ตทั้งหมด (ใช้กับปุ่ม “เริ่มทำใหม่”)
    $reset() {
      this.results = []
      this.resultGroups = []
      this.errorMsg = ''
    },
  },
})
