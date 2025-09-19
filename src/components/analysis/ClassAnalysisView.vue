<template>
  <div class="page-content">
    <section class="charts-section">
      <ChartCard
        title="Analyse par classe"
        subtitle="Performance des différentes classes"
      >
        <EmptyState
          title="Contenu à développer"
          description="Contenu de l'analyse par classe à développer"
        />
      </ChartCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import ChartCard from '@/components/analysis/ChartCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<style scoped>
/* Page Content */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
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
  .charts-grid {
    gap: 16px;
  }
}
</style>