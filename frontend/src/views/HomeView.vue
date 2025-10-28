<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function startApp() {
  // ตรวจสอบว่ามี session (cookie) หรือไม่
  const isAuth = document.cookie.includes('yourSessionCookieName') // หรือจะข้ามก็ได้
  if (isAuth) {
    router.push({ name: 'matchcase' })
  } else {
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <button 
    @click="startApp" 
    class="btn bg-[#2E8B57] hover:bg-[#3CB371] text-white mt-10 w-40 h-15 text-xl"
  >
    เริ่มต้นใช้งาน
  </button>
</template>
