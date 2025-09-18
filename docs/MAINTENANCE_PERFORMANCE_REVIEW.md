# Analyse maintenance et performance

## 0. Structure du projet et des composants

### Observations clés
- L'initialisation (`src/main.ts`) crée l'application Vue, y rattache le router puis déclenche des optimisations différées (préchargement des routes critiques, enregistrement du service worker) via `requestIdleCallback`.【F:src/main.ts†L1-L38】
- La racine `App.vue` se limite à héberger le `RouterView` et deux composants transverses (`AppHeader`, `PwaInstallPrompt`), ce qui place la navigation et les actions globales hors des vues métier.【F:src/App.vue†L1-L31】
- Le router définit quatre vues principales (Accueil, Élèves, Compétences, Analyse) chargées paresseusement, avec des métadonnées pour le titre/description de page.【F:src/router/index.ts†L3-L69】
- Chaque vue combine interface et logique métier : `HomeView` pilote le tableau, le formulaire de création et les modales, `StudentsView` gère le CRUD et le dialogue plein écran, tandis que `CompetenciesView` orchestre un arbre hiérarchique drag-and-drop et de multiples modales dans un même fichier volumineux.【F:src/views/HomeView.vue†L7-L289】【F:src/views/StudentsView.vue†L1-L200】【F:src/views/CompetenciesView.vue†L1-L186】【F:src/views/CompetenciesView.vue†L1325-L1379】
- Les composants partagés (`src/components`) encapsulent la navigation (`AppHeader`), le tableau d'évaluation ou les dialogues mais portent aussi des responsabilités transverses : `AppHeader` surveille l'état d'ouverture du rail via un `watch`, `EvaluationTable` installe un listener global et reconstruit l'arbre de compétences avant d'initialiser le store des résultats.【F:src/components/AppHeader.vue†L1-L122】【F:src/components/EvaluationTable.vue†L241-L333】
- Les stores sont des singletons Composition API déclarés au niveau module : `studentsStore.ts` expose à la fois le store des élèves et celui du référentiel, tous deux initialisant leurs données dès l'import (appel Supabase ou fallback local).【F:src/stores/studentsStore.ts†L1-L101】【F:src/stores/studentsStore.ts†L216-L324】
- Les composants continuent d'interroger directement les services Supabase/local (ex. chargement des types de résultats depuis `EvaluationTable`), ce qui couple la couche UI à la persistance.【F:src/components/EvaluationTable.vue†L265-L278】

### Impacts sur la maintenabilité et les performances
- Des vues monolithiques (plusieurs centaines de lignes) cumulent UI, validation, gestion des watchers et traces de debug, rendant difficile la factorisation des comportements et la couverture par des tests ciblés.【F:src/views/HomeView.vue†L301-L339】【F:src/views/CompetenciesView.vue†L1325-L1379】
- Les stores auto-initialisés compliquent les scénarios de tests/SSR et empêchent de contrôler finement les chargements (réessais, mode hors ligne) car l'appel réseau est déclenché dès l'import de module.【F:src/stores/studentsStore.ts†L12-L74】【F:src/stores/studentsStore.ts†L252-L324】
- Certains composants gèrent eux-mêmes des effets globaux (écouteurs `document`, hydratation du store) alors qu'ils sont rendus fréquemment, ce qui introduit un risque de fuite et de recalcul coûteux lors de chaque montage.【F:src/components/EvaluationTable.vue†L245-L286】

### Recommandations structurantes
- Séparer `studentsStore.ts` en deux modules dédiés (élèves / référentiel) avec des méthodes `initialize` explicites appelées depuis un hook d'entrée (layout, guard) pour supprimer les effets de bord d'import et centraliser la gestion Supabase/local.【F:src/stores/studentsStore.ts†L1-L101】【F:src/stores/studentsStore.ts†L216-L324】
- Scinder les vues en sous-composants spécialisés (ex. `HomeEvaluationForm`, `EvaluationSwitcher`, `CompetencyTree`), déplacer la logique de validation/drag-and-drop dans des composables testables et désactiver les watchers de debug en production.【F:src/views/HomeView.vue†L7-L339】【F:src/views/CompetenciesView.vue†L1-L186】
- Déléguer au store des résultats la récupération des types d'évaluation et l'écoute des clics hors cellule afin que `EvaluationTable` se concentre sur le rendu et évite d'attacher des écouteurs globaux à chaque montage.【F:src/components/EvaluationTable.vue†L245-L333】

## 1. Encadrement des journaux de debug et des watchers
### Constats
- Les vues et stores publient de nombreux `console.log`/`console.warn` sur chaque interaction (validation de formulaire, changements de champs, sauvegardes, etc.), ce qui ajoute un bruit important et peut dégrader les performances en production.
  - HomeView trace chaque frappe et la validité du formulaire via plusieurs watchers profonds sur le référentiel de compétences et l'état de chargement.【F:src/views/HomeView.vue†L208-L340】
  - StudentsView journalise toutes les opérations CRUD locales, y compris les transitions d'état des modals.【F:src/views/StudentsView.vue†L236-L307】
  - Le store des résultats d'évaluation logue chaque appel Supabase/localStorage (initialisation, sauvegarde, suppression), et le service local ajoute encore des traces par opération.【F:src/stores/evaluationResultsStore.ts†L45-L193】【F:src/services/evaluationResultsService.ts†L37-L190】
  - Même les écouteurs globaux du tableau d'évaluation écrivent à chaque clic, y compris lorsqu'un clic est ignoré.【F:src/components/EvaluationTable.vue†L245-L261】
