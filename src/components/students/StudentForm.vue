<template>
  <div class="student-form">
    <ContentSection
      title="Informations personnelles"
      :description="description"
    >
      <div class="form-fields">
        <div class="text-field-outlined">
          <input
            id="firstName"
            v-model="localStudent.firstName"
            type="text"
            required
            class="text-field-input-outlined"
            placeholder=" "
            maxlength="50"
          />
          <label for="firstName" class="text-field-label-outlined">Prénom *</label>
          <div class="text-field-outline">
            <div class="text-field-outline-start"></div>
            <div class="text-field-outline-notch">
              <div class="text-field-outline-leading"></div>
              <div class="text-field-outline-trailing"></div>
            </div>
            <div class="text-field-outline-end"></div>
          </div>
        </div>

        <div class="text-field-outlined">
          <input
            id="lastName"
            v-model="localStudent.lastName"
            type="text"
            required
            class="text-field-input-outlined"
            placeholder=" "
            maxlength="50"
          />
          <label for="lastName" class="text-field-label-outlined">Nom de famille *</label>
          <div class="text-field-outline">
            <div class="text-field-outline-start"></div>
            <div class="text-field-outline-notch">
              <div class="text-field-outline-leading"></div>
              <div class="text-field-outline-trailing"></div>
            </div>
            <div class="text-field-outline-end"></div>
          </div>
        </div>

        <div class="text-field-outlined">
          <select
            id="gender"
            v-model="localStudent.gender"
            class="text-field-input-outlined"
          >
            <option :value="null">Non spécifié</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
            <option value="Autre">Autre</option>
          </select>
          <label for="gender" class="text-field-label-outlined text-field-label-select">Sexe</label>
          <div class="text-field-outline">
            <div class="text-field-outline-start"></div>
            <div class="text-field-outline-notch">
              <div class="text-field-outline-leading"></div>
              <div class="text-field-outline-trailing"></div>
            </div>
            <div class="text-field-outline-end"></div>
          </div>
        </div>

        <div class="text-field-outlined">
          <input
            id="birthDate"
            v-model="localStudent.birthDate"
            type="date"
            class="text-field-input-outlined"
            placeholder=" "
          />
          <label for="birthDate" class="text-field-label-outlined">Date de naissance</label>
          <div class="text-field-outline">
            <div class="text-field-outline-start"></div>
            <div class="text-field-outline-notch">
              <div class="text-field-outline-leading"></div>
              <div class="text-field-outline-trailing"></div>
            </div>
            <div class="text-field-outline-end"></div>
          </div>
        </div>
      </div>
    </ContentSection>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ContentSection from '@/components/common/ContentSection.vue'
import type { Student } from '@/types/evaluation'

interface Props {
  student: Student
  isEditing?: boolean
}

interface Emits {
  (e: 'update:student', student: Student): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
})

const emit = defineEmits<Emits>()

const localStudent = ref<Student>({ ...props.student })
const isUpdatingFromProps = ref(false)

const description = computed(() => {
  return props.isEditing
    ? 'Modifiez les informations de l\'élève.'
    : 'Saisissez les informations du nouvel élève à ajouter à la classe.'
})

// Watch for external changes
watch(() => props.student, (newValue) => {
  isUpdatingFromProps.value = true
  localStudent.value = { ...newValue }
  // Reset flag on next tick to avoid blocking user input
  setTimeout(() => {
    isUpdatingFromProps.value = false
  }, 0)
}, { deep: true })

// Watch for local changes and emit (only when not updating from props)
watch(localStudent, (newValue) => {
  if (!isUpdatingFromProps.value) {
    emit('update:student', { ...newValue })
  }
}, { deep: true })
</script>

<style scoped>
.student-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Form Fields Layout */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Outlined Text Fields */
.text-field-outlined {
  position: relative;
  display: flex;
  flex-direction: column;
}

.text-field-input-outlined {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  background: transparent;
  border: none;
  outline: none;
  padding: 16px;
  min-height: 56px;
  box-sizing: border-box;
  width: 100%;
  caret-color: var(--md-sys-color-primary, #6750a4);
}

.text-field-label-outlined {
  position: absolute;
  left: 16px;
  top: 16px;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  background: var(--md-sys-color-surface);
  padding: 0 4px;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  transform-origin: left top;
  z-index: 1;
}

.text-field-input-outlined:focus + .text-field-label-outlined,
.text-field-input-outlined:not(:placeholder-shown) + .text-field-label-outlined {
  top: 0;
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-primary, #6750a4);
  transform: translateY(-50%);
}

.text-field-outline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  z-index: 0;
}

.text-field-outline-start {
  width: 12px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-right: none;
  border-radius: var(--md-sys-shape-corner-small, 4px) 0 0 var(--md-sys-shape-corner-small, 4px);
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-notch {
  flex: 1;
  display: flex;
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-leading {
  width: 12px;
  border-top: 1px solid var(--md-sys-color-outline, #79747e);
  border-bottom: 1px solid var(--md-sys-color-outline, #79747e);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-trailing {
  flex: 1;
  border-top: 1px solid var(--md-sys-color-outline, #79747e);
  border-bottom: 1px solid var(--md-sys-color-outline, #79747e);
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-end {
  width: 12px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-left: none;
  border-radius: 0 var(--md-sys-shape-corner-small, 4px) var(--md-sys-shape-corner-small, 4px) 0;
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

/* Focus States */
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-start,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-end,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-trailing {
  border-color: var(--md-sys-color-primary, #6750a4);
  border-width: 2px;
}

.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
  border-bottom-width: 2px;
  border-bottom-color: var(--md-sys-color-primary, #6750a4);
}

.text-field-input-outlined:not(:placeholder-shown) ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
}


/* Hover States */
.text-field-outlined:hover:not(:focus-within) .text-field-outline-start,
.text-field-outlined:hover:not(:focus-within) .text-field-outline-end,
.text-field-outlined:hover:not(:focus-within) .text-field-outline-trailing {
  border-color: var(--md-sys-color-on-surface, #1d1b20);
}

/* Select Field Specific Styles */
.text-field-input-outlined[type="date"] {
  cursor: pointer;
  color-scheme: light;
}

.text-field-input-outlined[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  color: var(--md-sys-color-primary, #6750a4);
}

select.text-field-input-outlined {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%2349454f' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

select.text-field-input-outlined:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%236750a4' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
}

.text-field-label-select {
  top: 0 !important;
  font-size: var(--md-sys-typescale-body-small-size, 12px) !important;
  font-weight: var(--md-sys-typescale-body-small-weight, 400) !important;
  line-height: var(--md-sys-typescale-body-small-line-height, 16px) !important;
  color: var(--md-sys-color-on-surface-variant, #49454f) !important;
  transform: translateY(-50%) !important;
}

select.text-field-input-outlined:focus ~ .text-field-label-select {
  color: var(--md-sys-color-primary, #6750a4) !important;
}
</style>