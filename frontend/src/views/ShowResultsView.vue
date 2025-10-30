<script setup>
import Layout from '@/layout/Layout.vue'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResultsStore } from '@/stores/results'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import api from '@/api/api.js'

const router = useRouter()
const store = useResultsStore()

// ✅ ดึงกลุ่มผลลัพธ์จาก Pinia store
const groups = computed(() =>
  Array.isArray(store.resultGroups) ? store.resultGroups : []
)
const hasData = computed(() => groups.value.length > 0)

// ✅ กลับไปหน้าเดิม
function backToForm() {
  router.back()
}

// ✅ ปุ่ม “เริ่มทำใหม่” — ล้าง store แล้วกลับไปหน้าคำนวณ
function restartAll() {
  store.$reset()
  router.push({ name: 'matchcase' })
}

// ✅ ไปหน้ารีวิวรายวิชา
function Comments(c) {
  router.push({
    name: 'reviewsubjects',
    params: { id: c.subject_ID },
    query: { name: c.subject_Name || '', limit: 5 },
  })
}

// ✅ debug log
onMounted(() => {
  console.log('[ShowResults] groups =', groups.value)
})
</script>

<template>
  <Layout>
    <div class="bg-[#6495ED]/35 shadow p-6 rounded-3xl mt-10 mx-3">
      <h1 class="text-3xl font-bold text-black/70 mb-4">
        วิชาที่เหมาะกับนิสิต
      </h1>

      <div v-if="store.errorMsg" class="alert alert-error mb-4">
        {{ store.errorMsg }}
      </div>

      <div v-if="!hasData" class="opacity-60 text-center text-lg py-6">
        ยังไม่มีผลลัพธ์ (กรุณาคำนวณจากหน้าแนะนำรายวิชาก่อน)
      </div>

      <!-- ✅ แสดงผลลัพธ์ตามกลุ่ม -->
      <div v-else class="ml-5 mt-5">
        <div
          v-for="g in groups"
          :key="g.group_type || g.group_type_name"
          class="mb-8"
        >
          <h2 class="text-2xl font-bold mb-3 text-[#696969]">
            {{ g.group_type_name || g.group_type }}
          </h2>

          <div v-if="!g.items || !g.items.length" class="opacity-60">
            — ไม่มีผลลัพธ์ในกลุ่มนี้ —
          </div>

          <div v-else class="ml-15 mt-6">
            <div
              v-for="c in g.items"
              :key="c.subject_ID"
              class="flex justify-between items-center bg-white/70 hover:bg-white/90 rounded-xl p-3 shadow mb-3"
            >
              <div class="text-lg font-medium">
                {{ c.subject_Name || ('วิชา #' + c.subject_ID) }}
              </div>
              <div class="flex gap-3 items-center">
                <!-- ✅ เกรด -->
                <div class="badge badge-ghost badge-lg">
                  เกรดที่คาดว่าจะได้ : {{ c.grade_Name || '-' }}
                </div>

                <!-- ✅ ความเหมือน -->
                <div class="badge bg-pink-400 text-white badge-lg">
                  {{ Number(c.similarity).toFixed(2) }}%
                </div>

                <!-- ✅ ปุ่มคอมเมนต์ -->
                <button
                  type="button"
                  class="inline-flex p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="ดูคอมเมนต์"
                  title="ดูคอมเมนต์"
                  @click="Comments(c)"
                >
                  <FontAwesomeIcon
                    icon="comment-dots"
                    size="xl"
                    class="text-[#192F4E]"
                  />
                </button>
              </div>
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
