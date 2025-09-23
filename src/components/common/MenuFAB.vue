<template>
  <div ref="menuFabRef" class="menu-fab">
    <!-- Scrim supprimé pour éviter l'effet sombre sur toute la page -->

    <!-- Mini FABs avec labels -->
    <TransitionGroup name="mini-fab" tag="div">
      <button
        v-for="(item, index) in menuItems"
        v-if="isOpen"
        :key="item.key"
        class="mini-fab-item mini-fab"
        :class="`mini-fab--${item.type || 'default'}`"
        :style="{ '--delay': `${index * 0.05}s` }"
        :aria-label="item.ariaLabel"
        @click="handleItemClick(item)"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        <span class="mini-fab-label">{{ item.label }}</span>
      </button>
    </TransitionGroup>

    <!-- FAB principal -->
    <button
      class="main-fab"
      :class="{ 'main-fab--expanded': isOpen }"
      :aria-label="isOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      <span class="fab-icon" :class="{ 'fab-icon--rotated': isOpen }">
        <span class="material-symbols-outlined">add</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MenuItem {
  key: string
  icon: string
  label: string
  ariaLabel: string
  type?: string
}

interface Props {
  menuItems?: MenuItem[]
}

interface Emits {
  (e: 'menu-item-click', item: MenuItem): void
  // Legacy events for backward compatibility
  (e: 'edit'): void
  (e: 'delete'): void
}

withDefaults(defineProps<Props>(), {
  menuItems: () => [
    { key: 'edit', icon: 'edit', label: 'Éditer', ariaLabel: 'Éditer l\'évaluation', type: 'edit' },
    { key: 'delete', icon: 'delete', label: 'Supprimer', ariaLabel: 'Supprimer l\'évaluation', type: 'delete' }
  ]
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const menuFabRef = ref<HTMLElement>()

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function handleItemClick(item: MenuItem) {
  emit('menu-item-click', item)
  // Legacy support
  if (item.key === 'edit') {
    emit('edit')
  } else if (item.key === 'delete') {
    emit('delete')
  }
  closeMenu()
}

function handleClickOutside(event: Event) {
  if (menuFabRef.value && !menuFabRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Container principal */
.menu-fab {
  position: fixed;
  bottom: 81px;
  right: 16px;
  z-index: 1050;
}

/* Scrim supprimé - pas d'effet sombre sur toute la page */

/* FAB principal - 56dp selon specs MD3 */
.main-fab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 16px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  cursor: pointer;
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14),
    0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
  z-index: 1;
}

.main-fab:hover {
  box-shadow:
    0px 5px 5px -3px rgba(0, 0, 0, 0.2),
    0px 8px 10px 1px rgba(0, 0, 0, 0.14),
    0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.main-fab:active {
  transform: scale(0.96);
}

/* État étendu du FAB */
.main-fab--expanded {
  /* Couleur plus sombre quand sélectionné */
  background: color-mix(in srgb, var(--md-sys-color-primary-container), black 20%);
  color: var(--md-sys-color-on-primary-container);
  border-radius: 26px;
}

/* Icône du FAB avec rotation */
.fab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 150ms cubic-bezier(0.2, 0, 0, 1);
}

.fab-icon--rotated {
  transform: rotate(45deg);
}

.fab-icon .material-symbols-outlined {
  font-size: 24px;
  font-weight: 400;
}

/* Items des mini FABs */
.mini-fab-item {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  right: 0px;
  border-radius: 26px;
  width: auto;
  height: 40px;
  padding: 0 16px 0 12px;
}

.mini-fab-item:nth-child(1) {
  bottom: 72px;
}

.mini-fab-item:nth-child(2) {
  bottom: 128px;
}

.mini-fab-item:nth-child(3) {
  bottom: 184px;
}

.mini-fab-item:nth-child(4) {
  bottom: 240px;
}

/* Mini FABs - avec labels intégrés */
.mini-fab {
  border: none;
  background: var(--md-sys-color-primary-container);
  cursor: pointer;
  box-shadow:
    0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);
  transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
}

.mini-fab:hover {
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14),
    0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  transform: scale(1.05);
}

