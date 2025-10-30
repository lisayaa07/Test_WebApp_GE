<script setup>
import Layout from '@/layout/Layout.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResultsStore } from '@/stores/results'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = useRouter()
const store = useResultsStore()

// ✅ ใช้ ref และ computed เพื่อกัน reactive เสีย
const groups = ref([])
const hasData = computed(() => groups.value.length > 0)

// ✅ ดึงข้อมูลจาก Pinia เมื่อโหลดหน้า
onMounted(() => {
  const raw = store.resultGroups || store.results || []

  // รองรับหลายรูปแบบ field จาก backend
  groups.value = (Array.isArray(raw) ? raw : []).map(g => ({
    group_type_name:
      g.group_type_name ||
      g.GroupType_Name ||
      g.groupType_Name ||
      g.group_type ||
      'ไม่ระบุหมวด',
    items: g.items || g.subjects || g.Subjects || [],
  }))

  console.log('✅ [ShowResults] โหลดข้อมูลจาก store:', groups.value)
})

// ✅ ปุ่มกลับ
function backToForm() {
  router.push({ name: 'matchcase' })
}

// ✅ ปุ่มคอมเมนต์
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
      <h1 class="text-3xl font-bold text-black/70">วิชาที่เหมาะกับนิสิต</h1>

      <div v-if="store.errorMsg" class="alert alert-error">{{ store.errorMsg }}</div>

      <div v-if="!hasData" class="opacity-60">
        ยังไม่มีผลลัพธ์ (กรุณาคำนวณจากหน้าแนะนำรายวิชาก่อน)
      </div>

      <div v-else class="ml-5 mt-5">
        <div v-for="g in groups" :key="g.group_type || g.group_type_name" class="mb-8">
          <h2 class="text-2xl font-bold mb-3 text-[#696969]">
            {{ g.group_type_name || g.group_type }}
          </h2>

          <div v-if="!g.items || !g.items.length" class="opacity-60">— ไม่มีผลลัพธ์ในกลุ่มนี้ —</div>

          <div v-else class="ml-15 mt-6">
            <div v-for="c in g.items" :key="c.subject_ID" class="flex justify-between my-4">
              <div class="text-xl">
                {{ c.subject_Name || ('วิชา #' + c.subject_ID) }}
              </div>
              <div class="flex gap-3 items-center">
                <!-- ✅ เกรดของเคส -->
                <div class="badge badge-ghost badge-lg">
                  เกรดที่คาดว่าจะได้ : {{ c.grade_Name || c.grade_ID || '-' }}
                </div>

                <!-- เปอร์เซ็นต์ -->
                <div class="badge bg-pink-400 text-white badge-lg">
                  {{ Number(c.similarity).toFixed(2) }}%
                </div>

                <!-- ปุ่มคอมเมนต์ -->
                <button
                  type="button"
                  class="inline-flex p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="ดูคอมเมนต์" title="ดูคอมเมนต์"
                  @click="Comments(c)"
                >
                  <FontAwesomeIcon icon="comment-dots" size="xl" class="text-[#192F4E]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <RouterLink to="/matchcase" class="btn bg-pink-300 hover:bg-pink-500 text-white">ย้อนกลับ</RouterLink>
      </div>
    </div>
  </Layout>
</template>
