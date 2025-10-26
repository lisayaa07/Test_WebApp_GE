<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL || 'https://test-webapp-ge.onrender.com'
const router = useRouter()

// -------------------------
// 1) State สำหรับข้อมูลจาก backend
// -------------------------
const faculties = ref([])
const interestds = ref([])
const subjectGroups = ref([])
const grades = ref([])
const subjects = ref([])
const groupwork = ref([])
const soloWork = ref([])
const exam = ref([])
const attendance = ref([])
const instruction = ref([])
const present = ref([])
const experience = ref([])
const challenge = ref([])
const time = ref([])

// -------------------------
// 2) State สำหรับ v-model (ข้อมูลฟอร์ม)
// -------------------------
const studentId = ref('')
const selectedStudentLevel = ref('')
const selectedFaculty = ref('')
const selectedGrade = ref('')
const selectedInterestd = ref([])
const selectedSubjectGroup = ref('')
const selectedSubject = ref('')
const selectedGroupwork = ref('')
const selectedsolowork = ref('')
const selectedexam = ref('')
const selectedattendance = ref('')
const selectedinstruction = ref([])
const selectedpresent = ref('')
const selectedexperience = ref('')
const selectedchallenge = ref('')
const selectedtime = ref('')
const reviewText = ref('')
const selectedGroupType = ref('')

// -------------------------
// 3) UI State
// -------------------------
const loading = ref(false)
const submitLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// -------------------------
// 4) Helper functions
// -------------------------
function isNumberOnly(event) {
  if (!/[0-9]/.test(event.key)) event.preventDefault()
}

// โหลดรายวิชาตามกลุ่ม
watch(selectedGroupType, async (newGroupId) => {
  if (!newGroupId) {
    subjects.value = []
    return
  }

  try {
    const res = await fetch(`${API_URL}/subjects/${encodeURIComponent(newGroupId)}`, {
      method: 'GET',
      credentials: 'include'
    })
    const j = await res.json().catch(() => null)
    if (!res.ok) throw new Error(j?.message || res.statusText || 'โหลดรายวิชาล้มเหลว')
    subjects.value = Array.isArray(j) ? j : (j?.items ?? [])
  } catch (err) {
    console.error('โหลดรายวิชาไม่สำเร็จ:', err)
    subjects.value = []
  }
})

// โหลดข้อมูลตอน mount
onMounted(async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    const endpoints = [
      'faculty','interestd','subject-groups','grades',
      'groupwork','solowork','exam','attendance',
      'instruction','present','experience','challenge','time'
    ]
    const fetches = endpoints.map(p => fetch(`${API_URL}/${p}`, { credentials: 'include' }))
    const responses = await Promise.all(fetches)

    const parseSafe = async (r) => {
      const j = await r.json().catch(() => null)
      if (!r.ok) throw new Error(j?.message || r.statusText || 'Request failed')
      return j ?? []
    }

    faculties.value = await parseSafe(responses[0])
    interestds.value = await parseSafe(responses[1])
    subjectGroups.value = await parseSafe(responses[2])
    grades.value = await parseSafe(responses[3])
    groupwork.value = await parseSafe(responses[4])
    soloWork.value = await parseSafe(responses[5])
    exam.value = await parseSafe(responses[6])
    attendance.value = await parseSafe(responses[7])
    instruction.value = await parseSafe(responses[8])
    present.value = await parseSafe(responses[9])
    experience.value = await parseSafe(responses[10])
    challenge.value = await parseSafe(responses[11])
    time.value = await parseSafe(responses[12])

    // preload ค่า default จาก localStorage
    studentId.value = localStorage.getItem('student_ID') || ''
    selectedStudentLevel.value = localStorage.getItem('studentLevel') || ''
    selectedFaculty.value = localStorage.getItem('facultyId') || ''
  } catch (err) {
    console.error('โหลดข้อมูลไม่สำเร็จ:', err)
    errorMsg.value = err?.message || 'โหลดข้อมูลเริ่มต้นล้มเหลว'
  } finally {
    loading.value = false
  }
})

// -------------------------
// 5) resetForm: ล้างข้อมูลทุกช่อง
// -------------------------
function resetForm() {
  studentId.value = ''
  selectedStudentLevel.value = ''
  selectedFaculty.value = ''
  selectedInterestd.value = []
  selectedGroupType.value = ''
  selectedSubject.value = ''
  selectedGroupwork.value = ''
  selectedsolowork.value = ''
  selectedexam.value = ''
  selectedattendance.value = ''
  selectedinstruction.value = []
  selectedpresent.value = ''
  selectedexperience.value = ''
  selectedchallenge.value = ''
  selectedtime.value = ''
  selectedGrade.value = ''
  reviewText.value = ''
}

// -------------------------
// 6) onSubmit: กดปุ่ม Submit
// -------------------------
async function onSubmit() {
  // ✅ ตรวจ validation เบื้องต้น
//   if (!studentId.value) return alert('กรุณากรอกรหัสนิสิต')
//   if (!selectedStudentLevel.value) return alert('กรุณาเลือกชั้นปี')
//   if (!selectedFaculty.value) return alert('กรุณาเลือกคณะ')
//   if (!selectedGroupType.value) return alert('กรุณาเลือกหมวดวิชา')
//   if (!selectedSubject.value) return alert('กรุณาเลือกรายวิชา')

//   const payload = {
//     student_id: studentId.value,
//     subjectGroup: selectedGroupType.value,
//     student_level: selectedStudentLevel.value,
//     faculty: selectedFaculty.value,
//     interestd: Array.isArray(selectedInterestd.value)
//       ? selectedInterestd.value.join(',')
//       : selectedInterestd.value,
//     subject: selectedSubject.value,
//     groupwork: selectedGroupwork.value,
//     solowork: selectedsolowork.value,
//     exam: selectedexam.value,
//     attendance: selectedattendance.value,
//     instruction: Array.isArray(selectedinstruction.value)
//       ? selectedinstruction.value.join(',')
//       : selectedinstruction.value,
//     present: selectedpresent.value,
//     experience: selectedexperience.value,
//     challenge: selectedchallenge.value,
//     time: selectedtime.value,
//     grade: selectedGrade.value,
//     review: reviewText.value,
//   }

//   try {
//     submitLoading.value = true
//     errorMsg.value = ''
//     successMsg.value = ''

//     const res = await fetch(`${API_URL}/submit-form`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     })

//     const j = await res.json().catch(() => null)
//     if (!res.ok) throw new Error(j?.message || res.statusText || 'บันทึกไม่สำเร็จ')

//     // ✅ สำเร็จ
    successMsg.value = 'บันทึกรีวิวเรียบร้ล้ว!'
    resetForm() // ล้างค่าทั้งหมด
    // ✅ refresh หน้า review (เคลียร์ทุก v-model)
    router.replace({ name: '/allsubjects' })
//   } catch (err) {
//     console.error('submit error:', err)
//     errorMsg.value = err?.message || 'เกิดข้อผิดพลาดระหว่างบันทึก'
//     alert(errorMsg.value)
//   } finally {
//     submitLoading.value = false
//   }
}
</script>

<template>
    <Layout>
        <!-- <form class="p-6 space-y-6" @submit="onSubmit" @submit.prevent="handleSubmit"> -->
            <form class="p-6 space-y-6" >

            
            <!-- ปุ่ม submit -->
            <div class="text-center">
                <button type="submit" class="btn bg-blue-900 hover:bg-[#192F4E] text-white text-xl mt-3 p-6">Submit</button>
            </div>
        </form>
    </Layout>
</template>
