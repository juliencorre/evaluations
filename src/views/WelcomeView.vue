<template>
  <div class="welcome-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Accueil"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="false"
      @logout="handleLogout"
    />

    <!-- Welcome Content -->
    <div class="page-content">
      <div class="welcome-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-icon">
            <span class="material-symbols-outlined">school</span>
          </div>
          <h1 class="hero-title">Bienvenue dans Évaluations</h1>
          <p class="hero-subtitle">
            Gérez facilement les évaluations de compétences de vos élèves
          </p>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CenterAppBar from '@/components/common/CenterAppBar.vue'

// State
const isScrolled = ref(false)

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}


// Event handlers

const handleLogout = () => {
  console.log('Logout requested')
  window.alert('Déconnexion - Fonctionnalité à venir')
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.welcome-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 80px;
}

.welcome-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 32px 16px;
  margin-bottom: 16px;
}

.hero-icon {
  margin-bottom: 16px;
}

.hero-icon .material-symbols-outlined {
  font-size: 64px;
  color: var(--md-sys-color-primary);
}

.hero-title {
  font-family: var(--md-sys-typescale-headline-large-font);
  font-size: var(--md-sys-typescale-headline-large-size);
  font-weight: var(--md-sys-typescale-headline-large-weight);
  line-height: var(--md-sys-typescale-headline-large-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 16px 0;
}

.hero-subtitle {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* Section Titles */
.section-title {
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 24px 0;
}



/* Responsive */
@media (max-width: 768px) {
  .page-content {
    padding: 16px 8px 80px;
  }

  .welcome-container {
    gap: 24px;
  }

  .hero-section {
    padding: 24px 16px;
  }

  .hero-icon .material-symbols-outlined {
    font-size: 48px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 12px 4px 80px;
  }

  .hero-section {
    padding: 20px 12px;
  }
}
</style>