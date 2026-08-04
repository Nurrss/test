<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: {
    // [{ key, label, sortable }]
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  clickableRows: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['row-click'])

const sortKey = ref('')
const sortDir = ref(1)

function toggleSort(column) {
  if (!column.sortable) return
  if (sortKey.value === column.key) {
    sortDir.value *= -1
  } else {
    sortKey.value = column.key
    sortDir.value = 1
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value]
    const bv = b[sortKey.value]
    if (av === bv) return 0
    return av > bv ? sortDir.value : -sortDir.value
  })
})
</script>

<template>
  <div class="data-table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="{ 'data-table__sortable': column.sortable }"
            @click="toggleSort(column)"
          >
            {{ column.label }}
            <i v-if="sortKey === column.key" class="fa-solid" :class="sortDir === 1 ? 'fa-sort-up' : 'fa-sort-down'"></i>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in sortedRows"
          :key="row[rowKey]"
          :class="{ 'data-table__row--clickable': clickableRows }"
          @click="clickableRows && emit('row-click', row)"
        >
          <td v-for="column in columns" :key="column.key" :data-label="column.label">
            <slot :name="`cell-${column.key}`" :row="row">{{ row[column.key] }}</slot>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="data-table__empty">Деректер жоқ</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-table-wrap {
  overflow-x: auto;
}

.data-table__sortable {
  cursor: pointer;
  user-select: none;
}

.data-table__row--clickable {
  cursor: pointer;
}

.data-table__row--clickable:hover {
  background: var(--color-input-bg);
}

.data-table__empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 1.5rem 0;
}

@media (max-width: 767px) {
  .data-table thead {
    display: none;
  }

  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td {
    display: block;
    width: 100%;
  }

  .data-table tr {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-control);
    margin-bottom: 0.75rem;
    padding: 0.5rem 0.75rem;
  }

  .data-table td {
    border-bottom: none;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.4rem 0;
  }

  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: var(--fs-label);
    text-transform: uppercase;
  }
}
</style>
