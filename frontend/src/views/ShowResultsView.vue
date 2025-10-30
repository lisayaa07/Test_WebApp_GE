<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResultsStore } from '@/stores/results'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Layout from '@/layout/Layout.vue'

const router = useRouter()
const store = useResultsStore()

const results = ref([])
const resultGroups = ref([])

onMounted(() => {
  results.value = store.results || []
  resultGroups.value = store.resultGroups || []

  console.log('📦 ผลลัพธ์ทั้งหมด:', results.value)
  console.log('📦 กลุ่มวิชา:', resultGroups.value)
})

// ✅ ปุ่มเริ่มใหม่
function restartAll() {
  store.$reset()
  router.push({ name: 'matchcase' })
}

// ✅ ปุ่มดูคอมเมนต์
function Comments(c) {
  router.push({
    name: 'reviewsubjects',
    params: { id: c.subject_ID },
    query: { name: c.subject_Name || '', limit: 5 },
  })
}
</script>

<template>
  <Layout>
    <div class="bg-[#6495ED]/35 shadow p-6 rounded-3xl mt-10 mx-3">
      <h1 class="text-3xl font-bold text-black/70 mb-4">
        วิชาที่เหมาะกับนิสิต
      </h1>

      <div v-if="!results.length" class="text-center text-gray-600 py-10">
        ยังไม่มีผลลัพธ์ กรุณากลับไปทำแบบประเมินก่อน
        <div class="mt-4">
          <RouterLink to="/matchcase" class="btn bg-pink-300 hover:bg-pink-500 text-white">
            🔙 ย้อนกลับ
          </RouterLink>
        </div>
      </div>

      <div v-else class="ml-5 mt-5">
        <!-- ✅ แสดงกลุ่มวิชา -->
        <div
          v-for="(g, gi) in resultGroups.length ? resultGroups : [{ group_type_name: 'ผลลัพธ์ทั้งหมด', items: results }]"
          :key="g.group_type_name || gi"
          class="mb-8"
        >
          <h2 class="text-2xl font-bold mb-3 text-[#696969]">
            {{ g.group_type_name || 'หมวดวิชา' }}
          </h2>

          <div
            v-for="(r, idx) in g.items || results"
            :key="r.subject_ID || idx"
            class="flex justify-between items-center bg-white/70 hover:bg-white/90 rounded-xl p-3 shadow mb-3 transition"
          >
            <div class="text-lg font-medium">
              {{ r.subject_Name || ('วิชา #' + r.subject_ID) }}
            </div>

            <div class="flex gap-3 items-center">
              <!-- ✅ เกรด -->
              <div class="badge badge-ghost badge-lg">
                เกรดที่คาดว่าจะได้ : {{ r.grade_Name || '-' }}
              </div>

              <!-- ✅ ความเหมือน -->
              <div class="badge bg-pink-400 text-white badge-lg">
                {{ Number(r.similarity).toFixed(2) }}%
              </div>

              <!-- ✅ ปุ่มคอมเมนต์ -->
              <button
                type="button"
                class="inline-flex p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="ดูคอมเมนต์"
                title="ดูคอมเมนต์"
                @click="Comments(r)"
              >
                <FontAwesomeIcon icon="comment-dots" size="xl" class="text-[#192F4E]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ ปุ่มย้อนกลับ + เริ่มทำใหม่ -->
      <div class="text-center mt-10 flex justify-center gap-4">
        <RouterLink
          to="/matchcase"
          class="btn bg-pink-300 hover:bg-pink-500 text-white"
        >
          🔙 ย้อนกลับ
        </RouterLink>

        <button
          type="button"
          class="btn bg-blue-800 hover:bg-blue-900 text-white"
          @click="restartAll"
        >
          🔁 เริ่มทำใหม่
        </button>
      </div>
    </div>
  </Layout>
</template>
