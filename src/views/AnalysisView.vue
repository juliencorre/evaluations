<template>
  <div class="analysis-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Analyses"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      @back="navigateToWelcome"
      @user-menu-click="handleUserMenuClick"
      @logout="handleLogout"
    />

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Dashboard View (always shown) -->
      <DashboardView />
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Components
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import DashboardView from '@/components/analysis/DashboardView.vue'
import { useLogout } from '@/composables/useLogout'

// State
const router = useRouter()
const isScrolled = ref(false)

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Event handlers
const navigateToWelcome = () => {
  router.push('/welcome')
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
}


const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
}
</script>

<style scoped>
.analysis-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 24px 32px 80px;
  background-color: var(--md-sys-color-surface);
}


/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 16px 16px 80px;
  }
}

@media (min-width: 1440px) {
  .main-content {
    padding: 24px 32px 80px 80px;
  }
}

</style>