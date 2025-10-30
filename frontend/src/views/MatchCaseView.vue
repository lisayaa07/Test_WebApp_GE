<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResultsStore } from '@/stores/results'


import Layout from '@/layout/Layout.vue'
import api from '@/api/api.js'




const router = useRouter()
const resultsStore = useResultsStore()

const userCase = ref(null)


/* ---------- state: คำตอบผู้ใช้ ---------- */


// ข้อมูลที่โหลดจาก backend
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
const solowork = ref([])



// ตัวแปรที่ผูกกับ v-model
const studentId = ref('')
const selectedStudentLevel = ref('null')
const selectedFaculty = ref('null')
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

const selectedGroupTypes = ref([])

const resultGroups = ref([])

/* ---------- state: ผลลัพธ์/โหลด/เออเรอร์ ---------- */
const loading = ref(false)
const errorMsg = ref('')
const results = ref([])


/* ---------- helpers ---------- */

// robust: เลือกคีย์คะแนนที่มีอยู่จริง (กันชื่อไม่ตรง)
function pickSimilarity(obj) {
    const keys = ['similarity', 'similarityPct', 'score', 'percent', 'pct', 'Similarity']
    for (const k of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k]
    }
    return null
}

// ฟังก์ชันช่วยแปลงเลขเป็น %
function pct(v) {
    if (v == null) return '-'
    const num = Number(v)
    if (!Number.isFinite(num)) return '-'
    const p = num > 1 ? num : num * 100 // รองรับกรณี backend ส่ง 0–1
    return p.toFixed(2) + '%'
}


function normalizeGroups(data) {
    const arr = Array.isArray(data) ? data : (data?.items ?? [])
    return arr
        .map(x => ({
            GroupType_ID: x.GroupType_ID ?? x.group_type_id ?? x.groupTypeId ?? x.id,
            GroupType_Name: x.GroupType_Name ?? x.group_type_name ?? x.groupTypeName ?? x.name,
        }))
        .filter(x => x.GroupType_ID && x.GroupType_Name)
}


//โหลดข้อมูลตอน mount
async function onSubmit() {
  errorMsg.value = ''

  const missingFields = []
  if (selectedInterestd.value.length === 0) missingFields.push('ความสนใจ')
  if (selectedGroupTypes.value.length === 0) missingFields.push('หมวดวิชา')
  if (!selectedGroupwork.value) missingFields.push('งานกลุ่ม')
  if (!selectedsolowork.value) missingFields.push('งานเดี่ยว')
  if (!selectedexam.value) missingFields.push('การสอบ')
  if (!selectedattendance.value) missingFields.push('การเช็คชื่อ')
  if (selectedinstruction.value.length === 0) missingFields.push('รูปแบบการสอน')
  if (!selectedpresent.value) missingFields.push('การนำเสนอ')
  if (!selectedexperience.value) missingFields.push('ประสบการณ์ใหม่ๆ')
  if (!selectedchallenge.value) missingFields.push('ความยากง่าย')
  if (!selectedtime.value) missingFields.push('ช่วงเวลา')
  if (missingFields.length > 0) {
    errorMsg.value = `กรุณาตอบคำถามให้ครบ: ${missingFields.join(', ')}`
    return
  }

  loading.value = true
  results.value = []

  const toD = (v) => /^\d+$/.test(String(v)) ? `D${v}` : String(v)
  const instructionTokens = Array.isArray(selectedinstruction.value)
    ? selectedinstruction.value.map(toD)
    : []

  try {
    const payload = {
      interestd: selectedInterestd.value,
      groupwork: selectedGroupwork.value,
      solowork: selectedsolowork.value,
      exam: selectedexam.value,
      attendance: selectedattendance.value,
      instructions: instructionTokens,
      instruction: instructionTokens[0] || '',
      instruction_CSV: instructionTokens.join(','),
      present: selectedpresent.value,
      experience: selectedexperience.value,
      challenge: selectedchallenge.value,
      time: selectedtime.value,
      group_types: selectedGroupTypes.value,
      debug: true,
    }

    console.log('🚀 ส่ง payload ไป /cbr-match:', payload)

    // ✅ ใช้ instance api ที่มี cookie
    const { data } = await api.post('/cbr-match', payload, { withCredentials: true })

    if (!data.ok) {
      throw new Error(data.message || 'ไม่พบข้อมูลที่ตรง')
    }

    resultGroups.value = Array.isArray(data.groups) ? data.groups : []
    const raw = (Array.isArray(data.top) && data.top.length ? data.top : data.all) || []
    results.value = raw.map(r => ({
      ...r,
      similarity: Number(r.similarity ?? 0)
    }))

    resultsStore.setResults({ resultGroups: resultGroups.value, results: results.value, payload })
    router.push({ name: 'showresults' })
  } catch (e) {
    console.error('❌ /cbr-match error:', e.response?.data || e)
    if (e.response?.status === 401) {
      errorMsg.value = 'กรุณาเข้าสู่ระบบใหม่ (Session หมดอายุ)'
      router.push({ name: 'login' })
    } else {
      errorMsg.value = e?.response?.data?.message || e.message || 'เกิดข้อผิดพลาด'
    }
  } finally {
    loading.value = false
  }
}