.mini-fab:active {
  transform: scale(0.95);
}

.mini-fab .material-symbols-outlined {
  font-size: 20px;
  font-weight: 400;
}

.mini-fab--edit {
  color: var(--md-sys-color-primary);
}

.mini-fab--delete {
  color: var(--md-sys-color-primary);
}

/* Labels des mini FABs intégrés */
.mini-fab-label {
  font-family: var(--md-sys-typescale-body-small-font-family-name);
  font-size: var(--md-sys-typescale-body-small-font-size);
  font-weight: var(--md-sys-typescale-body-small-font-weight);
  line-height: var(--md-sys-typescale-body-small-line-height);
  color: var(--md-sys-color-on-primary-container);
  white-space: nowrap;
}

/* Animations selon Material Motion */
.mini-fab-enter-active {
  transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
  transition-delay: calc(var(--delay, 0s));
}

.mini-fab-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 1, 1);
}

.mini-fab-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.8);
}

.mini-fab-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.9);
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .menu-fab {
    bottom: 81px;
    right: 16px;
  }

  .main-fab {
    width: 56px;
    height: 56px;
  }

  .fab-icon .material-symbols-outlined {
    font-size: 24px;
  }

  .mini-fab-item {
    /* Repositionner pour aligner le bord droit avec le FAB principal */
    right: auto;
    left: 0px;
    transform: translateX(calc(-100% + 56px));
    gap: 8px;
    white-space: nowrap;
  }

  /* Réduire la taille des labels sur très petits écrans */
  .mini-fab-label {
    font-size: 11px;
    padding: 4px 6px;
  }

  .mini-fab-item:nth-child(1) {
    bottom: 72px;
  }

  .mini-fab-item:nth-child(2) {
    bottom: 120px;
  }

  .mini-fab-item:nth-child(3) {
    bottom: 168px;
  }

  .mini-fab-item:nth-child(4) {
    bottom: 216px;
  }

  .mini-fab {
    width: 40px;
    height: 40px;
  }

  .mini-fab .material-symbols-outlined {
    font-size: 20px;
  }

  .mini-fab-label {
    padding: 6px 8px;
    font-size: 12px;
  }
}

/* Responsive - Compact */
@media (max-width: 599px) {
  .menu-fab {
    bottom: 81px;
    right: 16px;
  }

  /* Sur très petits écrans, repositionner différemment */
  .mini-fab-item {
    right: 0px;
    left: auto;
    transform: none;
    max-width: calc(100vw - 32px);
    box-sizing: border-box;
    /* Forcer la troncature du texte si nécessaire */
    overflow: hidden;
  }

  .mini-fab-label {
    font-size: 10px;
    padding: 4px 6px;
    /* Permettre la troncature du texte */
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
  }
}

/* Très petits écrans - supprimer les labels et centrer les icônes */
@media (max-width: 480px) {
  .mini-fab-item {
    /* Centrer les mini-FABs avec le FAB principal */
    right: 0px;
    left: auto;
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    /* Ajustement pour centrage parfait: (56px - 40px) / 2 = 8px */
    transform: translateX(-8px);
  }

  .mini-fab-label {
    /* Masquer complètement les labels */
    display: none;
  }

  .mini-fab-item .material-symbols-outlined {
    margin: 0;
  }
}

/* Spécifique aux appareils tactiles pour corriger les différences */
@media (max-width: 480px) and (hover: none) and (pointer: coarse) {
  .menu-fab {
    /* Position plus précise sur mobile */
    right: 16px !important;
  }

  .mini-fab-item {
    right: 0px !important;
    transform: translateX(-8px) !important;
    /* Force la largeur et hauteur exactes */
    width: 40px !important;
    height: 40px !important;
    min-width: 40px;
    max-width: 40px;
  }

  .main-fab {
    /* S'assurer que le FAB principal a la bonne taille */
    width: 56px !important;
    height: 56px !important;
    min-width: 56px;
    max-width: 56px;
  }
}
</style>