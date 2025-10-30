<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import api from '@/api/api.js'

// ✅ ตัวแปรหลัก
const route = useRoute()
const router = useRouter()

const subjectId = ref(route.params.id)
const subjectName = ref(route.query.name || 'ไม่ระบุชื่อวิชา')

const reviews = ref([])
const loading = ref(true)
const errorMsg = ref('')

// ✅ โหลดข้อมูลรีวิวจาก backend
async function fetchReviews() {
  try {
    const res = await api.get(`/reviews/${subjectId.value}`)
    if (!res?.data?.ok) throw new Error(res.data?.message || 'โหลดข้อมูลไม่สำเร็จ')
    reviews.value = Array.isArray(res.data.reviews) ? res.data.reviews : []
  } catch (err) {
    console.error('❌ โหลดรีวิวล้มเหลว:', err)
    errorMsg.value = err.message || 'Request failed'
  } finally {
    loading.value = false
  }
}

// ✅ โหลดเมื่อ component mount
onMounted(fetchReviews)
</script>

<template>
    <Layout>
        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
                <div class="text-2xl font-bold">รีวิวจากรุ่นพี่</div>
                <button class="btn btn-active" @click="back">ย้อนกลับ</button>
            </div>

            <div class=" bg-base-200/70 rounded-4xl py-5 shadow">
                <div class="ml-13">
                    <div class="text-xl font-bold">
                        วิชา {{ subjectName }}
                    </div>

                    <div v-if="loading" class="p-4">กำลังโหลดคอมเมนต์…</div>
                    <div v-else-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

                    <div v-else>
                        <div class="mb-2 text-sm opacity-70">ทั้งหมด {{ comments.length }} คอมเมนต์</div>

                        <div v-if="!comments.length" class="opacity-60">ยังไม่มีคอมเมนต์สำหรับวิชานี้</div>

                        <div v-else class="space-y-3">
                            <div v-for="c in comments" :key="c.id" class="chat chat-start">
                                <div class="chat-bubble">
                                    <!-- <div class="flex items-center justify-between">
                                    <div class="text-sm">
                                        <span v-if="c.rating">★ {{ c.rating }}</span>
                                        <span v-if="c.date" class="ml-2">{{ c.date }}</span>
                                    </div>
                                </div> -->
                                    <p class="text-base whitespace-pre-wrap">{{ c.text }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </Layout>
</template>