</script>

<template>
    <Layout>

        <form class="p-6 space-y-6" @submit.prevent="onSubmit">
            <!-- ความสนใจ -->
            <div class="bg-[#6495ED]/50 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h2 class="font-bold mb-2">ความสนใจ (เลือกได้มากกว่า 1 คำคอบ)</h2>
                    <label class="block" v-for="it in interestds" :key="it.interest_ID"
                        :for="`interest-${it.interest_ID}`">
                        <input type="checkbox"
                            class="checkbox checkbox-sm border-blue-500 bg-blue-300 checked:border-blue-700 checked:bg-blue-600"
                            :id="`interest-${it.interest_ID}`" :value="String(it.interest_ID)"
                            v-model="selectedInterestd">
                        {{ it.interest_Name }}
                    </label>
                </div>
                <div>
                    <h2 class="font-bold mb-2">หมวดวิชาศึกษาทั่วไปที่นิสิตจะลงเรียน</h2>
                    <label class="block" v-for="g in subjectGroups" :key="g.GroupType_ID">
                        <input type="checkbox"
                            class="checkbox checkbox-sm border-blue-500 bg-blue-300 checked:border-blue-700 checked:bg-blue-600"
                            :value="g.GroupType_ID" v-model="selectedGroupTypes">
                        {{ g.GroupType_Name }}
                    </label>
                </div>
            </div>

            <!-- งานกลุ่ม -->
            <div class="bg-[#6495ED]/35 p-6 rounded-3xl">
                <h2 class="font-bold mb-3">เลือกคำตอบที่นิสิตคิดว่าตรงกับตนเองมากที่สุด</h2>
                <fieldset class="mb-4 pl-5">
                    <legend>
                        1. นิสิตต้องการให้มีการมอบหมาย
                        <a class="underline decoration-red-500 text-red-500">งานกลุ่ม</a>ในรายวิชาอย่างไร
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in groupwork" :key="o.groupwork_ID">
                            <input type="radio" name="groupwork"
                                class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                                :value="o.groupwork_ID" v-model="selectedGroupwork">
                            {{ o.groupwork_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#ADD8E6]/60 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        2. นิสิตต้องการให้มีการมอบหมาย
                        <a class="underline decoration-red-500 text-red-500">งานเดี่ยว</a>ในรายวิชาอย่างไร
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in soloWork" :key="o.solowork_ID">
                            <input type="radio" name="solowork"
                                class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600 bg-white/50"
                                :value="o.solowork_ID" v-model="selectedsolowork">
                            {{ o.solowork_Name }}
                        </label>
                    </div>

                </fieldset>
            </div>

            <div class="bg-[#6495ED]/50 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        3.นิสิตต้องการให้มีรูปแบบ
                        <a class="underline decoration-red-500 text-red-500">การสอบ</a> แบบใด
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in exam" :key="o.exam_ID">
                            <input type="radio" name="exam"
                                class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                                :value="o.exam_ID" v-model="selectedexam">
                            {{ o.exam_Name }}
                        </label>
                    </div>

                </fieldset>

            </div>

            <div class="bg-[#6495ED]/35 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        4.นิสิตต้องการให้มีการ
                        <a class="underline decoration-red-500 text-red-500">เช็คชื่อ</a> เข้าห้องเรียนอย่างไร
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in attendance" :key="o.attendance_ID">
                            <input type="radio" name="attendance"
                                class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                                :value="o.attendance_ID" v-model="selectedattendance">
                            {{ o.attendance_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>


            <div class="bg-[#ADD8E6]/60 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        5.นิสิตต้องการให้รูปแบบ
                        <a class="underline decoration-red-500 text-red-500">การสอน</a> เป็นอย่างไร (ตอบได้มากกว่า 1
                        ข้อ)
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in instruction" :key="o.instruction_ID"
                            :for="`inst-${o.instruction_ID}`">
                            <input type="checkbox"
                                class="checkbox checkbox-sm border-blue-500 bg-blue-300 checked:border-blue-700 checked:bg-blue-600"
                                :id="`inst-${o.instruction_ID}`" :value="String(o.instruction_ID)"
                                v-model="selectedinstruction">
                            {{ o.instruction_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>


            <!-- 6. นำเสนอ -->
            <div class="bg-[#6495ED]/50 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        6.นิสิตชอบให้มีการ
                        <a class="underline decoration-red-500 text-red-500">นำเสนอหน้าชั้นเรียน</a> มากน้อยเพียงใด
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in present" :key="o.present_ID">
                            <input type="radio" name="present"
                                class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                                :value="o.present_ID" v-model="selectedpresent">
                            {{ o.present_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>


            <div class="bg-[#6495ED]/35 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        7.นิสิตต้องการ
                        <a class="underline decoration-red-500 text-red-500">ประสบการณ์ใหม่ๆ</a> จากวิชานี้หรือไม่
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in experience" :key="o.experience_ID">
                            <input type="radio" name="experience" class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600
                            " :value="o.experience_ID" v-model="selectedexperience">
                            {{ o.experience_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#ADD8E6]/60 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        8.ระดับ
                        <a class="underline decoration-red-500 text-red-500">ความยากง่าย</a> ที่นิสิตต้องการ
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in challenge" :key="o.challenge_ID">
                            <input type="radio" name="challenge"
                                class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                                :value="o.challenge_ID" v-model="selectedchallenge">
                            {{ o.challenge_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>

            <div class="bg-[#6495ED]/50 p-6 rounded-3xl">
                <fieldset class="pl-5">
                    <legend>
                        9.
                        <a class="underline decoration-red-500 text-red-500">ช่วงเวลา</a>
                        ในการเรียนที่นิสิตต้องการ(ช่วงเช้า = 8.00-11.50 , ช่วงบ่าย = 13.00-16.50)
                        <a class="text-red-500">*</a>
                    </legend>
                    <div class="pl-5">
                        <label class="block" v-for="o in time" :key="o.time_ID">
                            <input type="radio" name="time"
                                class="radio radio-sm bg-blue-100 border-blue-500 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                                :value="o.time_ID" v-model="selectedtime">
                            {{ o.time_Name }}
                        </label>
                    </div>
                </fieldset>
            </div>


            <!-- ปุ่ม submit -->
            <div class="text-center">
                <div v-if="errorMsg" class="mb-4 text-center text-red-600 font-bold"> 
                    {{errorMsg }} 
                </div> 
                <button type="submit"
                    class="btn bg-blue-900 hover:bg-[#192F4E] text-white text-xl mt-3 p-6"> 
                    วิเคราะห์
                </button>
            </div>

        </form>
    </Layout>
</template>
