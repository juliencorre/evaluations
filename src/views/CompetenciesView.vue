<template>
  <div class="competencies-page">
    <!-- Top App Bar -->
    <TopAppBar
      :title="currentPageTitle"
      :subtitle="currentPageDescription"
      variant="medium"
    />

    <!-- Material 3 Tabs -->
    <div class="tabs-container">
      <div class="tabs-bar">
        <button
          v-for="tab in tabItems"
          :key="tab.id"
          class="tab"
          :class="{ active: activeView === tab.value }"
          @click="activeView = tab.value"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <div class="tab-indicator"></div>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">

      <!-- Tree View -->
      <div v-if="activeView === 'tree'" class="page-content">
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Référentiels de compétences</h2>
          </div>

          <!-- Fonction de recherche temporairement désactivée -->
          <!--
          <div class="search-bar">
            <span class="material-symbols-outlined">search</span>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Rechercher dans les référentiels..."
              class="search-input"
            />
          </div>
          -->

          <div class="competencies-tree">
        <!-- Domain Level -->
        <div
          v-for="(domain, domainIndex) in frameworkWithDragDrop.domains"
          :key="domain.id"
          :class="[
            'tree-node',
            'domain-node',
            { 'ghost-element': domain.isGhost, 'dragging-element': domain.isDragging }
          ]"
          :draggable="!domain.isGhost && !domain.isDragging"
          @dragstart="!domain.isGhost && handleDragStart($event, domain, 'domain', domainIndex)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter($event, domain, 'domain', domainIndex)"
          @drop="handleDrop($event, domain, 'domain', domainIndex)"
        >
          <div class="node-content" @click="!domain.isGhost && toggleDomain(domain.id)">
            <span v-if="!domain.isGhost" class="node-icon">
              <span class="material-symbols-outlined">
                {{ expandedDomains.has(domain.id) ? 'expand_more' : 'chevron_right' }}
              </span>
            </span>
            <span class="node-label domain-label" :class="{ 'ghost-text': domain.isGhost }">
              {{ domain.isGhost ? 'Zone de dépôt' : domain.name }}
            </span>
            <div v-if="!domain.isGhost" class="node-actions">
              <button
                class="action-btn"
                title="Ajouter un champ"
                @click.stop="openAddFieldModal(domain)"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
              <button
                class="action-btn"
                title="Modifier le domaine"
                @click.stop="openEditDomainModal(domain)"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button
                class="action-btn delete-action"
                title="Supprimer le domaine"
                @click.stop="openDeleteDomainModal(domain)"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          <!-- Field Level -->
          <div v-if="expandedDomains.has(domain.id)" class="tree-children">
            <div
              v-for="(field, fieldIndex) in domain.fields"
              :key="field.id"
              :class="[
                'tree-node',
                'field-node',
                { 'ghost-element': field.isGhost, 'dragging-element': field.isDragging }
              ]"
              :draggable="!field.isGhost && !field.isDragging"
              @dragstart="(event) => {
                if (!field.isGhost) {
                  handleDragStart(event, field, 'field', fieldIndex, { domain });
                  event.stopPropagation();
                }
              }"
              @dragend="handleDragEnd"
              @dragover="handleDragOver"
              @dragenter="(event) => {
                handleDragEnter(event, field, 'field', fieldIndex, { domain });
                event.stopPropagation();
              }"
              @drop="handleDrop($event, field, 'field', fieldIndex, { domain })"
            >
              <div class="node-content" @click="!field.isGhost && toggleField(field.id)">
                <span v-if="!field.isGhost" class="node-icon">
                  <span class="material-symbols-outlined">
                    {{ expandedFields.has(field.id) ? 'expand_more' : 'chevron_right' }}
                  </span>
                </span>
                <span class="node-label field-label" :class="{ 'ghost-text': field.isGhost }">
                  {{ field.isGhost ? 'Zone de dépôt' : field.name }}
                </span>
                <div v-if="!field.isGhost" class="node-actions">
                  <button
                    class="action-btn"
                    title="Ajouter une compétence"
                    @click.stop="openAddCompetencyModal(field, domain)"
                  >
                    <span class="material-symbols-outlined">add</span>
                  </button>
                  <button
                    class="action-btn"
                    title="Modifier le champ"
                    @click.stop="openEditFieldModal(field, domain)"
                  >
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    class="action-btn delete-action"
                    title="Supprimer le champ"
                    @click.stop="openDeleteFieldModal(field, domain)"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>

              <!-- Competency Level -->
              <div v-if="expandedFields.has(field.id)" class="tree-children">
                <div
                  v-for="(competency, competencyIndex) in field.competencies"
                  :key="competency.id"
                  :class="[
                    'tree-node',
                    'competency-node',
                    {
                      'ghost-element': competency.isGhost,
                      'dragging-element': competency.isDragging
                    }
                  ]"
                  :draggable="!competency.isGhost && !competency.isDragging"
                  @dragstart="(event) => {
                    if (!competency.isGhost) {
                      handleDragStart(event, competency, 'competency', competencyIndex, {
                        domain,
                        field
                      });
                      event.stopPropagation();
                    }
                  }"
                  @dragend="handleDragEnd"
                  @dragover="handleDragOver"
                  @dragenter="(event) => {
                    handleDragEnter(event, competency, 'competency', competencyIndex, {
                      domain,
                      field
                    });
                    event.stopPropagation();
                  }"
                  @drop="
                    handleDrop($event, competency, 'competency', competencyIndex, { domain, field })
                  "
                >
                  <div
                    class="node-content"
                    @click="!competency.isGhost && toggleCompetency(competency.id)"
                  >
                    <span v-if="!competency.isGhost" class="node-icon">
                      <span class="material-symbols-outlined">
                        {{
                          expandedCompetencies.has(competency.id) ? 'expand_more' : 'chevron_right'
                        }}
                      </span>
                    </span>
                    <span
                      class="node-label competency-label"
                      :class="{ 'ghost-text': competency.isGhost }"
                    >
                      {{ competency.isGhost ? 'Zone de dépôt' : competency.name }}
                    </span>
                    <div v-if="!competency.isGhost" class="node-actions">
                      <button
                        class="action-btn"
                        title="Ajouter une sous-compétence"
                        @click.stop="openAddSpecificCompetencyModal(competency, field, domain)"
                      >
                        <span class="material-symbols-outlined">add</span>
                      </button>
                      <button
                        class="action-btn"
                        title="Modifier la compétence"
                        @click.stop="openEditCompetencyModal(competency, field, domain)"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        class="action-btn delete-action"
                        title="Supprimer la compétence"
                        @click.stop="openDeleteCompetencyModal(competency, field, domain)"
                      >
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>

                  <!-- Specific Competency Level -->
                  <div v-if="expandedCompetencies.has(competency.id)" class="tree-children">
                    <div
                      v-for="(specificCompetency, specificIndex) in competency.specificCompetencies"
                      :key="specificCompetency.id"
                      :class="[
                        'tree-node',
                        'specific-competency-node',
                        {
                          'ghost-element': specificCompetency.isGhost,
                          'dragging-element': specificCompetency.isDragging
                        }
                      ]"
                      :draggable="!specificCompetency.isGhost && !specificCompetency.isDragging"
                      @dragstart="(event) => {
                        if (!specificCompetency.isGhost) {
                          handleDragStart(
                            event,
                            specificCompetency,
                            'specificCompetency',
                            specificIndex,
                            { domain, field, competency }
                          );
                          event.stopPropagation();
                        }
                      }"
                      @dragend="handleDragEnd"
                      @dragover="handleDragOver"
                      @dragenter="(event) => {
                        handleDragEnter(
                          event,
                          specificCompetency,
                          'specificCompetency',
                          specificIndex,
                          { domain, field, competency }
                        );
                        event.stopPropagation();
                      }"
                      @drop="
                        handleDrop(
                          $event,
                          specificCompetency,
                          'specificCompetency',
                          specificIndex,
                          { domain, field, competency }
                        )
                      "
                    >
                      <div class="node-content">
                        <span v-if="!specificCompetency.isGhost" class="node-icon">
                          <span class="material-symbols-outlined">fiber_manual_record</span>
                        </span>
                        <span
                          class="node-label specific-competency-label"
                          :class="{ 'ghost-text': specificCompetency.isGhost }"
                        >
                          {{
                            specificCompetency.isGhost ? 'Zone de dépôt' : specificCompetency.name
                          }}
                        </span>
                        <div v-if="!specificCompetency.isGhost" class="node-actions">
                          <button
                            class="action-btn"
                            title="Modifier la sous-compétence"
                            @click.stop="
                              openEditSpecificCompetencyModal(
                                specificCompetency,
                                competency,
                                field,
                                domain
                              )
                            "
                          >
                            <span class="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            class="action-btn delete-action"
                            title="Supprimer la sous-compétence"
                            @click.stop="
                              openDeleteSpecificCompetencyModal(
                                specificCompetency,
                                competency,
                                field,
                                domain
                              )
                            "
                          >
                            <span class="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- Full-screen Dialog pour les compétences -->
    <div v-if="showAddModal || showEditModal" class="fullscreen-dialog">
      <!-- App Bar -->
      <div class="fullscreen-app-bar">
        <div class="app-bar-leading">
          <button class="icon-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="app-bar-headline">
          <h1 class="app-bar-title">{{ getModalTitle() }}</h1>
        </div>
        <div class="app-bar-trailing">
          <button class="text-button app-bar-action" :disabled="!currentCompetency.name.trim() || !currentCompetency.description.trim()" @click="saveCompetency">
            {{ showEditModal ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="fullscreen-content">
        <div class="fullscreen-body">
          <div class="content-section">
            <h2 class="section-headline">Informations générales</h2>
            <p class="section-supporting-text">
              {{ getModalDescription() }}
            </p>

            <div class="form-fields">
              <div class="text-field-outlined">
                <input
                  id="itemName"
                  v-model="currentCompetency.name"
                  type="text"
                  required
                  class="text-field-input-outlined"
                  placeholder=" "
                />
                <label for="itemName" class="text-field-label-outlined">{{ getFieldLabel('name') }} *</label>
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
                <textarea
                  id="itemDescription"
                  v-model="currentCompetency.description"
                  required
                  class="text-field-textarea-outlined"
                  placeholder=" "
                  rows="4"
                ></textarea>
                <label for="itemDescription" class="text-field-label-outlined">{{ getFieldLabel('description') }} *</label>
                <div class="text-field-outline">
                  <div class="text-field-outline-start"></div>
                  <div class="text-field-outline-notch">
                    <div class="text-field-outline-leading"></div>
                    <div class="text-field-outline-trailing"></div>
                  </div>
                  <div class="text-field-outline-end"></div>
                </div>
                <div class="field-helper-text">{{ getFieldPlaceholder('description') }}</div>
              </div>

              <!-- Sélection du type de résultat pour les sous-compétences -->
              <div v-if="currentContext?.type === 'specificCompetency'" class="text-field-outlined">
                <select
                  id="resultType"
                  v-model="currentCompetency.resultTypeConfigId"
                  required
                  class="text-field-select-outlined"
                >
                  <option value="" disabled>Sélectionner un type de résultat</option>
                  <option v-for="type in resultTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
                <label for="resultType" class="text-field-label-outlined">Type de résultat *</label>
                <div class="text-field-outline">
                  <div class="text-field-outline-start"></div>
                  <div class="text-field-outline-notch">
                    <div class="text-field-outline-leading"></div>
                    <div class="text-field-outline-trailing"></div>
                  </div>
                  <div class="text-field-outline-end"></div>
                </div>
                <div class="field-helper-text">Choisissez le type d'évaluation pour cette sous-compétence</div>
              </div>
            </div>
          </div>

          <!-- Affichage du contexte -->
          <div v-if="currentContext && showContextInfo()" class="content-section">
            <h2 class="section-headline">Contexte</h2>
            <p class="section-supporting-text">Cette {{ getContextItemName() }} sera ajoutée dans :</p>

            <div class="context-container">
              <div v-if="currentContext.domain" class="context-item">
                <span class="material-symbols-outlined context-icon">domain</span>
                <div class="context-details">
                  <span class="context-label">Domaine</span>
                  <span class="context-value">{{ currentContext.domain.name }}</span>
                </div>
              </div>
              <div v-if="currentContext.field" class="context-item">
                <span class="material-symbols-outlined context-icon">folder</span>
                <div class="context-details">
                  <span class="context-label">Champ</span>
                  <span class="context-value">{{ currentContext.field.name }}</span>
                </div>
              </div>
              <div v-if="currentContext.competency" class="context-item">
                <span class="material-symbols-outlined context-icon">psychology</span>
                <div class="context-details">
                  <span class="context-label">Compétence parent</span>
                  <span class="context-value">{{ currentContext.competency.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Material 3 Dialog - Delete Confirmation -->
    <div v-if="showDeleteModal" class="dialog-scrim" @click="closeModal">
      <div class="dialog-container alert-dialog" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon alert-icon">
            <span class="material-symbols-outlined">warning</span>
          </span>
          <h2 class="dialog-headline">{{ getDeleteModalTitle() }}</h2>
        </div>

        <div class="dialog-content">
          <p class="dialog-supporting-text">
            {{ getDeleteModalText() }}
          </p>
          <p class="dialog-supporting-text warning-text">
            {{ getDeleteWarningText() }}
          </p>
        </div>

        <div class="dialog-actions">
          <button type="button" class="text-button" @click="closeModal">Annuler</button>
          <button type="button" class="filled-button destructive" @click="confirmDelete">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Full-screen Dialog pour les types de résultats -->
    <div v-if="showResultTypeModal || showEditResultTypeModal" class="fullscreen-dialog">
      <!-- App Bar -->
      <div class="fullscreen-app-bar">
        <div class="app-bar-leading">
          <button class="icon-btn" @click="closeResultTypeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="app-bar-headline">
          <h1 class="app-bar-title">{{ showEditResultTypeModal ? 'Modifier le type' : 'Nouveau type' }}</h1>
        </div>
        <div class="app-bar-trailing">
          <button class="text-button app-bar-action" :disabled="!currentResultType.name.trim()" @click="saveResultType">
            {{ showEditResultTypeModal ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="fullscreen-content">
        <div class="fullscreen-body">
          <div class="content-section">
            <h2 class="section-headline">Informations générales</h2>
            <p class="section-supporting-text">
              {{ showEditResultTypeModal ? 'Modifiez les informations du type de résultat.' : 'Définissez un nouveau type de résultat pour l\'évaluation des compétences.' }}
            </p>

            <div class="form-fields">
              <div class="text-field-outlined">
                <input
                  id="resultTypeName"
                  v-model="currentResultType.name"
                  type="text"
                  required
                  class="text-field-input-outlined"
                  placeholder=" "
                />
                <label for="resultTypeName" class="text-field-label-outlined">Nom du type *</label>
                <div class="text-field-outline">
                  <div class="text-field-outline-start"></div>
                  <div class="text-field-outline-notch">
                    <div class="text-field-outline-leading"></div>
                    <div class="text-field-outline-trailing"></div>
                  </div>
                  <div class="text-field-outline-end"></div>
                </div>
              </div>

              <div class="result-values-section">
                <h3 class="section-subtitle">Valeurs possibles *</h3>
                <div class="values-input-list">
                  <div v-for="(value, index) in currentResultType.config.values" :key="index" class="value-input-row">
                    <div class="text-field-outlined value-label-field">
                      <input
                        :id="`valueLabel-${index}`"
                        v-model="value.label"
                        type="text"
                        required
                        class="text-field-input-outlined"
                        placeholder=" "
                      >
                      <label :for="`valueLabel-${index}`" class="text-field-label-outlined">Libellé</label>
                      <div class="text-field-outline">
                        <div class="text-field-outline-start"></div>
                        <div class="text-field-outline-notch">
                          <div class="text-field-outline-leading"></div>
                          <div class="text-field-outline-trailing"></div>
                        </div>
                        <div class="text-field-outline-end"></div>
                      </div>
                    </div>
                    <div class="text-field-outlined pivot-value-field">
                      <input
                        :id="`pivotValue-${index}`"
                        v-model.number="value.pivot_value"
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        required
                        class="text-field-input-outlined"
                        placeholder=" "
                      >
                      <label :for="`pivotValue-${index}`" class="text-field-label-outlined">Note /10</label>
                      <div class="text-field-outline">
                        <div class="text-field-outline-start"></div>
                        <div class="text-field-outline-notch">
                          <div class="text-field-outline-leading"></div>
                          <div class="text-field-outline-trailing"></div>
                        </div>
                        <div class="text-field-outline-end"></div>
                      </div>
                    </div>
                    <button class="icon-btn remove-value-btn" @click="removeValue(index)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <button class="text-button add-value-btn" @click="addValue">
                    <span class="material-symbols-outlined">add</span>
                    Ajouter une valeur
                  </button>
                </div>
                <div class="field-helper-text">Définissez chaque valeur avec son équivalent sur une échelle de 0 à 10</div>
              </div>
            </div>
          </div>

          <div v-if="currentResultType.config.values.length > 0" class="content-section">
            <h2 class="section-headline">Aperçu</h2>
            <p class="section-supporting-text">Voici comment apparaîtront les valeurs dans l'interface d'évaluation :</p>

            <div class="preview-container">
              <div class="preview-values">
                <span v-for="value in currentResultType.config.values" :key="value.value || value.label" class="preview-chip">
                  {{ value.label || value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de suppression pour les types de résultats -->
    <div v-if="showDeleteResultTypeModal" class="dialog-scrim" @click="closeResultTypeModal">
      <div class="dialog-container alert-dialog" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon alert-icon">
            <span class="material-symbols-outlined">warning</span>
          </span>
          <h2 class="dialog-headline">Supprimer le type de résultat</h2>
        </div>

        <div class="dialog-content">
          <p class="dialog-supporting-text">
            Êtes-vous sûr de vouloir supprimer le type de résultat "{{ resultTypeToDelete?.name }}" ?
          </p>
          <p class="dialog-supporting-text warning-text">
            Cette action supprimera définitivement ce type de résultat. Les sous-compétences utilisant ce type devront être mises à jour.
          </p>
        </div>

        <div class="dialog-actions">
          <button type="button" class="text-button" @click="closeResultTypeModal">Annuler</button>
          <button type="button" class="filled-button destructive" @click="confirmDeleteResultType">
            Supprimer
          </button>
        </div>
      </div>
    </div>

      <!-- Types View -->
      <div v-if="activeView === 'types'" class="page-content">
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Types de résultats disponibles</h2>
          </div>
          <div class="card-content">
            <div class="types-grid">
              <div v-for="type in resultTypes" :key="type.id" class="type-card">
                <div class="type-header">
                  <h3>{{ type.name }}</h3>
                  <div class="type-actions">
                    <button class="icon-btn" @click="editResultType(type)">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="icon-btn" @click="deleteResultType(type)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <div class="type-content">
                  <div class="type-values">
                    <span class="type-label">Valeurs :</span>
                    <div class="values-list">
                      <div v-for="value in type.config.values" :key="value.value" class="value-item">
                        <span class="value-chip">
                          {{ value.label || value }}
                        </span>
                        <span class="pivot-value">
                          {{ value.pivot_value !== undefined ? value.pivot_value : '-' }}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Import/Export View -->
      <div v-if="activeView === 'import'" class="page-content">
        <!-- Import Card -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Importer un référentiel</h2>
          </div>
          <div class="card-content">
            <p class="section-description">Importez un fichier JSON contenant un référentiel de compétences</p>
            <div class="import-zone">
              <input type="file" accept=".json" @change="handleFileImport" />
            </div>
          </div>
        </div>

        <!-- Export Card -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Exporter le référentiel</h2>
          </div>
          <div class="card-content">
            <p class="section-description">Exportez le référentiel actuel au format JSON</p>
            <div class="card-actions">
              <button class="btn-primary" @click="exportFramework">
                <span class="material-symbols-outlined">download</span>
                Exporter en JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Extended FAB flottants -->
    <button
      v-if="activeView === 'tree' && !showAddModal && !showEditModal && !showDeleteModal"
      class="extended-fab"
      @click="openAddDomainModal()"
    >
      <span class="material-symbols-outlined fab-icon">add</span>
      <span class="fab-label">Ajouter un domaine</span>
    </button>

    <button
      v-if="activeView === 'types' && !showResultTypeModal && !showEditResultTypeModal && !showDeleteResultTypeModal"
      class="extended-fab"
      @click="openAddResultTypeModal"
    >
      <span class="material-symbols-outlined fab-icon">add</span>
      <span class="fab-label">Nouveau type</span>
    </button>
  </div>
</template>

/* eslint-disable no-undef */
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCompetencyFrameworkStore } from '../stores/studentsStore'
import type { ResultTypeConfig, ResultTypeConfigValue } from '@/types/evaluation'

// Import lightweight components normally
import TopAppBar from '@/components/TopAppBar.vue'
import type { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'

// Lazy load Supabase service only when needed
let supabaseResultTypesService: SupabaseResultTypesService | null = null
const loadSupabaseService = async () => {
  if (!supabaseResultTypesService) {
    const module = await import('@/services/supabaseResultTypesService')
    supabaseResultTypesService = module.supabaseResultTypesService
  }
  return supabaseResultTypesService
}

// Interfaces pour les éléments du framework de compétences
interface CompetencyItem {
  id: string
  name: string
  description: string
  domain: string
  field: string
}

interface DomainItem {
  id: string
  name: string
  description: string
  fields: FieldItem[]
  isGhost?: boolean
  isDragging?: boolean
}

interface FieldItem {
  id: string
  name: string
  description: string
  competencies: CompetencyItemDetailed[]
  isGhost?: boolean
  isDragging?: boolean
}

interface CompetencyItemDetailed {
  id: string
  name: string
  description: string
  specificCompetencies: SpecificCompetencyItem[]
  isGhost?: boolean
  isDragging?: boolean
}

interface SpecificCompetencyItem {
  id: string
  name: string
  description: string
  resultTypeConfigId?: string
  isGhost?: boolean
  isDragging?: boolean
}

interface DragContext {
  domain?: DomainItem
  field?: FieldItem
  competency?: CompetencyItemDetailed
}

// État réactif local
// const searchTerm = ref('') // Fonction de recherche temporairement désactivée
type ActiveView = 'tree' | 'types' | 'import'

interface TabItem {
  id: ActiveView
  label: string
  value: ActiveView
}

const activeView = ref<ActiveView>('tree')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentCompetency = ref<CompetencyItem & { resultTypeConfigId?: string }>({
  id: '',
  name: '',
  description: '',
  domain: '',
  field: '',
  resultTypeConfigId: undefined
})
const competencyToDelete = ref<DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem | null>(null)
const currentContext = ref<{ type: string; domain?: DomainItem; field?: FieldItem; competency?: CompetencyItemDetailed; specificCompetency?: SpecificCompetencyItem } | null>(null)

// État d'expansion des nœuds de l'arbre
const expandedDomains = ref(new Set<string>())
const expandedFields = ref(new Set<string>())
const expandedCompetencies = ref(new Set<string>())

// États pour le drag & drop
const draggedItem = ref<DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem | null>(null)
const draggedType = ref<string>('')
const draggedIndex = ref<number>(-1)
const draggedContext = ref<DragContext | null>(null)
const isDragging = ref(false)

// État pour les types de résultats
const resultTypes = ref<ResultTypeConfig[]>([])

// Functions for page header

function getPageTitle(): string {
  switch (activeView.value) {
    case 'tree': return 'Gestion des Compétences';
    case 'types': return 'Types de Résultats';
    case 'import': return 'Import / Export';
    default: return 'Gestion des Compétences';
  }
}

function getPageDescription(): string {
  switch (activeView.value) {
    case 'tree': return 'Organisez et structurez le référentiel de compétences';
    case 'types': return 'Gérez les différents types de résultats pour l\'évaluation';
    case 'import': return 'Importez ou exportez votre référentiel de compétences';
    default: return '';
  }
}

// Computed properties for the page
const currentPageTitle = computed(() => getPageTitle())
const currentPageDescription = computed(() => getPageDescription())

const tabItems = computed<TabItem[]>(() => [
  {
    id: 'tree',
    label: 'Référentiels',
    value: 'tree'
  },
  {
    id: 'types',
    label: 'Types de résultats',
    value: 'types'
  },
  {
    id: 'import',
    label: 'Import/Export',
    value: 'import'
  }
])
const ghostElement = ref<DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem | { isGhost: true } | null>(null)
const ghostPosition = ref<number>(-1)
const ghostContext = ref<DragContext | null>(null)

// Utilisation du store global pour le framework de compétences
const competenciesStore = useCompetencyFrameworkStore()

// Debug: surveiller les changements du framework
console.log('🎬 [Vue] Initialisation CompetenciesView')
console.log('📊 [Vue] Framework initial:', {
  domains: competenciesStore.framework.value.domains.length,
  isLoading: competenciesStore.isCompetenciesLoading.value
})

// Hook onMounted - le store se charge automatiquement
onMounted(async () => {
  console.log('🚪 [Vue] Page des compétences montée avec succès!')
  console.log('📊 [Vue] État du store:', {
    domains: competenciesStore.framework.value.domains.length,
    frameworkName: competenciesStore.framework.value.name
  })
  // Charger les types de résultats disponibles
  const service = await loadSupabaseService()
    resultTypes.value = await service.getResultTypes()
})

// Watcher pour détecter les changements du framework
watch(
  () => competenciesStore.framework.value,
  (newFramework, oldFramework) => {
    console.log('🔄 [Vue] Framework modifié:', {
      oldDomains: oldFramework?.domains.length || 0,
      newDomains: newFramework?.domains.length || 0,
      newFrameworkName: newFramework?.name
    })
    console.log('🌳 [Vue] Nouveaux domaines:', newFramework.domains.map(d => ({ id: d.id, name: d.name, fields: d.fields.length })))

    // Debug: vérifier si les données sont bien présentes
    if (newFramework.domains.length > 0) {
      console.log('✅ [Vue] Données reçues dans Vue:', {
        domainsCount: newFramework.domains.length,
        firstDomain: newFramework.domains[0],
        frameworkName: newFramework.name
      })
    } else {
      console.log('⚠️ [Vue] Aucun domaine reçu dans Vue')
    }
  },
  { deep: true, immediate: true }
)

// Framework avec drag & drop visuel
const frameworkWithDragDrop = computed(() => {
  const currentFramework = competenciesStore.framework.value
  console.log('🖼️ [Vue] Computed frameworkWithDragDrop appelé:', {
    isDragging: isDragging.value,
    ghostPosition: ghostPosition.value,
    domains: currentFramework.domains.length,
    frameworkName: currentFramework.name,
    firstDomainName: currentFramework.domains[0]?.name || 'aucun'
  })

  if (!isDragging.value || ghostPosition.value < 0) {
    console.log('↩️ [Vue] Retour du framework standard (pas de drag):', currentFramework.domains.map(d => ({ name: d.name, fields: d.fields.length })))
    console.log('🔍 [Vue] expandedDomains dans computed:', Array.from(expandedDomains.value))
    console.log('🔬 [Vue] Framework complet retourné:', {
      id: currentFramework.id,
      name: currentFramework.name,
      domains: currentFramework.domains.map(d => ({
        id: d.id,
        name: d.name,
        fieldsLength: d.fields.length,
        firstField: d.fields[0]?.name || 'aucun'
      }))
    })
    return currentFramework
  }

  // Créer une copie profonde du framework
  const result = JSON.parse(JSON.stringify(competenciesStore.framework.value))

  // Ajouter seulement l'élément fantôme sans supprimer l'élément dragué
  if (draggedType.value === 'domain') {
    // Marquer le domaine dragué comme étant en cours de drag
    if (result.domains[draggedIndex.value]) {
      result.domains[draggedIndex.value].isDragging = true
    }

    // Ajouter l'élément fantôme si une position est définie
    if (ghostPosition.value >= 0 && ghostPosition.value !== draggedIndex.value) {
      const ghost = {
        id: 'ghost-domain',
        name: '',
        description: '',
        fields: [],
        isGhost: true
      }
      // Ajuster la position si on insère après l'élément dragué
      const insertPos =
        ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
      result.domains.splice(insertPos, 0, ghost)
    }
  } else if (draggedType.value === 'field') {
    // Trouver et modifier le bon domaine
    const domain = result.domains.find((d: DomainItem) => d.id === draggedContext.value?.domain?.id)
    if (domain) {
      // Marquer le champ dragué comme étant en cours de drag
      if (domain.fields[draggedIndex.value]) {
        domain.fields[draggedIndex.value].isDragging = true
      }

      if (
        ghostPosition.value >= 0 &&
        ghostPosition.value !== draggedIndex.value &&
        ghostContext.value?.domain?.id === draggedContext.value?.domain?.id
      ) {
        const ghost = {
          id: 'ghost-field',
          name: '',
          description: '',
          competencies: [],
          isGhost: true
        }
        const insertPos =
          ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
        domain.fields.splice(insertPos, 0, ghost)
      }
    }
  } else if (draggedType.value === 'competency') {
    // Trouver et modifier le bon champ
    const domain = result.domains.find((d: DomainItem) => d.id === draggedContext.value?.domain?.id)
    if (domain) {
      const field = domain.fields.find((f: FieldItem) => f.id === draggedContext.value?.field?.id)
      if (field) {
        // Marquer la compétence draguée comme étant en cours de drag
        if (field.competencies[draggedIndex.value]) {
          field.competencies[draggedIndex.value].isDragging = true
        }

        if (
          ghostPosition.value >= 0 &&
          ghostPosition.value !== draggedIndex.value &&
          ghostContext.value?.field?.id === draggedContext.value?.field?.id
        ) {
          const ghost = {
            id: 'ghost-competency',
            name: '',
            description: '',
            specificCompetencies: [],
            isGhost: true
          }
          const insertPos =
            ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
          field.competencies.splice(insertPos, 0, ghost)
        }
      }
    }
  } else if (draggedType.value === 'specificCompetency') {
    // Trouver et modifier la bonne compétence
    const domain = result.domains.find((d: DomainItem) => d.id === draggedContext.value?.domain?.id)
    if (domain) {
      const field = domain.fields.find((f: FieldItem) => f.id === draggedContext.value?.field?.id)
      if (field && draggedContext.value?.competency?.id) {
        const competency = field.competencies.find(
          (c: CompetencyItemDetailed) => c.id === draggedContext.value?.competency?.id
        )
        if (competency) {
          // Marquer la sous-compétence draguée comme étant en cours de drag
          if (competency.specificCompetencies[draggedIndex.value]) {
            competency.specificCompetencies[draggedIndex.value].isDragging = true
          }

          if (
            ghostPosition.value >= 0 &&
            ghostPosition.value !== draggedIndex.value &&
            ghostContext.value?.competency?.id === draggedContext.value?.competency?.id
          ) {
            const ghost = {
              id: 'ghost-specific',
              name: '',
              description: '',
              isGhost: true
            }
            const insertPos =
              ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
            competency.specificCompetencies.splice(insertPos, 0, ghost)
          }
        }
      }
    }
  }

  return result
})

// Framework filtré par la recherche - temporairement désactivé
/*
const filteredFramework = computed(() => {
  if (!searchTerm.value.trim()) {
    return framework
  }
  
  const search = searchTerm.value.toLowerCase()
  
  // Filtrer les domaines, champs et compétences selon le terme de recherche
  const filteredDomains = framework.domains.map(domain => {
    const filteredFields = domain.fields.map(field => {
      const filteredCompetencies = field.competencies.filter(competency => 
        competency.name.toLowerCase().includes(search) ||
        competency.description.toLowerCase().includes(search) ||
        competency.specificCompetencies.some(spec => 
          spec.name.toLowerCase().includes(search) ||
          spec.description.toLowerCase().includes(search)
        )
      )
      
      if (filteredCompetencies.length > 0) {
        return { ...field, competencies: filteredCompetencies }
      }
      
      // Si le champ ou sa description contient le terme de recherche
      if (field.name.toLowerCase().includes(search) || 
          field.description.toLowerCase().includes(search)) {
        return field
      }
      
      return null
    }).filter(Boolean)
    
    if (filteredFields.length > 0) {
      return { ...domain, fields: filteredFields }
    }
    
    // Si le domaine ou sa description contient le terme de recherche
    if (domain.name.toLowerCase().includes(search) || 
        domain.description.toLowerCase().includes(search)) {
      return domain
    }
    
    return null
  }).filter(Boolean)
  
  return { ...framework, domains: filteredDomains }
})
*/

// Fonctions de gestion de l'arbre
const toggleDomain = (domainId: string) => {
  if (expandedDomains.value.has(domainId)) {
    expandedDomains.value.delete(domainId)
  } else {
    expandedDomains.value.add(domainId)
  }
}

const toggleField = (fieldId: string) => {
  if (expandedFields.value.has(fieldId)) {
    expandedFields.value.delete(fieldId)
  } else {
    expandedFields.value.add(fieldId)
  }
}

const toggleCompetency = (competencyId: string) => {
  if (expandedCompetencies.value.has(competencyId)) {
    expandedCompetencies.value.delete(competencyId)
  } else {
    expandedCompetencies.value.add(competencyId)
  }
}


// Fonctions de drag & drop
 
 
const handleDragStart = (
   
  event: Event,
  item: DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem,
  type: string,
  index: number,
  context?: DragContext
) => {
   
  const dragEvent = event as DragEvent
  if (!dragEvent.dataTransfer) return

  event.stopPropagation()

  draggedItem.value = item
  draggedType.value = type
  draggedIndex.value = index
  draggedContext.value = context || null
  isDragging.value = true

  dragEvent.dataTransfer.effectAllowed = 'move'
  dragEvent.dataTransfer.setData('text/plain', item.id)
}

 
const handleDragEnd = (_event: Event) => {
  isDragging.value = false

  // Réinitialiser les états
  draggedItem.value = null
  draggedType.value = ''
  draggedIndex.value = -1
  draggedContext.value = null
  ghostElement.value = null
  ghostPosition.value = -1
  ghostContext.value = null
}

 
const handleDragOver = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
   
  const dragEvent = event as DragEvent
  if (dragEvent.dataTransfer) {
    dragEvent.dataTransfer.dropEffect = 'move'
  }
}

 
 
const handleDragEnter = (
   
  event: Event,
  targetItem: DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem,
  targetType: string,
  targetIndex: number,
  targetContext?: DragContext
) => {
  event.preventDefault()
  event.stopPropagation()

  // Ne pas traiter les éléments fantômes ou en cours de drag
  if (targetItem.isGhost || targetItem.isDragging) return

  // Vérifier que le type de glissé correspond au type de la cible
  if (draggedType.value !== targetType) return

  // Vérifier que c'est le même contexte parent
  if (
    targetType === 'field' &&
    (!targetContext?.domain ||
      !draggedContext.value?.domain ||
      targetContext.domain.id !== draggedContext.value.domain.id)
  )
    return
  if (
    targetType === 'competency' &&
    (!targetContext?.field ||
      !draggedContext.value?.field ||
      targetContext.field.id !== draggedContext.value.field.id)
  )
    return
  if (
    targetType === 'specificCompetency' &&
    (!targetContext?.competency ||
      !draggedContext.value?.competency ||
      targetContext.competency.id !== draggedContext.value.competency.id)
  )
    return

  // Définir la position du fantôme
  ghostPosition.value = targetIndex
  ghostContext.value = targetContext || null

  // Créer l'élément fantôme basé sur l'élément dragué
  ghostElement.value = {
    ...draggedItem.value,
    isGhost: true
  }
}

 
 
const handleDrop = (
   
  event: Event,
  targetItem: DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem,
  targetType: string,
  targetIndex: number,
  _targetContext?: DragContext
) => {
  event.preventDefault()
  event.stopPropagation()

  // Vérifier que le type de glissé correspond au type de la cible
  if (draggedType.value !== targetType) return

  // Éviter de se déposer sur soi-même
  if (draggedItem.value?.id === targetItem?.id) return

  const fromIndex = draggedIndex.value
  let toIndex = ghostPosition.value >= 0 ? ghostPosition.value : targetIndex

  // Ajuster l'index si on déplace vers le bas dans la même liste
  if (ghostPosition.value > draggedIndex.value) {
    toIndex = ghostPosition.value - 1
  }

  try {
    switch (draggedType.value) {
      case 'domain':
        competenciesStore.reorderDomains(fromIndex, toIndex)
        break
      case 'field':
        if (draggedContext.value?.domain?.id === ghostContext.value?.domain?.id && draggedContext.value?.domain) {
          competenciesStore.reorderFields(draggedContext.value.domain.id, fromIndex, toIndex)
        }
        break
      case 'competency':
        if (draggedContext.value?.field?.id === ghostContext.value?.field?.id && draggedContext.value?.field) {
          competenciesStore.reorderCompetencies(draggedContext.value.field.id, fromIndex, toIndex)
        }
        break
      case 'specificCompetency':
        if (draggedContext.value?.competency?.id === ghostContext.value?.competency?.id && draggedContext.value?.competency) {
          competenciesStore.reorderSpecificCompetencies(draggedContext.value.competency.id, fromIndex, toIndex)
        }
        break
    }
  } catch (error) {
    console.error('Erreur lors de la réorganisation:', error)
  }
}

// Fonctions CRUD - Domaines (interface)
const openAddDomainModal = () => {
  console.log('Ouvrir modal ajouter domaine')
  showAddModal.value = true
  currentContext.value = { type: 'domain' }
}

const openEditDomainModal = (domain: DomainItem) => {
  console.log('Ouvrir modal éditer domaine:', domain)
  currentCompetency.value = {
    id: domain.id,
    name: domain.name,
    description: domain.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = { type: 'domain', domain }
}

const openDeleteDomainModal = (domain: DomainItem) => {
  console.log('Ouvrir modal supprimer domaine:', domain)
  competencyToDelete.value = domain
  showDeleteModal.value = true
}

// Fonctions CRUD - Champs (interface)
const openAddFieldModal = (domain: DomainItem) => {
  console.log('Ouvrir modal ajouter champ au domaine:', domain)
  showAddModal.value = true
  currentContext.value = { type: 'field', domain }
}

const openEditFieldModal = (field: FieldItem, domain: DomainItem) => {
  console.log('Ouvrir modal éditer champ:', field, 'du domaine:', domain)
  currentCompetency.value = {
    id: field.id,
    name: field.name,
    description: field.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = { type: 'field', field, domain }
}

const openDeleteFieldModal = (field: FieldItem, domain: DomainItem) => {
  console.log('Ouvrir modal supprimer champ:', field, 'du domaine:', domain)
  competencyToDelete.value = field
  showDeleteModal.value = true
}

// Fonctions CRUD - Compétences (interface)
const openAddCompetencyModal = (field: FieldItem, domain: DomainItem) => {
  console.log('Ouvrir modal ajouter compétence au champ:', field, 'du domaine:', domain)
  showAddModal.value = true
  currentContext.value = { type: 'competency', field, domain }
}

const openEditCompetencyModal = (competency: CompetencyItemDetailed, field: FieldItem, domain: DomainItem) => {
  console.log(
    'Ouvrir modal éditer compétence:',
    competency,
    'du champ:',
    field,
    'du domaine:',
    domain
  )
  currentCompetency.value = {
    id: competency.id,
    name: competency.name,
    description: competency.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = { type: 'competency', competency, field, domain }
}

const openDeleteCompetencyModal = (competency: CompetencyItemDetailed, field: FieldItem, domain: DomainItem) => {
  console.log(
    'Ouvrir modal supprimer compétence:',
    competency,
    'du champ:',
    field,
    'du domaine:',
    domain
  )
  competencyToDelete.value = competency
  showDeleteModal.value = true
}

// Fonctions CRUD - Sous-compétences (interface)
const openAddSpecificCompetencyModal = (competency: CompetencyItemDetailed, field: FieldItem, domain: DomainItem) => {
  console.log(
    'Ouvrir modal ajouter sous-compétence à:',
    competency,
    'du champ:',
    field,
    'du domaine:',
    domain
  )
  // Réinitialiser avec le type de résultat par défaut (Échelle A-E)
  const defaultResultType = resultTypes.value.find(rt => rt.name === 'Échelle A-E')
  currentCompetency.value = {
    id: '',
    name: '',
    description: '',
    domain: '',
    field: '',
    resultTypeConfigId: defaultResultType?.id || ''
  }
  showAddModal.value = true
  currentContext.value = { type: 'specificCompetency', competency, field, domain }
}

const openEditSpecificCompetencyModal = (
  specificCompetency: SpecificCompetencyItem,
  competency: CompetencyItemDetailed,
  field: FieldItem,
  domain: DomainItem
) => {
  console.log('Ouvrir modal éditer sous-compétence:', specificCompetency)
  currentCompetency.value = {
    id: specificCompetency.id,
    name: specificCompetency.name,
    description: specificCompetency.description,
    domain: '',
    field: '',
    resultTypeConfigId: specificCompetency.resultTypeConfigId || ''
  }
  showEditModal.value = true
  currentContext.value = {
    type: 'specificCompetency',
    specificCompetency,
    competency,
    field,
    domain
  }
}

const openDeleteSpecificCompetencyModal = (
  specificCompetency: SpecificCompetencyItem,
  _competency: CompetencyItemDetailed,
  _field: FieldItem,
  _domain: DomainItem
) => {
  console.log('Ouvrir modal supprimer sous-compétence:', specificCompetency)
  competencyToDelete.value = specificCompetency
  showDeleteModal.value = true
}

// Fonctions de modal
// Fonctions utilitaires pour le modal dynamique
const getModalTitle = () => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type
  const isEdit = showEditModal.value

  const titles: Record<string, string> = {
    domain: isEdit ? 'Modifier le domaine' : 'Ajouter un domaine',
    field: isEdit ? 'Modifier le champ' : 'Ajouter un champ',
    competency: isEdit ? 'Modifier la compétence' : 'Ajouter une compétence',
    specificCompetency: isEdit ? 'Modifier la sous-compétence' : 'Ajouter une sous-compétence'
  }

  return titles[type] || ''
}

const getModalDescription = () => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type
  const isEdit = showEditModal.value

  const descriptions: Record<string, string> = {
    domain: isEdit
      ? 'Modifiez les informations du domaine.'
      : 'Saisissez les informations du nouveau domaine.',
    field: isEdit
      ? 'Modifiez les informations du champ.'
      : 'Saisissez les informations du nouveau champ.',
    competency: isEdit
      ? 'Modifiez les informations de la compétence.'
      : 'Saisissez les informations de la nouvelle compétence.',
    specificCompetency: isEdit
      ? 'Modifiez les informations de la sous-compétence.'
      : 'Saisissez les informations de la nouvelle sous-compétence.'
  }

  return descriptions[type] || ''
}

const getFieldLabel = (field: string) => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type

  const labels: Record<string, Record<string, string>> = {
    domain: { name: 'Nom du domaine', description: 'Description du domaine' },
    field: { name: 'Nom du champ', description: 'Description du champ' },
    competency: { name: 'Nom de la compétence', description: 'Description de la compétence' },
    specificCompetency: {
      name: 'Nom de la sous-compétence',
      description: 'Description de la sous-compétence'
    }
  }

  return labels[type]?.[field] || ''
}

const getFieldPlaceholder = (field: string) => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type

  const placeholders: Record<string, Record<string, string>> = {
    domain: {
      name: 'Ex: Mathématiques',
      description: 'Décrivez le domaine de compétences...'
    },
    field: {
      name: 'Ex: Nombres et calculs',
      description: 'Décrivez le champ de compétences...'
    },
    competency: {
      name: 'Ex: Comprendre un texte',
      description: 'Décrivez la compétence...'
    },
    specificCompetency: {
      name: 'Ex: Identifier les informations principales',
      description: 'Décrivez la sous-compétence en détail...'
    }
  }

  return placeholders[type]?.[field] || ''
}

const showContextInfo = () => {
  if (!currentContext.value) return false
  const type = currentContext.value.type
  // Afficher le contexte pour tous les types sauf domaine
  return type !== 'domain'
}

const getContextItemName = () => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type

  const names: Record<string, string> = {
    field: 'champ',
    competency: 'compétence',
    specificCompetency: 'sous-compétence'
  }

  return names[type] || 'élément'
}

const getDeleteModalTitle = () => {
  if (!competencyToDelete.value) return ''

  // Déterminer le type d'élément à supprimer en fonction de ses propriétés
  if ('fields' in competencyToDelete.value) return 'Supprimer le domaine'
  if ('competencies' in competencyToDelete.value) return 'Supprimer le champ'
  if ('specificCompetencies' in competencyToDelete.value) return 'Supprimer la compétence'
  return 'Supprimer la sous-compétence'
}

const getDeleteModalText = () => {
  if (!competencyToDelete.value) return ''
  const name = competencyToDelete.value.name

  if ('fields' in competencyToDelete.value)
    return `Êtes-vous sûr de vouloir supprimer le domaine "${name}" ?`
  if ('competencies' in competencyToDelete.value)
    return `Êtes-vous sûr de vouloir supprimer le champ "${name}" ?`
  if ('specificCompetencies' in competencyToDelete.value)
    return `Êtes-vous sûr de vouloir supprimer la compétence "${name}" ?`
  return `Êtes-vous sûr de vouloir supprimer la sous-compétence "${name}" ?`
}

const getDeleteWarningText = () => {
  if (!competencyToDelete.value) return ''

  if ('fields' in competencyToDelete.value) {
    return 'Cette action supprimera définitivement ce domaine et tous ses champs, compétences et évaluations associées.'
  }
  if ('competencies' in competencyToDelete.value) {
    return 'Cette action supprimera définitivement ce champ et toutes ses compétences et évaluations associées.'
  }
  if ('specificCompetencies' in competencyToDelete.value) {
    return 'Cette action supprimera définitivement cette compétence et toutes ses sous-compétences et évaluations associées.'
  }
  return 'Cette action supprimera définitivement cette sous-compétence et toutes les évaluations associées.'
}

const saveCompetency = async () => {
  if (!currentContext.value || !currentCompetency.value.name.trim()) {
    console.log('⚠️ [Vue] Sauvegarde annulée - données manquantes')
    return
  }

  const { type } = currentContext.value
  const isEdit = showEditModal.value

  console.log('💾 [Vue] Début sauvegarde:', {
    type,
    isEdit,
    name: currentCompetency.value.name,
    description: currentCompetency.value.description
  })

  try {
    if (type === 'domain') {
      if (isEdit) {
        await competenciesStore.updateDomain(currentContext.value.domain!.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      } else {
        await competenciesStore.addDomain({
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      }
    } else if (type === 'field') {
      if (isEdit) {
        await competenciesStore.updateField(currentContext.value.field!.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      } else {
        await competenciesStore.addField(currentContext.value.domain!.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      }
    } else if (type === 'competency') {
      if (isEdit) {
        await competenciesStore.updateCompetency(currentContext.value.competency!.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      } else {
        await competenciesStore.addCompetency(currentContext.value.field!.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      }
    } else if (type === 'specificCompetency') {
      if (isEdit) {
        const result = await competenciesStore.updateSpecificCompetency(currentContext.value.specificCompetency!.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description,
          resultTypeConfigId: currentCompetency.value.resultTypeConfigId
        })

        if (!result) {
          console.error('❌ [Vue] Échec de la mise à jour de la sous-compétence en base')
          return
        }
      } else {
        await competenciesStore.addSpecificCompetency(currentContext.value.competency!.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description,
          resultTypeConfigId: currentCompetency.value.resultTypeConfigId
        })
      }
    }

    console.log('✅ [Vue] Modification sauvegardée via store:', type, isEdit ? 'modifié' : 'ajouté')
  } catch (error) {
    console.error('💥 [Vue] Erreur lors de la sauvegarde:', error)
  }

  console.log('🔒 [Vue] Fermeture du modal de sauvegarde')
  closeModal()
}

const confirmDelete = async () => {
  if (!competencyToDelete.value) {
    console.log('⚠️ [Vue] Suppression annulée - aucun élément sélectionné')
    return
  }

  const itemToDelete = competencyToDelete.value
  console.log('🗑️ [Vue] Début suppression:', {
    id: itemToDelete.id,
    name: itemToDelete.name,
    type: 'fields' in itemToDelete ? 'domaine' :
          'competencies' in itemToDelete ? 'champ' :
          'specificCompetencies' in itemToDelete ? 'compétence' : 'sous-compétence'
  })

  try {
    // Identifier le type d'élément et le supprimer via le store
    if ('fields' in itemToDelete) {
      // Supprimer un domaine
      console.log('🗂️ [Vue] Suppression domaine via store...')
      await competenciesStore.deleteDomain(itemToDelete.id)
      console.log('✅ [Vue] Domaine supprimé via store:', itemToDelete.name)
    } else if ('competencies' in itemToDelete) {
      // Supprimer un champ
      console.log('📂 [Vue] Suppression champ via store...')
      await competenciesStore.deleteField(itemToDelete.id)
      console.log('✅ [Vue] Champ supprimé via store:', itemToDelete.name)
    } else if ('specificCompetencies' in itemToDelete) {
      // Supprimer une compétence
      console.log('📄 [Vue] Suppression compétence via store...')
      await competenciesStore.deleteCompetency(itemToDelete.id)
      console.log('✅ [Vue] Compétence supprimée via store:', itemToDelete.name)
    } else {
      // Supprimer une sous-compétence
      console.log('📋 [Vue] Suppression sous-compétence via store...')
      await competenciesStore.deleteSpecificCompetency(itemToDelete.id)
      console.log('✅ [Vue] Sous-compétence supprimée via store:', itemToDelete.name)
    }
  } catch (error) {
    console.error('💥 [Vue] Erreur lors de la suppression:', error)
  }

  console.log('🔒 [Vue] Fermeture du modal de suppression')
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  currentCompetency.value = { id: '', name: '', description: '', domain: '', field: '' }
  competencyToDelete.value = null
  currentContext.value = null
}

// État pour les types de résultats
const showResultTypeModal = ref(false)
const showEditResultTypeModal = ref(false)
const showDeleteResultTypeModal = ref(false)
const currentResultType = ref<{
  id?: string
  name: string
  type: string
  config: { values: ResultTypeConfigValue[] }
}>({
  name: '',
  type: 'custom',
  config: { values: [] }
})
const resultTypeToDelete = ref<ResultTypeConfig | null>(null)

// Functions for result types management
function openAddResultTypeModal() {
  console.log('Opening add result type modal')
  currentResultType.value = {
    name: '',
    type: 'custom',
    config: {
      values: [
        { label: '', value: '', pivot_value: 5 }
      ]
    }
  }
  showResultTypeModal.value = true
}

function editResultType(type: ResultTypeConfig) {
  console.log('Editing result type:', type)
  // Ensure values have the new structure
  const values = type.config.values.map(v => {
    if (typeof v === 'string') {
      // Backward compatibility: convert string to object
      return { label: v, value: v, pivot_value: 5 }
    }
    return {
      label: v.label || '',
      value: v.value || '',
      pivot_value: v.pivot_value !== undefined ? v.pivot_value : 5
    }
  })

  // Ensure at least one value exists
  if (values.length === 0) {
    values.push({ label: '', value: '', pivot_value: 5 })
  }

  currentResultType.value = {
    id: type.id,
    name: type.name,
    type: type.type,
    config: { values }
  }
  showEditResultTypeModal.value = true
}

function deleteResultType(type: ResultTypeConfig) {
  console.log('Deleting result type:', type)
  resultTypeToDelete.value = type
  showDeleteResultTypeModal.value = true
}

function addValue() {
  currentResultType.value.config.values.push({
    label: '',
    value: '',
    pivot_value: 5
  })
}

function removeValue(index: number) {
  currentResultType.value.config.values.splice(index, 1)
}

function closeResultTypeModal() {
  showResultTypeModal.value = false
  showEditResultTypeModal.value = false
  showDeleteResultTypeModal.value = false
  currentResultType.value = {
    name: '',
    type: 'custom',
    config: { values: [] }
  }
  resultTypeToDelete.value = null
}

async function saveResultType() {
  if (!currentResultType.value.name.trim()) {
    alert('Le nom du type de résultat est requis')
    return
  }

  // Clean and validate the data structure
  const cleanedValues = currentResultType.value.config.values
    .filter(v => v.label && v.label.trim()) // Only keep values with labels
    .map(v => ({
      label: v.label.trim(),
      value: v.value || v.label.toLowerCase().replace(/\s+/g, '_'),
      pivot_value: Number(v.pivot_value) || 5 // Ensure it's a number
    }))

  if (cleanedValues.length === 0) {
    alert('Au moins une valeur est requise')
    return
  }

  // Create a clean object to send to the API
  const resultTypeData = {
    id: currentResultType.value.id,
    name: currentResultType.value.name.trim(),
    type: currentResultType.value.type as import('@/types/evaluation').ResultType,
    config: { values: cleanedValues }
  }

  console.log('Saving result type data:', resultTypeData)

  try {
    const service = await loadSupabaseService()
    if (showEditResultTypeModal.value && currentResultType.value.id) {
      // Modifier un type existant
      const updated = await service.updateResultType(
        currentResultType.value.id,
        resultTypeData
      )
      if (updated) {
        const index = resultTypes.value.findIndex(t => t.id === updated.id)
        if (index !== -1) {
          resultTypes.value[index] = updated
        }
      }
    } else {
      // Créer un nouveau type
      const created = await service.createResultType(resultTypeData)
      if (created) {
        resultTypes.value.push(created)
      }
    }
    closeResultTypeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du type de résultat:', error)
  }
}

async function confirmDeleteResultType() {
  if (!resultTypeToDelete.value) return

  try {
    const service = await loadSupabaseService()
    const success = await service.deleteResultType(resultTypeToDelete.value.id)
    if (success) {
      resultTypes.value = resultTypes.value.filter(t => t.id !== resultTypeToDelete.value!.id)
    }
    closeResultTypeModal()
  } catch (error) {
    console.error('Erreur lors de la suppression du type de résultat:', error)
  }
}

// Functions for import/export
function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      console.log('Imported data:', data)
      // TODO: Implement import functionality
    } catch (error) {
      console.error('Error importing file:', error)
    }
  }
  reader.readAsText(file)
}

function exportFramework() {
  const framework = competenciesStore.framework.value
  const dataStr = JSON.stringify(framework, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileDefaultName = `competences_${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}
</script>

<style scoped>
/* Réutilisation des styles de la page des élèves avec adaptations */
.competencies-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
  position: relative;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Material 3 Tabs */
.tabs-container {
  position: sticky;
  top: 0;
  background: #ffffff;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  z-index: 10;
}

.tabs-bar {
  display: flex;
  align-items: center;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-bar::-webkit-scrollbar {
  display: none;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  outline: none;
  overflow: hidden;
}

.tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-surface, #1d1b20);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.tab:hover::before {
  opacity: 0.08;
}

.tab:focus::before {
  opacity: 0.12;
}

.tab:active::before {
  opacity: 0.12;
}

.tab.active {
  color: var(--md-sys-color-primary, #6750a4);
}

.tab-label {
  position: relative;
  z-index: 1;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--md-sys-color-primary, #6750a4);
  border-radius: 3px 3px 0 0;
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab.active .tab-indicator {
  transform: scaleX(1);
}

@media (max-width: 768px) {
  .tabs-container {
    padding: 0 16px;
  }

  .tabs-bar {
    padding: 0;
  }

  .tab {
    min-width: 120px;
    padding: 12px 8px;
    font-size: 13px;
  }
}


.page-title {
  flex: 1;
}

.page-title h1 {
  font-family: var(--md-sys-typescale-headline-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-medium-size, 28px);
  font-weight: var(--md-sys-typescale-headline-medium-weight, 400);
  line-height: var(--md-sys-typescale-headline-medium-line-height, 36px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0 0 4px 0;
}

.page-description {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}

.old-page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title .material-symbols-outlined {
  color: #2563eb;
  font-size: 2rem;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background-color: #ffffff;
}

/* Unified Card Styles for all views */
.content-card {
  background: #ffffff;
  margin: 0 0 8px 0; /* 8dp max padding between cards */
  border-radius: 12px; /* 12dp corner radius */
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
}

.card-header {
  padding: 24px 16px 16px 16px; /* 16dp left/right padding */
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.card-content {
  padding: 24px 16px; /* 16dp left/right padding */
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
}

.search-bar {
  position: relative;
  max-width: 400px;
}

.search-bar .material-symbols-outlined {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Design épuré pour l'arborescence des compétences */
.competencies-tree {
  margin-top: 16px;
}

/* Styles généraux des nœuds de l'arbre */
.tree-node {
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  position: relative;
  gap: 12px;
}

.node-content:hover {
  background-color: #f8f9fa;
}

.node-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6b7280;
  font-size: 18px;
}

.node-label {
  flex: 1;
  min-width: 0;
  color: #111827;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.node-content:hover .node-actions {
  opacity: 1;
}

/* Hiérarchie par indentation et typographie */

/* Niveau 1 - Domaines */
.domain-node .node-content {
  padding: 12px 16px;
  background-color: #ffffff;
}

.domain-node .node-content:hover {
  background-color: #f8f9fa;
}

.domain-label {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.025em;
}

.domain-node .node-icon {
  color: #4b5563;
  font-size: 20px;
}

/* Niveau 2 - Champs */
.field-node {
  padding-left: 16px;
}

.field-node .node-content {
  padding: 10px 16px;
}

.field-label {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.field-node .node-icon {
  font-size: 18px;
  color: #6b7280;
}

/* Niveau 3 - Compétences */
.competency-node {
  padding-left: 32px;
}

.competency-node .node-content {
  padding: 8px 16px;
}

.competency-label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  line-height: 1.4;
}

.competency-node .node-icon {
  font-size: 16px;
}

/* Niveau 4 - Sous-compétences */
.specific-competency-node {
  padding-left: 48px;
}

.specific-competency-node .node-content {
  padding: 6px 16px;
  cursor: default;
}

.specific-competency-label {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.5;
}

.specific-competency-node .node-icon {
  font-size: 14px;
  color: #9ca3af;
}

/* Conteneurs pour les enfants */
.tree-children {
  position: relative;
}

/* Espacement vertical entre les groupes */
.domain-node:not(:last-child) {
  margin-bottom: 4px;
}

/* Material 3 Icon Button - Standard (40x40dp) */
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  background: transparent;
  color: #49454f;
  position: relative;
}

.action-btn .material-symbols-outlined {
  font-size: 20px;
}

/* State layers for icon buttons */
.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 50%;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.action-btn:hover::before {
  background: #49454f;
  opacity: 0.08;
}

.action-btn:focus::before {
  background: #49454f;
  opacity: 0.12;
}

.action-btn:active::before {
  background: #49454f;
  opacity: 0.12;
}

.action-btn:focus {
  outline: none;
}

.delete-action:hover {
  color: #ba1a1a;
}

.delete-action:hover::before {
  background: #ba1a1a;
  opacity: 0.08;
}

.delete-action:focus {
  color: #ba1a1a;
}

.delete-action:focus::before {
  background: #ba1a1a;
  opacity: 0.12;
}

/* Material 3 Extended FAB - Same as students page */
.extended-fab {
  position: fixed !important;
  bottom: 104px; /* 64px menu height + 40px margin */
  right: 24px;
  z-index: 1001;
  pointer-events: auto;

  height: 56px;
  min-width: 80px;
  max-width: none;
  padding: 0 16px;

  background: #eaddff;
  color: #21005d;
  border: none;
  border-radius: 16px;

  box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.3),
    0px 4px 8px 3px rgba(0, 0, 0, 0.15);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;

  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

.fab-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.fab-label {
  white-space: nowrap;
  flex-shrink: 0;
}

.extended-fab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #21005d;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
  border-radius: inherit;
}

.extended-fab:hover {
  box-shadow:
    0px 2px 3px 0px rgba(0, 0, 0, 0.3),
    0px 6px 10px 4px rgba(0, 0, 0, 0.15);
}

.extended-fab:hover::before {
  opacity: 0.08;
}

.extended-fab:focus {
  outline: none;
}

.extended-fab:focus::before {
  opacity: 0.12;
}

.extended-fab:active {
  animation: fabPress 0.1s ease;
}

.extended-fab:active::before {
  opacity: 0.12;
}

@keyframes fabPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1);
  }
}

/* Material 3 Dialog Specifications - Same as students page */
.dialog-scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: scrimFadeIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes scrimFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-container {
  background: #ffffff;
  border-radius: 28px;
  box-shadow:
    0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  width: 100%;
  min-width: 280px;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  overflow: hidden;
  animation: dialogSlideIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.alert-dialog {
  max-width: 312px;
}

.dialog-header {
  padding: 24px 24px 16px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.dialog-icon {
  width: 24px;
  height: 24px;
  color: #625b71;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-icon {
  color: #ba1a1a;
}

.dialog-headline {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #1c1b1f;
  margin: 0;
  flex: 1;
}

.dialog-content {
  padding: 0 24px 24px 24px;
}

.dialog-supporting-text {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #49454f;
  margin: 0 0 16px 0;
}

.dialog-supporting-text:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #ba1a1a;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.text-field {
  position: relative;
  display: flex;
  flex-direction: column;
}

.text-field-label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: #49454f;
  margin-bottom: 8px;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input,
.text-field-textarea,
.text-field-select {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #1c1b1f;
  background: transparent;
  border: none;
  outline: none;
  padding: 8px 0 8px 0;
  width: 100%;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
  resize: vertical;
}

.text-field-input::placeholder,
.text-field-textarea::placeholder {
  color: #49454f;
  opacity: 0.6;
}

.text-field-underline {
  height: 1px;
  background: #79747e;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.text-field-underline::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  right: 50%;
  height: 2px;
  background: #6750a4;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input:focus + .text-field-underline::after,
.text-field-textarea:focus + .text-field-underline::after,
.text-field-select:focus + .text-field-underline::after {
  left: 0;
  right: 0;
}

.text-field-input:focus ~ .text-field-label,
.text-field-textarea:focus ~ .text-field-label,
.text-field-select:focus ~ .text-field-label,
.text-field:focus-within .text-field-label {
  color: #6750a4;
}

.text-field-select {
  width: 100%;
  padding: 12px 16px;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #1c1b1f;
  background: #ffffff;
  border: 1px solid #79747e;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-select:focus {
  outline: none;
  border-color: #6750a4;
  box-shadow: 0 0 0 1px #6750a4;
}

.text-field-select:hover {
  border-color: #49454f;
}

/* Styles pour l'affichage du contexte dans le modal */
.context-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  border-left: 3px solid #e5e7eb;
}

.context-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #6b7280;
}

.context-info strong {
  color: #374151;
  font-weight: 500;
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.text-button {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #6750a4;
  background: transparent;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

.text-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #6750a4;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-button:hover::before {
  opacity: 0.08;
}

.text-button:focus::before {
  opacity: 0.12;
}

.text-button:active::before {
  opacity: 0.12;
}

.filled-button {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
  background: #6750a4;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0px 1px 2px 0px rgba(0, 0, 0, 0.3),
    0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.filled-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.filled-button:hover::before {
  opacity: 0.08;
}

.filled-button:focus::before {
  opacity: 0.12;
}

.filled-button:active::before {
  opacity: 0.12;
}

.filled-button.destructive {
  background: #ba1a1a;
  color: #ffffff;
}

.filled-button.destructive::before {
  background: #ffffff;
}

/* Material 3 Extended FAB Specifications */
.extended-fab {
  position: fixed !important;
  bottom: 104px; /* 64px menu height + 40px margin */
  right: 24px;
  z-index: 1001;
  pointer-events: auto;

  /* Extended FAB Dimensions */
  height: 56px;
  min-width: 80px;
  max-width: none;
  padding: 0 16px;

  /* Material 3 Extended FAB Surface */
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  border: none;
  border-radius: 16px;

  /* Elevation Level 3 */
  box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.3),
    0px 4px 8px 3px rgba(0, 0, 0, 0.15);

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  /* Typography - Label Large */
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  letter-spacing: 0.1px;

  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

/* Extended FAB Icon */
.fab-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

/* Extended FAB Label */
.fab-label {
  white-space: nowrap;
  flex-shrink: 0;
}

/* Extended FAB State Layer */
.extended-fab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-primary-container, #21005d);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
  border-radius: inherit;
}

.extended-fab:hover {
  box-shadow:
    0px 2px 3px 0px rgba(0, 0, 0, 0.3),
    0px 6px 10px 4px rgba(0, 0, 0, 0.15);
}

.extended-fab:hover::before {
  opacity: 0.08;
}

.extended-fab:focus {
  outline: none;
}

.extended-fab:focus::before {
  opacity: 0.12;
}

.extended-fab:active {
  transform: scale(0.96);
  transition: transform 0.1s ease;
}

.extended-fab:active::before {
  opacity: 0.12;
}

/* Extended FAB Pressed Animation */
.extended-fab:active {
  animation: fabPress 0.1s ease;
}

@keyframes fabPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1);
  }
}

/* Large Screen with Navigation Rail */
@media (min-width: 1440px) {
  .extended-fab {
    position: fixed !important;
    bottom: 24px; /* Back to original position */
    right: 24px;
    z-index: 1001;
  }
}

/* Responsive */
@media (max-width: 768px) {

  .competencies-page {
    padding: 0;
  }

  .main-content {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .page-title {
    font-size: 1.5rem;
  }

  /* Ajustements pour l'arbre sur mobile */
  .field-node {
    padding-left: 12px;
  }

  .competency-node {
    padding-left: 24px;
  }

  .specific-competency-node {
    padding-left: 36px;
  }

  .domain-node .node-content {
    padding: 10px 12px;
  }

  .field-node .node-content {
    padding: 8px 12px;
  }

  .competency-node .node-content {
    padding: 6px 12px;
  }

  .specific-competency-node .node-content {
    padding: 4px 12px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .action-btn .material-symbols-outlined {
    font-size: 18px;
  }

  .extended-fab {
    position: fixed !important;
    bottom: 96px; /* 64px menu height + 32px margin for mobile */
    right: 16px;
    height: 56px;
    padding: 0 16px;
    z-index: 1001;
  }

  .fab-label {
    font-size: 13px;
  }

  .dialog-scrim {
    padding: 8px;
  }

  .dialog-container {
    min-width: 280px;
    max-width: calc(100vw - 16px);
  }

  .dialog-header {
    padding: 16px 16px 12px 16px;
  }

  .dialog-content {
    padding: 0 16px 16px 16px;
  }

  .dialog-actions {
    padding: 12px 16px 16px 16px;
    flex-direction: column-reverse;
    gap: 8px;
  }

  .text-button,
  .filled-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {

  /* Réductions supplémentaires pour très petits écrans */
  .field-node {
    padding-left: 8px;
  }

  .competency-node {
    padding-left: 16px;
  }

  .specific-competency-node {
    padding-left: 24px;
  }

  .domain-node .node-content {
    padding: 8px 8px;
  }

  .field-node .node-content {
    padding: 6px 8px;
  }

  .competency-node .node-content {
    padding: 4px 8px;
  }

  .specific-competency-node .node-content {
    padding: 3px 8px;
  }

  .extended-fab {
    position: fixed !important;
    bottom: 88px; /* 64px menu height + 24px margin for small mobile */
    right: 12px;
    height: 52px;
    padding: 0 12px;
    min-width: 72px;
    z-index: 1001;
  }

  .fab-icon {
    font-size: 22px;
  }

  .fab-label {
    font-size: 12px;
  }
}

/* Styles pour les éléments fantômes */
.ghost-element {
  background: rgba(37, 99, 235, 0.1) !important;
  border: 2px dashed rgba(37, 99, 235, 0.3) !important;
  border-radius: 4px;
  margin: 2px 0;
}

.ghost-text {
  color: rgba(37, 99, 235, 0.7);
  font-style: italic;
  font-weight: 400;
}

.ghost-element .node-content {
  padding: 8px 16px;
  pointer-events: none;
}

.ghost-element .node-icon {
  opacity: 0.5;
}

/* Styles pour les éléments en cours de drag */
.dragging-element {
  opacity: 0.5;
  background: rgba(0, 0, 0, 0.05) !important;
}

.dragging-element * {
  pointer-events: none;
}

/* Section Titles for Import/Export */
.section-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Roboto', sans-serif;
}

.section-description {
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  line-height: 1.5;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.type-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.type-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.type-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Roboto', sans-serif;
}

.type-actions {
  display: flex;
  gap: 8px;
}

.type-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Roboto', sans-serif;
}

.values-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.value-chip {
  background: #eaddff;
  color: #21005d;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  border: 1px solid rgba(103, 80, 164, 0.12);
}

.value-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pivot-value {
  font-size: 12px;
  color: #49454f;
  font-weight: 500;
  background: #f7f2fa;
  padding: 4px 8px;
  border-radius: 8px;
  min-width: 40px;
  text-align: center;
}

/* Result Values Section */
.result-values-section {
  margin-top: 24px;
}

.section-subtitle {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0 0 16px 0;
}

.values-input-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.value-input-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.value-label-field {
  flex: 1;
}

.pivot-value-field {
  width: 120px;
}

.remove-value-btn {
  margin-top: 8px;
  color: var(--md-sys-color-error, #ba1a1a);
}

.remove-value-btn:hover {
  background-color: var(--md-sys-color-error-container, #ffdad6);
}

.add-value-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--md-sys-color-primary, #6750a4);
}

/* Import/Export Section Spacing */
.import-section,
.export-section {
  margin-bottom: 32px;
}

.export-section {
  margin-bottom: 0;
}

.import-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.import-zone:hover {
  border-color: #9ca3af;
  background-color: #f8f9fa;
}

.import-zone input[type="file"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

/* Common Button Styles */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #6750a4;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  min-height: 40px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.btn-primary:hover::before {
  opacity: 0.08;
}

.btn-primary:focus::before {
  opacity: 0.12;
}

.btn-primary:active::before {
  opacity: 0.12;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  color: #49454f;
  position: relative;
}

.icon-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 50%;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.icon-btn:hover::before {
  background: #49454f;
  opacity: 0.08;
}

.icon-btn:focus::before {
  background: #49454f;
  opacity: 0.12;
}

.icon-btn:active::before {
  background: #49454f;
  opacity: 0.12;
}

.icon-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Styles pour la modale des types de résultats */
.field-helper-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  font-family: 'Roboto', sans-serif;
}

.values-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #6750a4;
}

.values-preview .type-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Roboto', sans-serif;
}

.values-preview .values-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Full-screen Dialog Styles */
.fullscreen-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: fullscreenSlideIn 0.3s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes fullscreenSlideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* App Bar */
.fullscreen-app-bar {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e7e0ec;
  display: flex;
  align-items: center;
  padding: 0 4px;
  flex-shrink: 0;
}

.app-bar-leading {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.app-bar-headline {
  flex: 1;
  margin-left: 8px;
}

.app-bar-title {
  font-family: 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 400;
  line-height: 28px;
  color: #1d1b20;
  margin: 0;
}

.app-bar-trailing {
  display: flex;
  align-items: center;
  margin-left: 16px;
  margin-right: 12px;
}

.app-bar-action {
  margin: 0;
}

.app-bar-action:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

/* Content */
.fullscreen-content {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.fullscreen-body {
  max-width: 840px;
  margin: 0 auto;
  padding: 24px;
}

.content-section {
  margin-bottom: 48px;
}

.content-section:last-child {
  margin-bottom: 24px;
}

.section-headline {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #1d1b20;
  margin: 0 0 8px 0;
}

.section-supporting-text {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #49454f;
  margin: 0 0 24px 0;
}

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

.text-field-input-outlined,
.text-field-textarea-outlined {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #1d1b20;
  background: transparent;
  border: none;
  outline: none;
  padding: 16px;
  min-height: 56px;
  box-sizing: border-box;
  width: 100%;
  resize: none;
}

.text-field-textarea-outlined {
  min-height: 88px;
  resize: vertical;
}

.text-field-select-outlined {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #1d1b20;
  background: transparent;
  border: none;
  outline: none;
  padding: 16px;
  min-height: 56px;
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.text-field-label-outlined {
  position: absolute;
  left: 16px;
  top: 16px;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #49454f;
  background: #ffffff;
  padding: 0 4px;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  transform-origin: left top;
  z-index: 1;
}

.text-field-input-outlined:focus + .text-field-label-outlined,
.text-field-textarea-outlined:focus + .text-field-label-outlined,
.text-field-select-outlined:focus + .text-field-label-outlined,
.text-field-input-outlined:not(:placeholder-shown) + .text-field-label-outlined,
.text-field-textarea-outlined:not(:placeholder-shown) + .text-field-label-outlined,
.text-field-select-outlined:not([value=""]) + .text-field-label-outlined {
  top: 0;
  font-size: 12px;
  line-height: 16px;
  color: #6750a4;
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
}

.text-field-outline-start {
  width: 12px;
  border: 1px solid #79747e;
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.text-field-outline-notch {
  flex: 1;
  display: flex;
  border-top: 1px solid #79747e;
  border-bottom: 1px solid #79747e;
}

.text-field-outline-leading {
  width: 12px;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-trailing {
  flex: 1;
  border-top: 1px solid #79747e;
  border-bottom: 1px solid #79747e;
}

.text-field-outline-end {
  width: 12px;
  border: 1px solid #79747e;
  border-left: none;
  border-radius: 0 4px 4px 0;
}

.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-start,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-end,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-trailing,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-start,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-end,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-trailing,
.text-field-select-outlined:focus ~ .text-field-outline .text-field-outline-start,
.text-field-select-outlined:focus ~ .text-field-outline .text-field-outline-end,
.text-field-select-outlined:focus ~ .text-field-outline .text-field-outline-trailing {
  border-color: #6750a4;
  border-width: 2px;
}

.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-leading,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-leading,
.text-field-select-outlined:focus ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
  border-bottom-color: transparent;
}

.text-field-input-outlined:not(:placeholder-shown) ~ .text-field-outline .text-field-outline-leading,
.text-field-textarea-outlined:not(:placeholder-shown) ~ .text-field-outline .text-field-outline-leading,
.text-field-select-outlined:not([value=""]) ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
  border-bottom-color: transparent;
}

/* Preview */
.preview-container {
  background: #ffffff;
  border: 1px solid #e7e0ec;
  border-radius: 12px;
  padding: 24px;
}

.preview-values {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-chip {
  background: #e8def8;
  color: #1d1b20;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  border: 1px solid #cac4d0;
}

/* Context Section */
.context-container {
  background: #f8f9fa;
  border: 1px solid #e7e0ec;
  border-radius: 12px;
  padding: 20px;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e7e0ec;
}

.context-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.context-item:first-child {
  padding-top: 0;
}

.context-icon {
  color: #6750a4;
  font-size: 24px;
  flex-shrink: 0;
}

.context-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.context-label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.context-value {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #1d1b20;
  line-height: 24px;
}

/* Responsive */
@media (max-width: 840px) {
  .fullscreen-body {
    padding: 16px;
  }

  .content-section {
    margin-bottom: 32px;
  }

  .app-bar-title {
    font-size: 20px;
  }

  .context-item {
    gap: 12px;
  }

  .context-icon {
    font-size: 20px;
  }
}
</style>
