<script setup>
import { RouterLink } from 'vue-router';

import Layout from '@/layout/Layout.vue';

</script>

<template>
  <Layout>
    <div class="text-center m-30">
      <p class="text-3xl">แบบทดสอบนี้จะช่วยแนะนำว่าวิชาไหนเหมาะกับคุณ<br></br>เพียงตอบไม่กี่คำถามง่ายๆ</p>
      <RouterLink :to="'/matchcase'" class="btn bg-[#2E8B57] hover:bg-[#3CB371] text-white mt-10 w-40 h-15 text-xl">เริ่มต้นใช้งาน</RouterLink>
    </div>
  </Layout>
</template>