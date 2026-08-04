<script setup>
import { useRouter } from 'vue-router'
import DataTable from '../shared/DataTable.vue'
import CefrBadge from '../shared/CefrBadge.vue'

defineProps({
  rows: {
    type: Array,
    required: true,
  },
})

const router = useRouter()

const columns = [
  { key: 'student_name', label: 'Оқушы аты', sortable: true },
  { key: 'group_name', label: 'Топ', sortable: true },
  { key: 'variant_name', label: 'Емтихан нұсқасы', sortable: false },
  { key: 'total_score', label: 'Жалпы балл', sortable: true },
  { key: 'cefr_level', label: 'Деңгей', sortable: false },
  { key: 'date', label: 'Күні', sortable: true },
]

function goToResult(row) {
  router.push({ name: 'results', params: { attemptId: row.attempt_id } })
}
</script>

<template>
  <DataTable :columns="columns" :rows="rows" row-key="attempt_id" clickable-rows @row-click="goToResult">
    <template #cell-cefr_level="{ row }">
      <CefrBadge :level="row.cefr_level" />
    </template>
  </DataTable>
</template>