### Recommandations
- Centraliser le logging (par exemple via un utilitaire injecté) avec des niveaux (debug/info/error) et le conditionner à `import.meta.env.DEV` ou à une configuration utilisateur.
- Limiter les watchers à ceux nécessaires au métier, supprimer les watchers destinés uniquement au debug, ou les encapsuler derrière des garde-fous pour qu'ils ne s'exécutent qu'en environnement de développement.
- Pour les événements globaux (ex. gestion du clic extérieur), supprimer les logs et vérifier que l'écouteur est correctement retiré pour éviter toute fuite ; si un tracing est encore utile, utiliser un logger débrayable.

## 2. Effets de bord au chargement des stores
### Constats
- `useStudentsStore` déclenche immédiatement un appel Supabase (ou un fallback local) lors de l'import du module ; la même approche est utilisée pour le référentiel de compétences, avec en plus des logs au chargement.【F:src/stores/studentsStore.ts†L12-L36】【F:src/stores/studentsStore.ts†L241-L264】
- Ces effets de bord rendent l'initialisation difficile à maîtriser (tests unitaires, SSR, gestion offline) et empêchent de différer ou de répéter proprement la récupération des données.
### Recommandations
- Exposer des fonctions `init` explicites (par exemple `await studentsStore.initialize()`), appelées depuis le composant racine ou un route guard.
- Permettre de rejouer l'initialisation (ex. recharger après perte de connexion) et de l'encapsuler dans une stratégie de gestion d'erreur centralisée.
- Injecter les dépendances réseau via des composables pour faciliter les tests (mock services, contrôle de l'ordre d'appel).

## 3. Coût de récupération des résultats dans le tableau
### Constats
- Chaque cellule du tableau d'évaluation récupère son résultat via `getStudentResult`, qui interroge d'abord le store (`Array.find`) puis refait la même recherche dans les données props.【F:src/components/EvaluationTable.vue†L352-L358】
- Le store `useEvaluationResultsStore` et l'utilitaire `getCompetencyResult` parcourent également des tableaux linéaires.【F:src/stores/evaluationResultsStore.ts†L187-L193】【F:src/utils/competencyTree.ts†L74-L81】
- Avec plusieurs dizaines d'élèves et de compétences, cela aboutit à un coût quadratique (O(n*m)) et multiplie les allocations intermédiaires.
### Recommandations
- Construire un cache indexé (`Map` ou objet) par `evaluationId -> studentId -> competencyId` dans le store, mis à jour lors des sauvegardes, puis exposer un accès O(1).
- Calculer ce cache de manière réactive (par exemple via un `computed` qui dérive de `currentEvaluation.results`) pour rester aligné sur Vue et éviter les mutations non observées.
- Dans le composant, supprimer le fallback sur `props.evaluation.results` une fois le store fiabilisé, afin d'éviter les doubles parcours.

## 4. Sérialisation répétée dans le service localStorage
### Constats
- `getEvaluationData` et `saveEvaluationData` sérialisent/désérialisent l'intégralité du contenu stocké à chaque lecture/écriture, même pour une mise à jour ciblée.【F:src/services/evaluationResultsService.ts†L268-L287】
- Les opérations de sauvegarde en lot ou par cellule appellent ces fonctions fréquemment ; à mesure que le volume de données augmente, cela devient une source de ralentissements et de consommation mémoire.
### Recommandations
- Mettre en place un cache en mémoire (par exemple `const cache = reactive(new Map())`) synchronisé ponctuellement avec localStorage, ou utiliser une clé par évaluation (`evaluation_results_temp:${evaluationId}`) pour limiter la quantité de données (lecture/écriture d'un seul enregistrement).
- Envisager `structuredClone`/`performance.now` pour mesurer l'impact et ajuster la stratégie (batching, debounce des écritures, worker dédié si nécessaire).

## 5. Gestion du basculement Supabase/localStorage
### Constats
- Le flag `useSupabase` est partagé au niveau module et est basculé définitivement à `false` dès qu'une erreur survient (chargement initial, sauvegarde, mise à jour), sans stratégie de réactivation.【F:src/stores/evaluationResultsStore.ts†L66-L154】【F:src/stores/studentsStore.ts†L22-L168】
- Une fois en mode dégradé, l'application n'essaie plus Supabase, ce qui complique le retour à la normale et disperse la logique de gestion d'erreur dans plusieurs actions.
### Recommandations
- Introduire une politique de retry avec backoff (compteur d'échecs, délais) et une interface pour tenter de réactiver Supabase (via un bouton ou automatiquement après un délai).
- Extraire la gestion des erreurs réseau dans un service partagé (par exemple un composable `useRemotePersistence`) afin d'unifier le comportement entre élèves, résultats et compétences.
- Journaliser uniquement les échecs significatifs et informer l'utilisateur via un état centralisé plutôt que de dupliquer la logique dans chaque action.
