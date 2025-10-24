<script setup>
import { ref, onMounted, computed } from 'vue'
// ถ้าคุณตั้ง VITE_API_URL บน Vercel แล้ว ให้ “ไม่” fallback localhost ในโปรดักชัน
const API_URL = import.meta.env.VITE_API_URL

const sidebarOpen = ref(false)
const user = ref({ email:'', student_ID:'', student_level:'', faculty_ID:'', name:'' })
const faculties = ref([])
const isEditingName = ref(false)
const editableName = ref('')
const ready = ref(false)     // ✅ กันจอฟ้า: render หลังพร้อมเท่านั้น

function startEditingName(){ editableName.value = user.value.name; isEditingName.value = true }
function cancelEditingName(){ isEditingName.value = false }

function openProfile() {
  const dlg = document.getElementById('profileModal')
  if (dlg && typeof dlg.showModal === 'function') {
    isEditingName.value = false
    dlg.showModal()
  }
}

// ดึง user จาก localStorage เท่านั้น (ไม่เรียก /me)
function initUserFromLocalStorage() {
  try {
    const saved = localStorage.getItem('user')
    const u = saved ? JSON.parse(saved) : null
    if (u) {
      user.value.email         = u.id || ''
      user.value.student_ID    = u.student_ID || ''
      user.value.student_level = u.student_level || ''
      user.value.faculty_ID    = (u.faculty_ID ?? '').toString()
      user.value.name          = u.student_Name || ''
    } else {
      // ถ้าไม่มี user ให้คงค่า default (ไม่พัง)
      user.value = { email:'', student_ID:'', student_level:'', faculty_ID:'', name:'' }
    }
  } catch (e) {
    console.error('load user error:', e)
  }
}

async function loadFaculties() {
  try {
    const res = await fetch(`${API_URL}/faculty`)
    const j = await res.json().catch(() => null)
    faculties.value = Array.isArray(j) ? j : (j?.items ?? [])
  } catch (e) {
    console.error('โหลดคณะไม่สำเร็จ:', e)
    faculties.value = []
  }
}

onMounted(async () => {
  initUserFromLocalStorage()
  await loadFaculties()
  ready.value = true          // ✅ พร้อม render แล้ว
})

const currentFacultyId = computed(() =>
  (user.value.faculty_ID || '').toString().trim()
)
const facultyName = computed(() => {
  const fid = currentFacultyId.value
  if (!fid) return user.value.faculty_Name || '—'   // เผื่อ backend ใส่มาด้วย
  const found = faculties.value.find(f => String(f.faculty_ID).trim() === fid)
  return found?.faculty_Name || user.value.faculty_Name || '—'
})

// อัปเดตชื่อใน DB (PUT /students/:id) และ sync localStorage
async function saveName() {
  try {
    if (!user.value.student_ID) throw new Error('missing student_ID')
    const res = await fetch(`${API_URL}/students/${user.value.student_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ name: editableName.value })
    })
    const updated = await res.json()
    user.value.name = updated.student_Name || editableName.value
    localStorage.setItem('user', JSON.stringify({
      // sync ฟิลด์ให้ตรงกับรูปแบบ backend ตอน login
      id: user.value.email,
      student_ID: user.value.student_ID,
      student_Name: user.value.name,
      student_level: user.value.student_level,
      faculty_ID: user.value.faculty_ID,
      faculty_Name: user.value.faculty_Name
    }))
    alert('อัปเดตชื่อสำเร็จ')
  } catch (e) {
    console.error('Failed to update name:', e)
    alert('เกิดข้อผิดพลาดในการอัปเดตชื่อ')
  } finally {
    isEditingName.value = false
  }
}

// นำทาง
function favorites(){ location.href = '/favorites' }
function home(){ location.href = '/' }
</script>

<template>
  <!-- ✅ กันจอฟ้า: render เมื่อพร้อมเท่านั้น -->
  <div v-if="ready" class="min-h-screen">
    <!-- ... (navbar/aside ตามเดิม) ... -->

    <!-- ใช้ user.name, user.email ที่ map แล้ว -->
    <!-- ตัวอย่างแสดงชื่อบน navbar -->
    <span class="text-2xl font-semibold">{{ user.name || '—' }}</span>

    <!-- Popup โปรไฟล์ -->
    <dialog id="profileModal" class="modal">
      <div class="modal-box bg-[#6495ED] rounded-2xl shadow-2xl">
        <h3 class="font-bold text-2xl mb-5 text-[#F5F5DC]">Profile</h3>
        <div class="flex items-center gap-4 mb-6">
          <div>
            <div v-if="!isEditingName" class="mt-3 text-xl font-semibold text-[#330000]">
              {{ user.name || '—' }}
              <button class="ml-2 underline" title="แก้ไขชื่อ" @click="startEditingName">แก้ไข</button>
            </div>
            <div v-else class="mt-3 space-y-2">
              <input v-model="editableName" class="input input-bordered w-full max-w-xs" placeholder="กรอกชื่อใหม่" @keyup.enter="saveName" />
              <div class="flex gap-2">
                <button class="btn btn-sm btn-success" @click="saveName">บันทึก</button>
                <button class="btn btn-sm btn-ghost" @click="cancelEditingName">ยกเลิก</button>
              </div>
            </div>
            <div class="text-sm opacity-70">{{ user.email || '—' }}</div>
            <div class="text-sm opacity-70">Student ID: {{ user.student_ID || '—' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-lg">
          <div class="p-4 rounded-box bg-base-200 shadow-xl/20">
            <div class="opacity-60 text-base">ชั้นปี</div>
            <div class="font-medium text-xl">{{ user.student_level || '—' }}</div>
          </div>
          <div class="p-4 rounded-box bg-base-200 shadow-xl/20">
            <div class="opacity-60 text-base">คณะ</div>
            <div class="font-medium text-xl">{{ facultyName }}</div>
          </div>
        </div>

        <div class="modal-action mt-6">
          <form method="dialog">
            <button class="btn bg-[#FFB74D] hover:bg-[#F57C00] text-white text-lg px-6">ปิด</button>
          </form>
        </div>
      </div>
    </dialog>

    <!-- main -->
    <main class="pt-28 h-screen pr-4 pb-4 mr-6 ml-10 lg:pl-54">
      <div class="bg-white/90 w-full h-full shadow-lg p-6 overflow-y-auto rounded-2xl lg:rounded-l-none">
        <slot></slot>
      </div>
    </main>
  </div>

  <!-- skeleton ตอนยังไม่ ready -->
  <div v-else class="flex items-center justify-center h-screen">
    <p>กำลังโหลด...</p>
  </div>
</template>
