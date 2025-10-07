# 🔧 Scripts de Migration et Utilitaires

## 📦 Scripts Disponibles

### 1. `migrate-stores.cjs` - Migration Automatique des Stores Pinia

Script de migration automatique pour le refactoring des stores vers le pattern Pinia `defineStore`.

#### Utilisation

```bash
# Test en mode dry-run (aucune modification)
node scripts/migrate-stores.cjs --dry-run

# Application réelle des changements
node scripts/migrate-stores.cjs
```

#### Fonctionnalités

- ✅ Détecte et remplace automatiquement 13+ patterns de code
- ✅ Supporte Vue, TypeScript et JavaScript
- ✅ Mode dry-run pour prévisualiser les changements
- ✅ Statistiques détaillées par pattern
- ✅ Exclut automatiquement les fichiers déjà migrés
- ✅ Traite 145+ fichiers en moins d'une seconde

#### Patterns Traités

| Catégorie | Ancien Pattern | Nouveau Pattern |
|-----------|---------------|-----------------|
| **Students Store** | `studentsStore.allStudents.value` | `studentsStore.allStudents` |
| | `studentsStore.activeStudents.value` | `studentsStore.activeStudents` |
| | `studentsStore.studentCount.value` | `studentsStore.studentCount` |
| | `studentsStore.isLoading.value` | `studentsStore.isLoading` |
| | `studentsStore.error.value` | `studentsStore.error` |
| **Framework Store** | `frameworkStore.framework.value` | `frameworkStore.framework` |
| | `frameworkStore.isCompetenciesLoading` | `frameworkStore.isLoading` |
| | `frameworkStore.competenciesError` | `frameworkStore.error` |
| **Evaluation Store** | `evaluationStore.allEvaluations.value` | `evaluationStore.allEvaluations` |
| | `evaluationStore.currentEvaluation.value` | `evaluationStore.currentEvaluation` |
| | `evaluationStore.isLoading.value` | `evaluationStore.isLoading` |
| **Inline Calls** | `useCompetencyFrameworkStore().framework.value` | `useCompetencyFrameworkStore().framework` |
| **Null Checks** | `currentEvaluation.value?` | `currentEvaluation?` |

#### Fichiers Exclus

Le script **n'applique PAS** de modifications sur:
- `node_modules/`
- `dist/`
- `.git/`
- `src/stores/modules/` (nouveaux stores déjà migrés)
- `src/stores/studentsStore.ts` (fichier de ré-export)
- `src/stores/evaluationStore.ts` (fichier de ré-export)
- `src/stores/index.ts` (exports centralisés)

#### Exemple de Sortie

```
🚀 Migration automatique des stores Pinia

Mode: ✍️  ÉCRITURE (modifications appliquées)

────────────────────────────────────────────────────────────────────────────────

📂 145 fichiers à analyser...

  ✓ 2x studentsStore.allStudents.value → studentsStore.allStudents
  ✓ 10x frameworkStore.framework.value → frameworkStore.framework

📝 src\components\analysis\DashboardView.vue
   12 remplacement(s)

────────────────────────────────────────────────────────────────────────────────

📊 RÉSUMÉ DE LA MIGRATION

Fichiers analysés:  145
Fichiers modifiés:  11
Total remplacements: 63
Durée: 0.08s

📋 DÉTAILS PAR PATTERN:

   17x  frameworkStore.framework.value → frameworkStore.framework
   15x  studentsStore.allStudents.value → studentsStore.allStudents
   13x  evaluationStore.allEvaluations.value → evaluationStore.allEvaluations

✅ Migration terminée avec succès!
💡 Lancez "npm run build" pour vérifier que tout fonctionne
```

#### Ajouter de Nouveaux Patterns

Éditez le tableau `REPLACEMENTS` dans `migrate-stores.cjs`:

```javascript
const REPLACEMENTS = [
  {
    pattern: /oldPattern\.value/g,         // Regex du pattern à chercher
    replacement: 'newPattern',              // Texte de remplacement
    description: 'oldPattern.value → newPattern'  // Description pour logs
  },
  // ... autres patterns
]
```

#### Dépannage

**Erreur**: `Cannot find module`
- **Solution**: Le script doit être exécuté depuis la racine du projet

**Erreur**: `require is not defined`
- **Solution**: Utiliser `.cjs` comme extension (déjà fait)

**Problème**: Patterns non détectés
- **Solution**: Vérifier que la regex est correcte et utilise le flag `/g` (global)

---

## 🔮 Futurs Scripts

### `migrate-components.cjs` (Planifié)
Migration automatique des composants monolithiques vers l'architecture atomique

### `optimize-css.cjs` (Planifié)
Détection et suppression des styles CSS dupliqués

### `generate-composables.cjs` (Planifié)
Extraction automatique de la logique métier en composables

---

## 📚 Documentation

Pour plus de détails sur la migration des stores, consultez:
- [docs/MIGRATION-STORES-PHASE2.md](../docs/MIGRATION-STORES-PHASE2.md)
- [CLAUDE.md](../CLAUDE.md) - Configuration générale du projet

---

**Maintenu par**: Équipe de développement
**Dernière mise à jour**: 2025-01-07
