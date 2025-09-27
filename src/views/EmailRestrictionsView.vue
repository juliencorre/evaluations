<template>
  <div class="email-restrictions-page">
    <h1 class="visually-hidden">Administration des restrictions d'emails</h1>

    <!-- App Bar -->
    <CenterAppBar
      title="Restrictions d'emails"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-school-icon="false"
      @user-menu-click="handleUserMenuClick"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <main class="restrictions-content" role="main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <p>Chargement des restrictions...</p>
      </div>

      <!-- Content -->
      <div v-else class="restrictions-container">
        <!-- Header Section -->
        <div class="header-section">
          <div class="header-content">
            <h2 class="header-title">Gestion des restrictions d'emails</h2>
            <p class="header-description">
              Configurez les emails et domaines autorisés pour l'inscription des utilisateurs.
            </p>
          </div>
          <button class="btn btn-primary" @click="openAddModal">
            <span class="material-symbols-outlined">add</span>
            Ajouter une règle
          </button>
        </div>

        <!-- Status Section -->
        <div class="status-section">
          <div class="status-card">
            <div class="status-icon">
              <span class="material-symbols-outlined">security</span>
            </div>
            <div class="status-content">
              <h3>État des restrictions</h3>
              <p v-if="activeRulesCount > 0">
                {{ activeRulesCount }} règle{{ activeRulesCount > 1 ? 's' : '' }} active{{ activeRulesCount > 1 ? 's' : '' }}
              </p>
              <p v-else class="status-warning">
                Aucune restriction active - tous les emails sont autorisés
              </p>
            </div>
          </div>
        </div>

        <!-- Rules List -->
        <div class="rules-section">
          <h3 class="section-title">Règles configurées</h3>

          <div v-if="emailRestrictions.length === 0" class="empty-state">
            <div class="empty-icon">
              <span class="material-symbols-outlined">rule</span>
            </div>
            <h4>Aucune règle configurée</h4>
            <p>Ajoutez des règles pour contrôler qui peut s'inscrire sur la plateforme.</p>
          </div>

          <div v-else class="rules-list">
            <div
              v-for="rule in emailRestrictions"
              :key="rule.id"
              class="rule-item"
              :class="{ 'rule-inactive': !rule.is_active }"
            >
              <div class="rule-icon">
                <span class="material-symbols-outlined">
                  {{ rule.rule_type === 'email' ? 'mail' : 'domain' }}
                </span>
              </div>

              <div class="rule-content">
                <div class="rule-header">
                  <h4 class="rule-value">
                    {{ rule.rule_type === 'domain' ? '@' + rule.value : rule.value }}
                  </h4>
                  <span class="rule-type">{{ rule.rule_type === 'email' ? 'Email exact' : 'Domaine' }}</span>
                </div>
                <p v-if="rule.description" class="rule-description">
                  {{ rule.description }}
                </p>
                <div class="rule-meta">
                  <span class="meta-item">
                    <span class="material-symbols-outlined">schedule</span>
                    {{ formatDate(rule.created_at) }}
                  </span>
                  <span class="meta-item" :class="{ 'status-active': rule.is_active, 'status-inactive': !rule.is_active }">
                    <span class="material-symbols-outlined">
                      {{ rule.is_active ? 'check_circle' : 'cancel' }}
                    </span>
                    {{ rule.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <div class="rule-actions">
                <button
                  class="btn-icon"
                  :aria-label="rule.is_active ? 'Désactiver' : 'Activer'"
                  @click="toggleRule(rule)"
                >
                  <span class="material-symbols-outlined">
                    {{ rule.is_active ? 'toggle_on' : 'toggle_off' }}
                  </span>
                </button>
                <button
                  class="btn-icon btn-danger"
                  aria-label="Supprimer"
                  @click="deleteRule(rule)"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Rule Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h3>Ajouter une règle de restriction</h3>
          <button class="btn-icon" @click="closeAddModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <form @submit.prevent="saveRule">
          <div class="modal-body">
            <!-- Type de règle -->
            <div class="field-group">
              <label class="field-label">Type de règle</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input v-model="newRule.rule_type" type="radio" value="email" />
                  <span class="radio-indicator"></span>
                  <span class="radio-label">Email exact</span>
                </label>
                <label class="radio-option">
                  <input v-model="newRule.rule_type" type="radio" value="domain" />
                  <span class="radio-indicator"></span>
                  <span class="radio-label">Domaine</span>
                </label>
              </div>
            </div>

            <!-- Valeur -->
            <div class="field-group">
              <label class="field-label" for="rule-value">
                {{ newRule.rule_type === 'email' ? 'Adresse email' : 'Nom de domaine' }}
              </label>
              <input
                id="rule-value"
                v-model="newRule.value"
                class="field-input"
                :type="newRule.rule_type === 'email' ? 'email' : 'text'"
                :placeholder="newRule.rule_type === 'email' ? 'admin@exemple.fr' : 'education.gouv.fr ou ac-*.fr'"
                required
              />
              <div class="field-hint">
                {{ newRule.rule_type === 'email'
                  ? 'Entrez l\'adresse email complète'
                  : 'Entrez le domaine (wildcards * supportés)'
                }}
              </div>
            </div>

            <!-- Description -->
            <div class="field-group">
              <label class="field-label" for="rule-description">Description (optionnel)</label>
              <textarea
                id="rule-description"
                v-model="newRule.description"
                class="field-textarea"
                placeholder="Description de cette règle..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn btn-outlined" @click="closeAddModal">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import { useLogout } from '@/composables/useLogout'
import { supabase } from '@/lib/supabase'

interface EmailRestriction {
  id: string
  rule_type: 'email' | 'domain'
  value: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// State
const isScrolled = ref(false)
const isLoading = ref(true)
const emailRestrictions = ref<EmailRestriction[]>([])
const showAddModal = ref(false)
const isSaving = ref(false)

const newRule = ref({
  rule_type: 'domain' as 'email' | 'domain',
  value: '',
  description: ''
})

const { logout } = useLogout()

// Computed
const activeRulesCount = computed(() =>
  emailRestrictions.value.filter(rule => rule.is_active).length
)

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  await loadRestrictions()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Functions
const loadRestrictions = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('email_restrictions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors du chargement des restrictions:', error)
    } else {
      emailRestrictions.value = data || []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des restrictions:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
}

const handleLogout = async () => {
  await logout()
}

const openAddModal = () => {
  newRule.value = {
    rule_type: 'domain',
    value: '',
    description: ''
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newRule.value = {
    rule_type: 'domain',
    value: '',
    description: ''
  }
}

const saveRule = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('email_restrictions')
      .insert([{
        rule_type: newRule.value.rule_type,
        value: newRule.value.value.toLowerCase().trim(),
        description: newRule.value.description.trim() || null,
        is_active: true
      }])

    if (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde: ' + error.message)
    } else {
      await loadRestrictions()
      closeAddModal()
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

const toggleRule = async (rule: EmailRestriction) => {
  try {
    const { error } = await supabase
      .from('email_restrictions')
      .update({ is_active: !rule.is_active })
      .eq('id', rule.id)

    if (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour')
    } else {
      await loadRestrictions()
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    alert('Erreur lors de la mise à jour')
  }
}

const deleteRule = async (rule: EmailRestriction) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer cette règle ?\n${rule.value}`)) {
    return
  }

  try {
    const { error } = await supabase
      .from('email_restrictions')
      .delete()
      .eq('id', rule.id)

    if (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    } else {
      await loadRestrictions()
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert('Erreur lors de la suppression')
  }
}
</script>

<style scoped>
/* Page layout */
.email-restrictions-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.restrictions-content {
  flex: 1;
  padding: 32px 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: var(--md-sys-color-on-surface-variant);
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
}

.header-description {
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  line-height: 1.5;
}

/* Status */
.status-section {
  margin-bottom: 32px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
}

.status-icon {
  width: 48px;
  height: 48px;
  background: var(--md-sys-color-secondary-container);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-secondary-container);
}

.status-icon .material-symbols-outlined {
  font-size: 24px;
}

.status-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 4px 0;
}

.status-content p {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.status-warning {
  color: var(--md-sys-color-error) !important;
  font-weight: 500;
}

/* Rules */
.rules-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 16px 0;
}

.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: var(--md-sys-color-on-surface-variant);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  color: var(--md-sys-color-outline);
}

.empty-icon .material-symbols-outlined {
  font-size: 80px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.rule-item.rule-inactive {
  opacity: 0.6;
}

.rule-icon {
  width: 40px;
  height: 40px;
  background: var(--md-sys-color-primary-container);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-primary-container);
  flex-shrink: 0;
}

.rule-content {
  flex: 1;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.rule-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.rule-type {
  font-size: 12px;
  padding: 4px 8px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-radius: 6px;
  font-weight: 500;
}

.rule-description {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  margin: 4px 0 8px 0;
}

.rule-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--md-sys-color-on-surface-variant);
}

.meta-item .material-symbols-outlined {
  font-size: 14px;
}

.status-active {
  color: var(--md-sys-color-tertiary) !important;
}

.status-inactive {
  color: var(--md-sys-color-outline) !important;
}

.rule-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.btn-primary:hover {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.btn-outlined {
  background: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}

.btn-outlined:hover {
  background: var(--md-sys-color-surface-container-high);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--md-sys-color-surface-container-high);
}

.btn-danger {
  color: var(--md-sys-color-error);
}

.btn-danger:hover {
  background: var(--md-sys-color-error-container);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--md-sys-color-surface);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

/* Form fields */
.field-group {
  margin-bottom: 24px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
}

.field-input, .field-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 8px;
  font-size: 14px;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface);
  transition: border-color 0.2s ease;
}

.field-input:focus, .field-textarea:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
}

.field-hint {
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant);
  margin-top: 4px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--md-sys-color-outline);
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.radio-option input[type="radio"]:checked + .radio-indicator {
  border-color: var(--md-sys-color-primary);
}

.radio-option input[type="radio"]:checked + .radio-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--md-sys-color-primary);
}

.radio-label {
  font-size: 14px;
  color: var(--md-sys-color-on-surface);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>