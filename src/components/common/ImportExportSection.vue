<template>
  <div class="import-export-container">
    <!-- Import Section -->
    <div class="import-section">
      <h2 class="section-title">{{ importTitle }}</h2>
      <p class="section-description">{{ importDescription }}</p>
      <div class="import-zone">
        <input
          type="file"
          :accept="fileAccept"
          class="file-input"
          @change="handleFileSelect"
        />
        <div class="import-zone-content">
          <span class="material-symbols-outlined import-icon">upload_file</span>
          <span class="import-text">
            {{ selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier' }}
          </span>
        </div>
      </div>
      <button
        v-if="selectedFile"
        class="btn-primary"
        :disabled="importing"
        @click="$emit('import', selectedFile)"
      >
        <span v-if="importing" class="material-symbols-outlined">sync</span>
        <span v-else class="material-symbols-outlined">upload</span>
        {{ importing ? 'Import en cours...' : 'Importer' }}
      </button>
    </div>

    <!-- Export Section -->
    <div class="export-section">
      <h2 class="section-title">{{ exportTitle }}</h2>
      <p class="section-description">{{ exportDescription }}</p>
      <div class="export-actions">
        <button
          class="btn-primary"
          :disabled="exporting"
          @click="$emit('export')"
        >
          <span v-if="exporting" class="material-symbols-outlined">sync</span>
          <span v-else class="material-symbols-outlined">download</span>
          {{ exporting ? 'Export en cours...' : exportButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  importTitle?: string
  importDescription?: string
  exportTitle?: string
  exportDescription?: string
  exportButtonText?: string
  fileAccept?: string
  importing?: boolean
  exporting?: boolean
}

interface Emits {
  (e: 'import', file: globalThis.File): void
  (e: 'export'): void
}

withDefaults(defineProps<Props>(), {
  importTitle: 'Importer',
  importDescription: 'Sélectionnez un fichier à importer',
  exportTitle: 'Exporter',
  exportDescription: 'Téléchargez vos données',
  exportButtonText: 'Exporter',
  fileAccept: '.json',
  importing: false,
  exporting: false
})

defineEmits<Emits>()

const selectedFile = ref<globalThis.File | null>(null)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  selectedFile.value = file || null
}
</script>

<style scoped>
.import-export-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.import-section,
.export-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0;
}

.section-description {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}

.import-zone {
  position: relative;
  background: var(--md-sys-color-surface-container-low, #f7f2fa);
  border: 2px dashed var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.import-zone:hover {
  background: var(--md-sys-color-surface-container, #f3edf7);
  border-color: var(--md-sys-color-primary, #6750a4);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.import-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.import-icon {
  font-size: 48px;
  color: var(--md-sys-color-primary, #6750a4);
}

.import-text {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.export-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 40px;
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 92%, var(--md-sys-color-on-primary, #ffffff) 8%);
  box-shadow:
    0px 1px 2px 0px rgba(0, 0, 0, 0.3),
    0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: 2px;
}

.btn-primary:disabled {
  background: var(--md-sys-color-on-surface, rgba(29, 27, 32, 0.12));
  color: var(--md-sys-color-on-surface, rgba(29, 27, 32, 0.38));
  cursor: not-allowed;
}

.btn-primary .material-symbols-outlined {
  font-size: 18px;
}

.btn-primary:disabled .material-symbols-outlined {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .import-export-container {
    gap: 24px;
  }

  .import-zone {
    padding: 24px 12px;
  }

  .import-icon {
    font-size: 40px;
  }

  .export-actions {
    flex-direction: column;
  }

  .btn-primary {
    justify-content: center;
  }
}
</style>