<template>
  <div class="demo-container">
    <h2>Démonstration ResultSelector</h2>

    <div class="demo-section">
      <h3>ResultSelector - Échelle A-E</h3>
      <div class="demo-widget">
        <ResultSelector
          v-model="scaleValue"
          :options="scaleOptions"
          placeholder="Choisir un niveau..."
          @change="onScaleChange"
        />
        <p class="demo-output">Valeur sélectionnée: {{ scaleValue || 'Aucune' }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h3>ResultSelector - Booléen Oui/Non</h3>
      <div class="demo-widget">
        <ResultSelector
          v-model="booleanValue"
          :options="booleanOptions"
          placeholder="Acquis ou Non acquis..."
          @change="onBooleanChange"
        />
        <p class="demo-output">Valeur sélectionnée: {{ booleanValue || 'Aucune' }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h3>ResultSelector - Type personnalisé</h3>
      <div class="demo-widget">
        <ResultSelector
          v-model="customValue"
          :options="customOptions"
          placeholder="Niveau de performance..."
          @change="onCustomChange"
        />
        <p class="demo-output">Valeur sélectionnée: {{ customValue || 'Aucune' }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h3>InlineResultSelector - Simulation tableau</h3>
      <div ref="tableCellRef" class="demo-table-cell" @click="toggleInlineSelector">
        <span v-if="!showInline" class="demo-cell-value">
          {{ inlineValue || 'Cliquer pour éditer' }}
        </span>
      </div>
      <InlineResultSelector
        v-if="showInline"
        :options="scaleOptions"
        :selected-value="inlineValue"
        :trigger-element="tableCellRef"
        @select="onInlineSelect"
        @close="closeInlineSelector"
      />
    </div>

    <div class="demo-logs">
      <h3>Journal des événements</h3>
      <div class="logs-container">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ResultTypeConfigValue } from '@/types/evaluation'
import ResultSelector from './ResultSelector.vue'
import InlineResultSelector from './InlineResultSelector.vue'

// Données réactives
const scaleValue = ref<string>('')
const booleanValue = ref<string>('')
const customValue = ref<string>('')
const inlineValue = ref<string>('')
const showInline = ref(false)
const logs = ref<Array<{ time: string; message: string }>>([])
const tableCellRef = ref<HTMLElement>()

// Options de différents types
const scaleOptions: ResultTypeConfigValue[] = [
  { label: 'A - Très bonne maîtrise', value: 'A', pivot_value: 10 },
  { label: 'B - Maîtrise satisfaisante', value: 'B', pivot_value: 7.5 },
  { label: 'C - Maîtrise fragile', value: 'C', pivot_value: 5 },
  { label: 'D - Maîtrise insuffisante', value: 'D', pivot_value: 2.5 },
  { label: 'E - Maîtrise très insuffisante', value: 'E', pivot_value: 0 },
  { label: 'N/A - Non évalué', value: 'N/A', pivot_value: 0 }
]

const booleanOptions: ResultTypeConfigValue[] = [
  { label: 'Oui - Acquis', value: 'Oui', pivot_value: 10 },
  { label: 'Non - Non acquis', value: 'Non', pivot_value: 0 },
  { label: 'N/A - Non évalué', value: 'N/A', pivot_value: 0 }
]

const customOptions: ResultTypeConfigValue[] = [
  { label: 'Excellent', value: 'excellent', pivot_value: 10 },
  { label: 'Très bien', value: 'tres-bien', pivot_value: 8 },
  { label: 'Bien', value: 'bien', pivot_value: 6 },
  { label: 'Assez bien', value: 'assez-bien', pivot_value: 4 },
  { label: 'Insuffisant', value: 'insuffisant', pivot_value: 2 },
  { label: 'Non évalué', value: 'non-evalue', pivot_value: 0 }
]

// Fonctions de gestion des événements
function addLog(message: string) {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message })
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

function onScaleChange(option: ResultTypeConfigValue) {
  addLog(`Échelle A-E: ${option.label} (valeur: ${option.value}, pivot: ${option.pivot_value})`)
}

function onBooleanChange(option: ResultTypeConfigValue) {
  addLog(`Booléen: ${option.label} (valeur: ${option.value}, pivot: ${option.pivot_value})`)
}

function onCustomChange(option: ResultTypeConfigValue) {
  addLog(`Personnalisé: ${option.label} (valeur: ${option.value}, pivot: ${option.pivot_value})`)
}

function toggleInlineSelector() {
  showInline.value = !showInline.value
  if (showInline.value) {
    addLog('Ouverture du sélecteur inline')
  }
}

function onInlineSelect(option: ResultTypeConfigValue) {
  inlineValue.value = option.value
  addLog(`Sélection inline: ${option.label} (valeur: ${option.value})`)
}

function closeInlineSelector() {
  showInline.value = false
  addLog('Fermeture du sélecteur inline')
}
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: var(--md-sys-typescale-body-large-font);
}

.demo-container h2 {
  font-family: var(--md-sys-typescale-headline-medium-font);
  font-size: var(--md-sys-typescale-headline-medium-size);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 32px;
  text-align: center;
}

.demo-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--md-sys-color-surface-container-low);
  border-radius: var(--md-sys-shape-corner-large);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.demo-section h3 {
  font-family: var(--md-sys-typescale-title-medium-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 16px 0;
}

.demo-widget {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

.demo-output {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  padding: 8px 12px;
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-shape-corner-small);
}

.demo-table-cell {
  position: relative;
  width: 120px;
  height: 40px;
  padding: 8px 12px;
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-cell-value {
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface);
  text-align: center;
}

.demo-logs {
  margin-top: 40px;
}

.demo-logs h3 {
  font-family: var(--md-sys-typescale-title-medium-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 16px 0;
}

.logs-container {
  background: var(--md-sys-color-surface-container-lowest);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
}

.log-time {
  color: var(--md-sys-color-primary);
  font-weight: 500;
  flex-shrink: 0;
}

.log-message {
  color: var(--md-sys-color-on-surface);
}

/* Responsive */
@media (max-width: 768px) {
  .demo-container {
    padding: 16px;
  }

  .demo-section {
    padding: 16px;
  }

  .demo-widget {
    max-width: 100%;
  }
}
</style>