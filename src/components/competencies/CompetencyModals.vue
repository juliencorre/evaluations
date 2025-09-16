<template>
  <!-- Add Domain Modal -->
  <div v-if="modals.addDomain.visible" class="modal-overlay" @click="closeModal('addDomain')">
    <div class="modal-content" @click.stop>
      <h3>Ajouter un nouveau domaine</h3>
      <div class="form-group">
        <label for="domain-name">Nom du domaine :</label>
        <input
          id="domain-name"
          v-model="modals.addDomain.form.name"
          type="text"
          class="form-input"
          placeholder="Entrez le nom du domaine"
        />
      </div>
      <div class="form-group">
        <label for="domain-description">Description :</label>
        <textarea
          id="domain-description"
          v-model="modals.addDomain.form.description"
          class="form-textarea"
          placeholder="Entrez la description du domaine"
        />
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" @click="closeModal('addDomain')">Annuler</button>
        <button class="btn-primary" @click="$emit('submit-add-domain', modals.addDomain.form)">Ajouter</button>
      </div>
    </div>
  </div>

  <!-- Edit Domain Modal -->
  <div v-if="modals.editDomain.visible" class="modal-overlay" @click="closeModal('editDomain')">
    <div class="modal-content" @click.stop>
      <h3>Modifier le domaine</h3>
      <div class="form-group">
        <label for="edit-domain-name">Nom du domaine :</label>
        <input
          id="edit-domain-name"
          v-model="modals.editDomain.form.name"
          type="text"
          class="form-input"
          placeholder="Entrez le nom du domaine"
        />
      </div>
      <div class="form-group">
        <label for="edit-domain-description">Description :</label>
        <textarea
          id="edit-domain-description"
          v-model="modals.editDomain.form.description"
          class="form-textarea"
          placeholder="Entrez la description du domaine"
        />
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" @click="closeModal('editDomain')">Annuler</button>
        <button class="btn-primary" @click="$emit('submit-edit-domain', modals.editDomain.form)">Modifier</button>
      </div>
    </div>
  </div>

  <!-- Delete Domain Modal -->
  <div v-if="modals.deleteDomain.visible" class="modal-overlay" @click="closeModal('deleteDomain')">
    <div class="modal-content" @click.stop>
      <h3>Supprimer le domaine</h3>
      <p>Êtes-vous sûr de vouloir supprimer le domaine "{{ modals.deleteDomain.item?.name }}" ?</p>
      <p class="warning-text">Cette action est irréversible et supprimera tous les champs et compétences associés.</p>
      <div class="modal-actions">
        <button class="btn-secondary" @click="closeModal('deleteDomain')">Annuler</button>
        <button class="btn-danger" @click="$emit('submit-delete-domain', modals.deleteDomain.item)">Supprimer</button>
      </div>
    </div>
  </div>

  <!-- Add Field Modal -->
  <div v-if="modals.addField.visible" class="modal-overlay" @click="closeModal('addField')">
    <div class="modal-content" @click.stop>
      <h3>Ajouter un nouveau champ</h3>
      <div class="form-group">
        <label for="field-name">Nom du champ :</label>
        <input
          id="field-name"
          v-model="modals.addField.form.name"
          type="text"
          class="form-input"
          placeholder="Entrez le nom du champ"
        />
      </div>
      <div class="form-group">
        <label for="field-description">Description :</label>
        <textarea
          id="field-description"
          v-model="modals.addField.form.description"
          class="form-textarea"
          placeholder="Entrez la description du champ"
        />
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" @click="closeModal('addField')">Annuler</button>
        <button class="btn-primary" @click="$emit('submit-add-field', modals.addField.form)">Ajouter</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModalForm {
  name: string
  description: string
}

interface ModalItem {
  id: string
  name: string
  description: string
}

interface Modal {
  visible: boolean
  form: ModalForm
  item?: ModalItem
}

interface Modals {
  addDomain: Modal
  editDomain: Modal
  deleteDomain: Modal
  addField: Modal
}

defineProps<{
  modals: Modals
}>()

const emit = defineEmits<{
  'close-modal': [type: keyof Modals]
  'submit-add-domain': [form: ModalForm]
  'submit-edit-domain': [form: ModalForm]
  'submit-delete-domain': [item: ModalItem | undefined]
  'submit-add-field': [form: ModalForm]
}>()

const closeModal = (type: keyof Modals) => {
  emit('close-modal', type)
}
</script>