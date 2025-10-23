<script setup>
import Layout from '@/layout/Layout.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faCommentDots)

// Base API URL (ตั้งใน .env: VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()

const popularGroups = ref([])
const loading = ref(false)
const errorMsg = ref('')

// helper: headers (ใส่ Authorization ถ้ามี token)
function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

// โหลดข้อมูล popular subjects
async function loadPopularSubjects() {
  loading.value = true
  errorMsg.value = ''
  try {
    const url = `${API_URL}/popular-subjects`
    const res = await fetch(url, {
      method: 'GET',
      headers: authHeaders()
    })

    // อ่าน json (หรือ null ถ้าไม่ใช่ json)
    const j = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(j?.message || res.statusText || 'Request failed')
    }

    // คาดว่า backend คืน array ของ groups
    popularGroups.value = Array.isArray(j) ? j : (j?.items ?? [])
  } catch (err) {
    console.error('❌ โหลด popular subjects ล้มเหลว', err)
    errorMsg.value = err.message || 'ไม่สามารถโหลดข้อมูลได้'
  } finally {
    loading.value = false
  }
}

// ไปหน้ารีวิวรายวิชา
function Comments(subject) {
  if (!subject?.subject_ID) return
  router.push({
    name: 'reviewsubjects',
    params: { id: subject.subject_ID },
    query: { name: subject.subject_Name || '' },
  })
}

onMounted(() => {
  loadPopularSubjects()
})
</script>

<template>
  <Layout>
    <p class="text-4xl font-black m-4 mb-5 text-center">Top 3 วิชายอดฮิตของแต่ละกลุ่มวิชา</p>
    <div v-for="group in popularGroups" :key="group.group_ID" class="ml-10">
      <p class="font-bold text-3xl mb-2.5 mt-8">{{ group.group_Name }}</p>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
        <div @click="Comments(subject)" v-for="subject in group.subjects" :key="subject.subject_ID"
          class="card bg-base-100 w-full shadow-lg p-7 flex flex-col justify-between mt-3 cursor-pointer hover:shadow-xl/25 hover:shadow-blue-800 transition-shadow">
          <div class="rounded-md bg-blue-900 text-base text-center text-white font-medium w-18 mb-5">
            {{ subject.subject_ID }}
          </div>
          <div class="text-2xl font-medium text-black mb-5">
            {{ subject.subject_Name }}
          </div>
          <div class="text-end text-sm text-black mt-5">
            <div class="text-3xl font-medium">
              {{ subject.review_count }}
              <FontAwesomeIcon icon="comment-dots" size="sm" class="text-gray-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </Layout>
  <!-- <Layout>
    <p class="text-3xl m-4 mb-5">Top 3 วิชายอดฮิตของแต่ละกลุ่มวิชา</p>

    <div v-for="group in popularGroups" :key="group.group_ID" class="ml-20 ">
      <p class="text-xl mb-2.5">{{ group.group_Name }}</p>

      <div class="ml-25">
        <div>
          <div
            v-for="subject in group.subjects"
            :key="subject.subject_ID"
            class="flex justify-between items-center"
          >
            ชื่อวิชา
            <span class="text-xl font-medium text-black">
              {{ subject.subject_ID }} {{ subject.subject_Name }}
              <span class="ml-2 text-sm text-gray-500">
                ({{ subject.review_count }} รีวิว)
              </span>
            </span>


            ปุ่มคอมเมนต์
            <div class="flex pr-20 gap-6">
              <button
                type="button"
                class="btn btn-ghost btn-circle"
                @click="Comments(subject)"
                aria-label="ดูคอมเมนต์ของวิชานี้"
                title="ดูคอมเมนต์"
              >
                <FontAwesomeIcon icon="comment-dots" size="xl" class="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout> -->
</template>
