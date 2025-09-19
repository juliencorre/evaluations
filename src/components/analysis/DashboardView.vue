<template>
  <div class="page-content">
    <!-- Métriques principales -->
    <section class="metrics-section">
      <div class="metrics-grid">
        <MetricCard
          label="Moyenne générale"
          :value="averageScore + '/4'"
          trend="+0.2 points"
          trend-type="positive"
        />
      </div>
    </section>

    <!-- Graphiques et analyses -->
    <section class="charts-section">
      <div class="charts-grid">
        <!-- Distribution des niveaux -->
        <ChartCard
          title="Distribution des niveaux"
          subtitle="Répartition des élèves par niveau de maîtrise"
        >
          <LevelDistributionChart :levels="levelDistribution" />
        </ChartCard>

        <!-- Progression dans le temps -->
        <ChartCard
          title="Évolution des résultats"
          subtitle="Progression des moyennes sur les 6 derniers mois"
        >
          <ProgressChart :data="progressData" />
        </ChartCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MetricCard from '@/components/analysis/MetricCard.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'
import LevelDistributionChart from '@/components/analysis/LevelDistributionChart.vue'
import ProgressChart from '@/components/analysis/ProgressChart.vue'

// Données calculées
const averageScore = ref(2.8)

// Distribution des niveaux de maîtrise
const levelDistribution = ref([
  { name: 'Non acquis', count: 12, percentage: 15, class: 'level-not-acquired' },
  { name: "En cours d'acquisition", count: 28, percentage: 35, class: 'level-in-progress' },
  { name: 'Acquis', count: 32, percentage: 40, class: 'level-acquired' },
  { name: 'Expert', count: 8, percentage: 10, class: 'level-expert' }
])

// Progress data
const progressData = computed(() => [
  { value: 2.1, label: 'Sept' },
  { value: 2.3, label: 'Oct' },
  { value: 2.5, label: 'Nov' },
  { value: 2.6, label: 'Déc' },
  { value: 2.7, label: 'Jan' },
  { value: 2.8, label: 'Fév' }
])
</script>

<style scoped>
/* Page Content */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Metrics Section */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* Charts Section */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .charts-grid {
    gap: 16px;
  }
}
</style>