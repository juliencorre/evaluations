# Fonctionnalités couvertes par les tests unitaires

## Gestion des évaluations
- Chargement des évaluations depuis Supabase et sélection de l'évaluation active (`tests/unit/evaluationStore.spec.ts`)
- Création d'une évaluation et mise à jour de l'état courant (`tests/unit/evaluationStore.spec.ts`)
- Modification et suppression d'une évaluation en synchronisation avec le store (`tests/unit/evaluationStore.spec.ts`)

## Gestion des élèves
- Ajout d'un élève via le service Supabase et mise à jour du catalogue (`tests/unit/studentsStore.spec.ts`)
- Modification d'un élève avec recalcul du nom affiché (`tests/unit/studentsStore.spec.ts`)
- Suppression d'un élève et maintien de la cohérence du store (`tests/unit/studentsStore.spec.ts`)

## Gestion du référentiel de compétences
- Création, mise à jour et suppression d'une compétence dans le référentiel (`tests/unit/studentsStore.spec.ts`)

## Export PDF des analyses
- Génération d'un PDF pour un graphique élève individuel avec `html2canvas` et `jsPDF` (`tests/unit/pdfExport.spec.ts`)
- Génération d'un PDF multi-pages pour l'ensemble des graphiques élèves (`tests/unit/pdfExport.spec.ts`)

## Partage des résultats par email
- Génération de PDF structuré des résultats d'évaluation avec `jsPDF` (`tests/unit/shareResultsService.spec.ts`)
- Validation des données de partage (destinataires, contenu du message) (`tests/unit/shareResultsService.spec.ts`)
- Envoi d'emails avec pièces jointes PDF via Supabase Edge Functions (`tests/unit/shareResultsService.spec.ts`)
- Interface utilisateur de partage avec validation d'emails en temps réel (`ShareResultsDialog.vue`)

## Calculs pour les graphiques d'analyse
- Normalisation des résultats d'évaluation (numériques et qualitatifs) (`tests/unit/pivotAnalysisService.spec.ts`)
- Agrégation statistique et regroupement des résultats pour alimenter les graphiques (`tests/unit/pivotAnalysisService.spec.ts`)
- Dénormalisation des valeurs pivot pour retrouver l'échelle d'origine (`tests/unit/pivotAnalysisService.spec.ts`)
