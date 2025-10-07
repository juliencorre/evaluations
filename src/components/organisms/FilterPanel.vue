<template>
  <Card :variant="variant" class="filter-panel">
    <template #header>
      <div class="filter-header">
        <h3 class="filter-title">{{ title }}</h3>
        <Button
          v-if="showClearAll && hasActiveFilters"
          variant="text"
          size="small"
          @click="handleClearAll"
        >
          Clear All
        </Button>
      </div>
    </template>

    <div class="filter-content">
      <slot />
    </div>

    <template v-if="$slots.footer || showApply" #footer>
      <div class="filter-footer">
        <slot name="footer">
          <div class="filter-actions">
            <Button variant="outlined" @click="handleCancel">
              Cancel
            </Button>
            <Button variant="filled" @click="handleApply">
              Apply Filters
            </Button>
          </div>
        </slot>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '../atoms/Card.vue'
import Button from '../atoms/Button.vue'

interface Props {
  title?: string
  variant?: 'elevated' | 'filled' | 'outlined'
  showClearAll?: boolean
  showApply?: boolean
  activeFiltersCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Filters',
  variant: 'outlined',
  showClearAll: true,
  showApply: false,
  activeFiltersCount: 0
})

const emit = defineEmits<{
  (e: 'clear-all'): void
  (e: 'apply'): void
  (e: 'cancel'): void
}>()

const hasActiveFilters = computed(() => props.activeFiltersCount > 0)

const handleClearAll = () => {
  emit('clear-all')
}

const handleApply = () => {
  emit('apply')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.filter-panel {
  min-width: 250px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1d1d1d);
  margin: 0;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-footer {
  display: flex;
  justify-content: flex-end;
}

.filter-actions {
  display: flex;
  gap: 8px;
}
</style>
