<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import pro from '/Photo/pro.png'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ฟอร์ม
const student_ID = ref('')
const email = ref('')
const password = ref('')
const student_Name = ref('')
const student_level = ref('')
const faculty = ref('')

// ข้อมูลคณะ
const faculties = ref([])

// สถานะ
const loading = ref(false)
const errorMsg = ref('')
const okMsg = ref('')

// ตรวจอีเมล @nu.ac.th
function isNuEmail(v) {
  return typeof v === 'string' && v.toLowerCase().endsWith('@nu.ac.th')
}

// โหลดรายชื่อคณะ
onMounted(async () => {
  try {
    const res = await fetch(`${API_URL}/faculty`)
    const j = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(j?.message || res.statusText || 'โหลดรายชื่อคณะไม่สำเร็จ')
    }
    faculties.value = Array.isArray(j) ? j : (j?.items ?? [])
  } catch (e) {
    console.error(e)
    errorMsg.value = 'โหลดรายชื่อคณะไม่สำเร็จ'
  }
})

const onSubmit = async () => {
  errorMsg.value = ''
  okMsg.value = ''
  loading.value = true
  try {
    const emailClean = (email.value || '').trim().toLowerCase()

    if (!isNuEmail(emailClean)) {
      throw new Error('โปรดใช้อีเมลที่ลงท้ายด้วย @nu.ac.th เท่านั้น')
    }
    if (!student_ID.value.trim()) {
      throw new Error('กรอก Student ID')
    }
    if (!password.value) {
      throw new Error('กรอกรหัสผ่าน')
    }
    if (!student_Name.value.trim()) {
      throw new Error('กรอกชื่อ-สกุล')
    }
    if (!student_level.value) {
      throw new Error('เลือกชั้นปี')
    }
    if (!faculty.value) {
      throw new Error('เลือกคณะ')
    }

    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // ให้ตรงกับ backend ของคุณ
        student_ID: student_ID.value.trim(),
        email: emailClean,
        password: password.value,
        student_Name: student_Name.value.trim(),
        student_level: student_level.value,
        faculty: faculty.value,
      }),
    })

    const ct = res.headers.get('content-type') || ''
    const raw = await res.text()
    const data = ct.includes('application/json') ? JSON.parse(raw || '{}') : {}

    if (!res.ok || (typeof data.ok !== 'undefined' && !data.ok)) {
      throw new Error(data.message || raw.slice(0, 300) || 'สมัครบัญชีไม่สำเร็จ')
    }

    okMsg.value = 'สมัครสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ…'
    setTimeout(() => router.push({ name: 'login' }), 800)
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>



<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F6E8C8]">
    <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-[#FBE7B2] rounded-[28px] shadow-xl overflow-hidden">
      <!-- ซ้าย -->
      <div class="relative p-6 lg:p-10 bg-[#F7C86A]">
        <div class="absolute inset-0 bg-gradient-to-br from-[#FAD98C] via-[#F7C86A] to-[#F2B45E]" aria-hidden="true" />
        <div class="relative h-full flex flex-col items-center justify-center text-center">
          <h1 class="text-5xl lg:text-6xl font-black text-[#9A5A00] drop-shadow-sm mb-6">Welcome</h1>
          <img :src="pro" alt="students" class="w-11/12 max-w-[520px] rounded-2xl shadow-md" />
        </div>
      </div>

      <!-- ขวา: ฟอร์มสมัคร -->
      <div class="bg-[#FBEFD4] flex items-center">
        <form @submit="onSubmit" class="w-full px-8 lg:px-12 py-10">
          <h2 class="text-3xl font-extrabold text-[#2E2A1F] mb-6">Sign up</h2>

          <div class="grid grid-cols-1 gap-4">
            <!-- 1) Email -->
            <label class="block">
              <span class="text-sm text-[#6B614B]">Email</span>
              <input v-model="email" type="email" inputmode="email" class="input input-bordered w-full bg-white mt-2"
                placeholder="Enter your email" autocomplete="email" required pattern="^[^@\s]+@nu\.ac\.th$" />
            </label>

            <!-- 2) Password -->
            <label class="block">
              <span class="text-sm text-[#6B614B]">Password</span>
              <input v-model="password" type="password" class="input input-bordered w-full bg-white mt-2"
                placeholder="password" autocomplete="new-password" required />
            </label>

            <!-- 3) Student ID -->
            <label class="block">
              <span class="text-sm text-[#6B614B]">Student ID</span>
              <input v-model="student_ID" class="input input-bordered w-full bg-white mt-2" placeholder="student id"
                maxlength="12" autocomplete="username" required />
            </label>

            <!-- 4) ชื่อ-สกุล -->
            <label class="block">
              <span class="text-sm text-[#6B614B]">ชื่อ-สกุล</span>
              <input v-model="student_Name" class="input input-bordered w-full bg-white mt-2" placeholder="ชื่อ-สกุล"
                required />
            </label>

            <!-- 5) ชั้นปี -->
            <label class="block">
              <span class="text-sm text-[#6B614B]">ชั้นปี</span>
              <select v-model="student_level" class="select select-bordered w-full bg-white mt-2" required>
                <option disabled value="">เลือกชั้นปี</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>

            <!-- 6) คณะ -->
            <label class="block">
              <span class="text-sm text-[#6B614B]">คณะ</span>
              <select v-model="faculty" class="select select-bordered w-full bg-white mt-2" required>
                <option disabled value="">เลือกคณะ</option>
                <option v-for="f in faculties" :key="f.faculty_ID" :value="f.faculty_ID">
                  {{ f.faculty_Name }}
                </option>
              </select>
            </label>
          </div>

          <p v-if="errorMsg" class="text-error text-sm mt-4">{{ errorMsg }}</p>
          <p v-if="okMsg" class="text-success text-sm mt-1">{{ okMsg }}</p>

          <button class="btn w-full mt-6 bg-[#F6C052] hover:bg-[#F3B43E] border-none" type="submit" :disabled="loading">
            {{ loading ? 'กำลังสมัคร...' : 'สมัครบัญชี' }}
          </button>

          <div class="text-sm text-[#6B614B] mt-6">
            มีบัญชีอยู่แล้ว?
            <router-link :to="{ name: 'login' }" class="link link-warning">Login</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>