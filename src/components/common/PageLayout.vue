<template>
  <div class="page-layout">
    <!-- App Bar -->
    <PageAppBar
      :title="title"
      :elevated="isScrolled"
    >
      <template #leading>
        <slot name="app-bar-leading" />
      </template>
      <template #trailing>
        <slot name="app-bar-trailing">
          <button class="icon-button" aria-label="Rechercher">
            <span class="material-symbols-outlined">search</span>
          </button>
          <button class="icon-button user-menu-button" aria-label="Menu utilisateur">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
        </slot>
      </template>
    </PageAppBar>

    <!-- Tabs (optional) -->
    <TabContainer
      v-if="tabs && tabs.length > 0"
      :tabs="tabs"
      :model-value="activeTab || ''"
      :aria-label="tabsAriaLabel || 'Navigation'"
      @update:model-value="$emit('update:activeTab', $event)"
    />

    <!-- Main Content -->
    <main ref="mainContentRef" class="main-content">
      <slot />
    </main>

    <!-- FAB (optional) -->
    <slot name="fab" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import PageAppBar from './PageAppBar.vue'
import TabContainer, { type Tab } from './TabContainer.vue'

interface Props {
  title: string
  tabs?: Tab[]
  activeTab?: string
  tabsAriaLabel?: string
}

interface Emits {
  (e: 'update:activeTab', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()

// Scroll state for app bar elevation
const isScrolled = ref(false)
const mainContentRef = ref<HTMLElement | null>(null)

const handleScroll = () => {
  if (mainContentRef.value) {
    isScrolled.value = mainContentRef.value.scrollTop > 0
  }
}

onMounted(() => {
  if (mainContentRef.value) {
    mainContentRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (mainContentRef.value) {
    mainContentRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background-color: var(--md-sys-color-surface);
  /* Add top padding to account for fixed app bar */
  padding-top: 88px; /* 64px app bar + 24px margin */
}

/* Adjust padding when tabs are present */
.page-layout:has(.tabs-container) .main-content {
  padding-top: 136px; /* 64px app bar + 48px tabs + 24px margin */
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 80px 16px 24px;
  }

  .page-layout:has(.tabs-container) .main-content {
    padding-top: 128px;
  }
}

@media (min-width: 1440px) {
  .main-content {
    padding-left: 80px; /* Account for side navigation */
  }
}
</style>