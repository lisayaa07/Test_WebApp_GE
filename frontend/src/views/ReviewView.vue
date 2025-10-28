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
  if (!studentId.value) return alert('กรุณากรอกรหัสนิสิต')
  if (!selectedStudentLevel.value) return alert('กรุณาเลือกชั้นปี')
  if (!selectedFaculty.value) return alert('กรุณาเลือกคณะ')
  if (!selectedGroupType.value) return alert('กรุณาเลือกหมวดวิชา')
  if (!selectedSubject.value) return alert('กรุณาเลือกรายวิชา')

  const payload = {
    student_id: studentId.value,
    subjectGroup: selectedGroupType.value,
    student_level: selectedStudentLevel.value,
    faculty: selectedFaculty.value,
    interestd: Array.isArray(selectedInterestd.value)
      ? selectedInterestd.value.join(',')
      : selectedInterestd.value,
    subject: selectedSubject.value,
    groupwork: selectedGroupwork.value,
    solowork: selectedsolowork.value,
    exam: selectedexam.value,
    attendance: selectedattendance.value,
    instruction: Array.isArray(selectedinstruction.value)
      ? selectedinstruction.value.join(',')
      : selectedinstruction.value,
    present: selectedpresent.value,
    experience: selectedexperience.value,
    challenge: selectedchallenge.value,
    time: selectedtime.value,
    grade: selectedGrade.value,
    review: reviewText.value,
  }

  try {
    submitLoading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    const res = await fetch(`${API_URL}/submit-form`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const j = await res.json().catch(() => null)
    if (!res.ok) throw new Error(j?.message || res.statusText || 'บันทึกไม่สำเร็จ')

    // ✅ สำเร็จ
    successMsg.value = 'บันทึกรีวิวเรียบร้อยแล้ว!'
    resetForm() // ล้างค่าทั้งหมด
    // ✅ refresh หน้า review (เคลียร์ทุก v-model)
    router.push({ name: 'review' })

  } catch (err) {
    console.error('submit error:', err)
    errorMsg.value = err?.message || 'เกิดข้อผิดพลาดระหว่างบันทึก'
    alert(errorMsg.value)
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
    <Layout>
        <form class="p-6 space-y-6" @submit="onSubmit">

            <div class="flex gap-10">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend text-lg">รหัสนิสิต</legend>
                    <input type="text" v-model="studentId" class="input input-neutral" placeholder="กรอกรหัสนิสิต" />
                </fieldset>

                <!-- ชั้นปี -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend text-lg">ชั้นปี</legend>
                    <select class="select select-neutral" v-model="selectedStudentLevel">
                        <option disabled value="">เลือกชั้นปี</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </fieldset>

                <!-- คณะ -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend text-lg">คณะ</legend>
                    <select class="select select-neutral" v-model="selectedFaculty">
                        <option disabled value="">เลือกคณะ</option>
                        <option v-for="f in faculties" :key="f.faculty_ID" :value="f.faculty_ID">
                            {{ f.faculty_Name }}
                        </option>
                    </select>
                </fieldset>
            </div>


            <!-- ความสนใจ -->
            <div class="bg-[#6495ED]/50 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h2 class="font-bold mb-2">ความสนใจ(สามารถเลือกได้มากว่า 1 คำตอบ)</h2>

                    <label class="block" v-for="item in interestds" :key="item.interest_ID">
                        <input type="checkbox"
                            class="checkbox checkbox-sm border-blue-500 bg-blue-300 checked:border-blue-700 checked:bg-blue-600"
                            :value="item.interest_ID" v-model="selectedInterestd" />
                        {{ item.interest_Name }}
                    </label>
                </div>
                <div>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend text-lg">หมวดวิชา (กลุ่มวิชา)</legend>
                        <select class="select select-neutral w-full" v-model="selectedGroupType">
                            <option disabled value="">-- เลือกกลุ่มวิชา --</option>
                            <option v-for="group in subjectGroups" :key="group.GroupType_ID"
                                :value="group.GroupType_ID">
                                {{ group.GroupType_Name }}
                            </option>
                        </select>
                    </fieldset>

                    <fieldset class="fieldset mt-4">
                        <legend class="fieldset-legend text-lg">รายวิชา</legend>
                        <select class="select select-neutral w-full" v-model="selectedSubject">
                            <option disabled value="">-- เลือกรายวิชา --</option>
                            <option v-for="subject in subjects" :key="subject.subject_ID" :value="subject.subject_ID">
                                {{ subject.subject_Name }}
                            </option>
                        </select>
                    </fieldset>



                    <label class="block mt-4">
                        <span class="font-semibold">เกรดที่ได้</span>
                        <select v-model="selectedGrade" class="select select-neutral w-full mt-3">
                            <option disabled value="">กรุณาระบุ</option>
                            <option v-for="grades in grades" :key="grades.grade_ID" :value="grades.grade_ID">
                                {{ grades.grade_Name }}
                            </option>

                        </select>
                    </label>
                </div>
            </div>

            <!-- งานกลุ่ม -->
            <div class="bg-[#6495ED]/35 p-6 rounded-3xl">
                <h2 class="font-bold mb-3">เลือกคำตอบที่นิสิตคิดว่าตรงกับตนเองมากที่สุด</h2>
                <fieldset class="mb-4 pl-5">
                    <legend>
                        1. มีการมอบหมาย 
                        <span style="color:red;">งานกลุ่ม</span> 
                        ในรายวิชาอย่างไร <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5 space-y-2">
                        <label class="block" v-for="item in groupwork" :key="item.groupwork_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="groupwork"
                                :value="item.groupwork_ID" v-model="selectedGroupwork">
                            {{ item.groupwork_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#ADD8E6]/60 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        2. มีการมอบหมาย 
                        <span style="color:red;">งานเดี่ยว</span> 
                        ในรายวิชาอย่างไร <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="item in soloWork" :key="item.solowork_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="solowork"
                                :value="item.solowork_ID" v-model="selectedsolowork">
                            {{ item.solowork_Name }}
                        </label>

                    </div>
                </fieldset>
            </div>

            <div class="bg-[#6495ED]/50 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        3.นิสิตต้องการให้มีรูปแบบ
                        <span style="color:red;">การสอบ</span> แบบใด 
                        <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="item in exam" :key="item.exam_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="exam"
                                :value="item.exam_ID" v-model="selectedexam">
                            {{ item.exam_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#6495ED]/35 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        4.นิสิตต้องการให้มีการ <span style="color:red;">เช็คชื่อ</span> เข้าห้องเรียนอย่างไร 
                        <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="item in attendance" :key="item.attendance_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="attendance"
                                :value="item.attendance_ID" v-model="selectedattendance">
                            {{ item.attendance_Name }}

                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#ADD8E6]/60 p-6 rounded-3xl">
                <fieldset class="pl-5 space-y-2">
                    <legend>
                    5.นิสิตต้องการให้รูปแบบ <span style="color:red;">การสอน</span> เป็นอย่างไร (ตอบได้มากกว่า 1 ข้อ)
                    <span style="color:red;">*</span>
                    </legend>

                    <div class="pl-5">
                    <label
                        class="flex items-center gap-2 py-1"
                        v-for="item in instruction"
                        :key="item.instruction_ID"
                        :for="`inst-${item.instruction_ID}`"
                    >
                        <input
                        type="checkbox"
                        class="checkbox checkbox-sm border-blue-500 bg-blue-300 checked:border-blue-700 checked:bg-blue-600"
                        :id="`inst-${item.instruction_ID}`"
                        :value="item.instruction_ID"
                        v-model="selectedinstruction"     
                        />
                        <span>{{ item.instruction_Name }}</span>
                    </label>
                    </div>
                </fieldset>
            </div>


            <div class="bg-[#6495ED]/50 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        6.นิสิตชอบให้มีการ
                        <span style="color:red;">นำเสนอหน้าชั้นเรียน</span> มากน้อยเพียงใด
                        <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="item in present" :key="item.present_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="present"
                                :value="item.present_ID" v-model="selectedpresent">
                            {{ item.present_Name }}

                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#6495ED]/35 p-6 rounded-3xl">
                <fieldset class="pl-5">
                   <legend>
                        7.นิสิตต้องการ
                        <span style="color:red;">ประสบการณ์ใหม่ๆ</span> จากวิชานี้หรือไม่
                        <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="item in experience" :key="item.experience_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="experience"
                                :value="item.experience_ID" v-model="selectedexperience">
                            {{ item.experience_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#ADD8E6]/60 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        8.ระดับ
                        <span style="color:red;">ความยากง่าย</span> ที่นิสิตต้องการ 
                        <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="item in challenge" :key="item.challenge_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="challenge"
                                :value="item.challenge_ID" v-model="selectedchallenge">
                            {{ item.challenge_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#6495ED]/50 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                       9.
                        <span style="color:red;">ช่วงเวลา</span> ในการเรียนที่นิสิตต้องการ(ช่วงเช้า = 8.00-11.50 , ช่วงบ่าย = 13.00-16.50)
                        <span style="color:red;">*</span>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="item in time" :key="item.time_ID">
                            <input type="radio" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600" name="time"
                                :value="item.time_ID" v-model="selectedtime">
                            {{ item.time_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#6495ED]/35 p-6 rounded-3xl">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend text-lg">ความรู้สึกที่มีต่อรายวิชานี้</legend>
                    <textarea v-model="reviewText" class="textarea textarea-neutral h-24 w-full"
                        placeholder="กรุณากรอกความรู้สึก"></textarea>

                </fieldset>
            </div>

            <!-- ปุ่ม submit -->
            <div class="text-center">
                <button type="submit" class="btn bg-blue-900 hover:bg-[#192F4E] text-white text-xl mt-3 p-6">Submit</button>
            </div>
        </form>
    </Layout>
</template>
