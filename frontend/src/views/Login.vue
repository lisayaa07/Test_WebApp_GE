<script setup>
import { ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const user = ref(null)
const profile = ref('/Photo/pro.png') // หรือ path ที่คุณเก็บรูปไว้
const isEditingName = ref(false)
const editableName = ref('')

// โหลดข้อมูล user จาก localStorage
onMounted(() => {
  try {
    const saved = localStorage.getItem('user')
    if (saved) {
      user.value = JSON.parse(saved)
      editableName.value = user.value.student_Name
    }
  } catch (err) {
    console.error('❌ load user error:', err)
  }
})

// ฟังก์ชันแก้ชื่อ
function startEditingName() {
  isEditingName.value = true
}
function cancelEditingName() {
  isEditingName.value = false
  editableName.value = user.value?.student_Name || ''
}
function saveName() {
  if (!editableName.value.trim()) return
  user.value.student_Name = editableName.value
  localStorage.setItem('user', JSON.stringify(user.value))
  isEditingName.value = false
}
</script>


<template>
  <!-- ถ้ายังไม่มี user -->
  <div v-if="!user" class="flex items-center justify-center h-screen bg-blue-200">
    <p class="text-xl text-gray-800">กำลังโหลดข้อมูลผู้ใช้...</p>
  </div>

  <!-- ถ้ามี user แล้ว -->
  <div v-else>
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
              <FontAwesomeIcon
                icon="pen"
                class="text-base-200 cursor-pointer ml-2 hover:text-white"
                title="แก้ไขชื่อ"
                @click="startEditingName"
              />
            </div>

            <div v-else class="mt-3 space-y-2">
              <input
                type="text"
                v-model="editableName"
                class="input input-bordered w-full max-w-xs"
                placeholder="กรอกชื่อใหม่"
                @keyup.enter="saveName"
              />
              <div class="flex gap-2">
                <button class="btn btn-sm btn-success" @click="saveName">บันทึก</button>
                <button class="btn btn-sm btn-ghost" @click="cancelEditingName">ยกเลิก</button>
              </div>
            </div>

            <div class="text-sm opacity-70">{{ user.id || '—' }}</div>
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
            <div class="font-medium text-xl">{{ user.faculty_Name || '—' }}</div>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>
