# Claude Code Commands

## Custom Commands

### /ci-fix
**Description:** Lance un agent autonome qui execute le script CI complet et corrige automatiquement toutes les erreurs detectees.

**Usage:**
```
/ci-fix
```

**Fonctionnement:**
1. Execute `npm run test:ci` pour detecter les erreurs
2. Analyse les erreurs ESLint, TypeScript, tests unitaires et build
3. Corrige automatiquement les erreurs detectables
4. Relance le CI jusqu'a ce que tous les tests passent
5. Affiche un rapport de toutes les corrections effectuees

**Options:**
- `/ci-fix --skip-e2e` : Ignore les tests E2E pour plus de rapidite
- `/ci-fix --skip-lighthouse` : Ignore les tests Lighthouse
- `/ci-fix --max-attempts=3` : Limite le nombre de tentatives de correction

**Types d'erreurs corrigees automatiquement:**
- Erreurs ESLint (formatting, unused imports, etc.)
- Erreurs TypeScript (types manquants, null safety)
- Erreurs de build (imports manquants, syntaxe)
- Tests unitaires echouants (mocks, assertions)
- Tests E2E echouants (selectors, timeouts, assertions)

### /ci-check
**Description:** Execute uniquement le script CI sans corrections automatiques.

**Usage:**
```
/ci-check
```

### /lint-fix
**Description:** Corrige uniquement les erreurs de linting ESLint.

**Usage:**
```
/lint-fix
```

### /type-fix
**Description:** Corrige uniquement les erreurs TypeScript.

**Usage:**
```
/type-fix
```

## Implementation avec Agents Claude Code

### Commande /ci-fix

Quand l'utilisateur tape `/ci-fix`, Claude Code doit executer l'agent general-purpose avec ce prompt:

```
Tu es un agent autonome specialise dans la correction automatique des erreurs CI/CD.

MISSION: Executer le script CI et corriger automatiquement toutes les erreurs detectables.

ETAPES A SUIVRE:
1. Executer 'npm run test:ci --skip-lighthouse' pour identifier les erreurs (inclut les tests E2E)
2. Analyser la sortie pour detecter les types d'erreurs (ESLint, TypeScript, Build, Tests unitaires, Tests E2E)
3. Appliquer les corrections automatiques appropriees:
   - ESLint: Utiliser 'npm run lint' pour auto-fix
   - TypeScript: Ajouter types manquants, corrections de null safety
   - Build: Corriger imports, syntaxe
   - Tests unitaires: Ajuster mocks et assertions
   - Tests E2E: Corriger selectors, timeouts, assertions
4. Relancer le CI jusqu'a ce que tous les tests passent (max 3 tentatives)
5. Fournir un rapport detaille des corrections effectuees

REGLES:
- Toujours commencer par executer le CI pour identifier les erreurs
- Ne pas modifier la logique metier, seulement corriger les erreurs de qualite
- Utiliser les outils de correction automatique quand disponibles
- Si une erreur ne peut pas etre corrigee automatiquement, donner des instructions precises
- Arreter apres 3 tentatives ou si aucune correction automatique n'est possible

RETOUR ATTENDU:
- Statut final du CI (succes/echec)
- Liste des corrections appliquees
- Instructions pour les erreurs restantes
- Prochaines etapes recommandees
```

### Scripts npm disponibles

- `npm run ci-fix` : Lance l'agent de correction automatique
- `npm run ci-check` : Verifie le statut CI sans corrections
- `npm run lint-fix` : Correction ESLint uniquement
- `npm run type-fix` : Verification TypeScript uniquement

## Installation des Commandes Claude Code

### Structure des fichiers créés

```
.claude/
├── commands/
│   ├── ci-fix.md           # Commande /ci-fix
│   ├── ci-check.md         # Commande /ci-check
│   ├── lint-fix.md         # Commande /lint-fix
│   ├── type-fix.md         # Commande /type-fix
│   └── ci-fix.js           # Handler JavaScript (optionnel)
├── commands.json           # Configuration des commandes slash
├── mcp-config.json         # Configuration MCP (optionnel)
└── settings.local.json     # Permissions locales
```

### Activation des commandes

1. **Redémarrer Claude Code** pour charger les nouvelles commandes
2. **Vérifier les permissions** dans `.claude/settings.local.json`
3. **Tester la commande** : `/ci-fix`

Si les commandes ne sont pas reconnues, utiliser :
```bash
# Méthode alternative via npm
npm run ci-fix

# Ou via l'agent Task directement
```

### Commandes disponibles

- `/ci-fix` : Agent autonome complet avec options
- `/ci-check` : Vérification CI seulement
- `/lint-fix` : Correction ESLint seulement
- `/type-fix` : Correction TypeScript seulement

## Configuration

Le script CI est configure pour detecter et corriger automatiquement les erreurs communes dans les projets Vue.js/TypeScript.

Les commandes utilisent le systeme d'agents autonomes de Claude Code pour une correction intelligente et contextuelle des erreurs.