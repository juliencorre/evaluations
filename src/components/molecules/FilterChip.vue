<template>
  <Chip
    :variant="selected ? 'filled' : 'outlined'"
    :color="color"
    :size="size"
    :icon="icon"
    :selected="selected"
    :disabled="disabled"
    :removable="removable"
    @click="handleClick"
    @remove="handleRemove"
  >
    <slot />
  </Chip>
</template>

<script setup lang="ts">
import Chip from '../atoms/Chip.vue'

interface Props {
  selected?: boolean
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning'
  size?: 'small' | 'medium'
  icon?: string
  disabled?: boolean
  removable?: boolean
  value?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  color: 'primary',
  size: 'medium',
  disabled: false,
  removable: false
})

const emit = defineEmits<{
  (e: 'click', value?: string | number): void
  (e: 'remove', value?: string | number): void
  (e: 'toggle', selected: boolean, value?: string | number): void
}>()

const handleClick = () => {
  emit('click', props.value)
  emit('toggle', !props.selected, props.value)
}

const handleRemove = () => {
  emit('remove', props.value)
}
</script>
