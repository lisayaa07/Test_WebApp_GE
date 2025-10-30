<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import profile from '/Photo/profilee.jpg'
import api from '@/api/api.js'

const API_URL = import.meta.env.VITE_API_URL || 'https://test-webapp-ge.onrender.com'
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

// -------------------- State --------------------
const user = ref({
  email: '',
  student_ID: '',
  student_Name: '',
  student_level: '',
  faculty_ID: '',
  faculty_Name: '',
})
const faculties = ref([])
const isEditingName = ref(false)
const editableName = ref('')

// -------------------- Navigation --------------------
function favorites() { router.push('/favorites') }
function home() { router.push('/') }

// -------------------- Profile Edit --------------------
function startEditingName() {
  editableName.value = user.value.student_Name
  isEditingName.value = true
}
function cancelEditingName() { isEditingName.value = false }

async function saveName() {
  try {
    const response = await api.put(`/students/${user.value.student_ID}`, {
      name: editableName.value,
    })
    const updatedUser = response.data
    user.value.student_Name = updatedUser.student_Name || editableName.value
    alert('อัปเดตชื่อสำเร็จ!')
  } catch (error) {
    console.error('Failed to update name:', error)
    alert('เกิดข้อผิดพลาดในการอัปเดตชื่อ')
  } finally {
    isEditingName.value = false
  }
}

function openProfile() {
  const dlg = document.getElementById('profileModal')
  if (dlg && typeof dlg.showModal === 'function') {
    isEditingName.value = false
    dlg.showModal()
  }
}

// -------------------- โหลดข้อมูลผู้ใช้หลัง Login --------------------
async function fetchUserProfile() {
  try {
    const res = await api.get('/me')
    const data = res.data
    if (data.ok && data.user) {
      user.value = {
        email: data.user.email,
        student_ID: data.user.student_ID,
        student_Name: data.user.student_Name,
        student_level: data.user.student_level,
        faculty_ID: data.user.faculty_ID,
        faculty_Name: data.user.faculty_Name,
      }
    } else {
      router.replace({ name: 'login' })
    }
  } catch (e) {
    console.error('โหลดข้อมูลโปรไฟล์ล้มเหลว:', e)
    router.replace({ name: 'login' })
  }
}

// -------------------- โหลดข้อมูลคณะ --------------------
async function loadFaculties() {
  try {
    const res = await api.get('/faculty')
    faculties.value = Array.isArray(res.data)
      ? res.data
      : res.data.items ?? []
  } catch (e) {
    console.error('โหลดคณะไม่สำเร็จ:', e)
    faculties.value = []
  }
}

// -------------------- เริ่มโหลดตอนเปิด Layout --------------------
onMounted(async () => {
  await fetchUserProfile()
  await loadFaculties()
})

// -------------------- Computed --------------------
const displayName = computed(() =>
  user.value.student_Name || user.value.email || 'ผู้ใช้'
)
const currentFacultyId = computed(() =>
  (user.value.faculty_ID || '').toString().trim()
)
const facultyName = computed(() => {
  const fid = currentFacultyId.value
  if (!fid) return '—'
  const found = faculties.value.find(f => String(f.faculty_ID).trim() === fid)
  return found?.faculty_Name || '—'
})

// -------------------- Logout --------------------
async function logout() {
  try {
    await api.post('/logout')
  } catch (e) {
    console.warn('logout request failed:', e)
  }
  router.replace({ name: 'login' })
}
</script>


<template>
  <div class="min-h-screen">
    <!-- ✅ Navbar -->
    <nav
      class="fixed top-5 left-10 right-10 z-50 bg-white/80 shadow-md shadow-blue-950 h-20 flex items-center justify-between px-4 rounded-2xl">
      <div class="flex items-center gap-2">
        <button class="btn btn-square btn-ghost lg:hidden" @click="sidebarOpen = !sidebarOpen">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button @click="home" class="btn btn-ghost text-3xl">
          GE NU
        </button>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-ghost btn-circle text-center" @click="favorites" title="รายการโปรด">
          <FontAwesomeIcon icon="heart-circle-check" size="2xl" class="text-red-500 cursor-pointer" />
        </button>
        <span class="text-2xl font-semibold">{{ displayName }}</span>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <FontAwesomeIcon icon="chevron-down" size="xl" />
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow">
            <li><button @click="openProfile">Profile</button></li>
            <li><button @click="logout">Logout</button></li>
          </ul>
        </div>

        <!-- ✅ Popup โปรไฟล์ -->
        <dialog id="profileModal" class="modal">
          <div class="modal-box bg-[#6495ED] rounded-2xl shadow-2xl">
            <h3 class="font-bold text-2xl mb-5 text-[#F5F5DC]">Profile</h3>
            <div class="flex items-center gap-4 mb-6">
              <div class="avatar">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img :src="profile" alt="profile" />
                </div>
              </div>
              <div>
                <div v-if="!isEditingName" class="mt-3 text-xl font-semibold text-[#330000]">
                  {{ user.student_Name || '—' }}
                  <FontAwesomeIcon icon="pen" class="text-base-200 cursor-pointer ml-2 hover:text-white"
                    title="แก้ไขชื่อ" @click="startEditingName" />
                </div>

                <div v-else class="mt-3 space-y-2">
                  <input type="text" v-model="editableName"
                    class="input input-bordered w-full max-w-xs" placeholder="กรอกชื่อใหม่"
                    @keyup.enter="saveName" />
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
      </div>
    </nav>

    <!-- ✅ Sidebar -->
    <aside
      :class="['fixed top-28 bottom-4 left-10 z-40 bg-[#192F4E] text-white/80 w-56 p-4 shadow-sm rounded-l-2xl',
        sidebarOpen ? 'block' : 'hidden', 'lg:block']">
      <nav class="space-y-2">
        <router-link to="/" class="flex items-center px-4 py-2 rounded-lg gap-2">
          <FontAwesomeIcon icon="house-chimney" size="xl" />
          แนะนำวิชาที่เหมาะกับคุณ
        </router-link>
        <router-link to="/allsubjects" class="flex items-center px-4 py-2 rounded-lg gap-2">
          <FontAwesomeIcon icon="clipboard-list" size="xl" />
          รายวิชาทั้งหมด
        </router-link>
        <router-link to="/popularsubjects" class="flex items-center px-4 py-2 rounded-lg gap-2">
          <FontAwesomeIcon icon="people-robbery" size="xl" />
          วิชายอดนิยม
        </router-link>
        <router-link to="/review" class="flex items-center px-4 py-2 rounded-lg gap-2">
          <FontAwesomeIcon icon="comment-dots" size="xl" />
          เขียนรีวิว
        </router-link>
      </nav>
    </aside>

    <!-- ✅ พื้นที่ของ View -->
    <main class="pt-28 h-screen pr-4 pb-4 mr-6 ml-10 lg:pl-54">
      <div class="bg-white/90 w-full h-full shadow-lg p-6 overflow-y-auto rounded-2xl lg:rounded-l-none">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
.router-link-exact-active {
  background-color: #6A5ACD;
  color: white;
  font-weight: bold;
}

a:not(.router-link-exact-active):hover {
  background-color: #374151;
}
</style>
