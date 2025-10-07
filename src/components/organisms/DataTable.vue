<template>
  <div class="data-table-container">
    <div v-if="$slots.toolbar" class="data-table-toolbar">
      <slot name="toolbar" />
    </div>

    <div class="data-table-wrapper">
      <table class="data-table">
        <thead class="data-table-head">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getHeaderClass(column)"
              :style="getColumnStyle(column)"
              @click="handleHeaderClick(column)"
            >
              <div class="table-header-content">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="sort-icon">
                  {{ getSortIcon(column.key) }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody class="data-table-body">
          <tr
            v-for="(row, index) in sortedData"
            :key="getRowKey(row, index)"
            :class="getRowClass(row, index)"
            @click="handleRowClick(row, index)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="getCellClass(column)"
              :style="getColumnStyle(column)"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :value="getCellValue(row, column.key)"
              >
                {{ getCellValue(row, column.key) }}
              </slot>
            </td>
          </tr>

          <tr v-if="sortedData.length === 0" class="data-table-empty">
            <td :colspan="columns.length">
              <slot name="empty">
                <p class="empty-message">{{ emptyMessage }}</p>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="$slots.footer" class="data-table-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: Column[]
  data: any[]
  rowKey?: string
  hoverable?: boolean
  striped?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  hoverable: true,
  striped: false,
  emptyMessage: 'No data available'
})

const emit = defineEmits<{
  (e: 'row-click', row: any, index: number): void
  (e: 'sort', key: string, direction: 'asc' | 'desc'): void
}>()

const sortKey = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data

  return [...props.data].sort((a, b) => {
    const aVal = getCellValue(a, sortKey.value)
    const bVal = getCellValue(b, sortKey.value)

    if (aVal === bVal) return 0

    const comparison = aVal > bVal ? 1 : -1
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const getRowKey = (row: any, index: number) => {
  return row[props.rowKey] || index
}

const getCellValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const getHeaderClass = (column: Column) => [
  'table-header',
  `table-header--${column.align || 'left'}`,
  {
    'table-header--sortable': column.sortable,
    'table-header--sorted': sortKey.value === column.key
  }
]

const getCellClass = (column: Column) => [
  'table-cell',
  `table-cell--${column.align || 'left'}`
]

const getRowClass = (_row: any, index: number) => [
  'table-row',
  {
    'table-row--hoverable': props.hoverable,
    'table-row--striped': props.striped && index % 2 === 1
  }
]

const getColumnStyle = (column: Column) => {
  return column.width ? { width: column.width } : {}
}

const getSortIcon = (key: string) => {
  if (sortKey.value !== key) return '⇅'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const handleHeaderClick = (column: Column) => {
  if (!column.sortable) return

  if (sortKey.value === column.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortDirection.value = 'asc'
  }

  emit('sort', column.key, sortDirection.value)
}

const handleRowClick = (row: any, index: number) => {
  emit('row-click', row, index)
}
</script>

<style scoped>
.data-table-container {
  width: 100%;
  background: var(--md-sys-color-surface, white);
  border-radius: 8px;
  overflow: hidden;
}

.data-table-toolbar {
  padding: 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}

.data-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  padding: 12px 16px;
  background: var(--md-sys-color-surface-variant, #f5f5f5);
  color: var(--md-sys-color-on-surface, #1d1d1d);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}

.table-header--sortable {
  cursor: pointer;
  user-select: none;
}

.table-header--sortable:hover {
  background: var(--md-sys-color-surface-container, #eeeeee);
}

.table-header--left {
  text-align: left;
}

.table-header--center {
  text-align: center;
}

.table-header--right {
  text-align: right;
}

.table-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-icon {
  opacity: 0.5;
  font-size: 16px;
}

.table-header--sorted .sort-icon {
  opacity: 1;
}

.table-row {
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}

.table-row--hoverable {
  cursor: pointer;
  transition: background 0.2s ease;
}

.table-row--hoverable:hover {
  background: var(--md-sys-color-surface-variant, #f5f5f5);
}

.table-row--striped {
  background: rgba(0, 0, 0, 0.02);
}

.table-cell {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--md-sys-color-on-surface, #1d1d1d);
}

.table-cell--left {
  text-align: left;
}

.table-cell--center {
  text-align: center;
}

.table-cell--right {
  text-align: right;
}

.data-table-empty {
  text-align: center;
}

.empty-message {
  padding: 48px 16px;
  color: var(--md-sys-color-on-surface-variant, #666);
  font-size: 14px;
  margin: 0;
}

.data-table-footer {
  padding: 16px;
  border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}
</style>
