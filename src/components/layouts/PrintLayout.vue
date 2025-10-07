<template>
  <div class="print-layout">
    <header v-if="$slots.header" class="print-header">
      <slot name="header" />
    </header>

    <main class="print-content">
      <slot />
    </main>

    <footer v-if="$slots.footer" class="print-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Props {
  pageSize?: 'A4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  showPageNumbers?: boolean
}

withDefaults(defineProps<Props>(), {
  pageSize: 'A4',
  orientation: 'portrait',
  showPageNumbers: false
})
</script>

<style scoped>
.print-layout {
  background: var(--md-sys-color-surface);
  color: black;
}

.print-header {
  padding: 20mm;
  border-bottom: 1px solid #ccc;
}

.print-content {
  padding: 20mm;
}

.print-footer {
  padding: 20mm;
  border-top: 1px solid #ccc;
}

@media print {
  .print-layout {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  @page {
    size: v-bind(pageSize) v-bind(orientation);
    margin: 0;
  }

  .print-header,
  .print-footer {
    page-break-inside: avoid;
  }

  .print-content {
    page-break-before: auto;
    page-break-after: auto;
  }
}

@media screen {
  .print-layout {
    max-width: 210mm;
    margin: 20px auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
