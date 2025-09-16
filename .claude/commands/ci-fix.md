# /ci-fix

Lance un agent autonome qui exécute le script CI complet et corrige automatiquement toutes les erreurs détectées.

## Usage

```
/ci-fix [--skip-e2e] [--skip-lighthouse] [--max-attempts=3]
```

## Options

- `--skip-e2e` : Ignore les tests E2E pour plus de rapidité
- `--skip-lighthouse` : Ignore les tests Lighthouse
- `--max-attempts=N` : Limite le nombre de tentatives de correction (défaut: 3)

## Exemples

```
/ci-fix
/ci-fix --skip-e2e
/ci-fix --skip-lighthouse
/ci-fix --skip-e2e --skip-lighthouse --max-attempts=5
```

## Fonctionnement

Cette commande lance un agent autonome Claude Code qui :

1. 🔄 Exécute `npm run test:ci` pour détecter les erreurs
2. 🔍 Analyse les erreurs ESLint, TypeScript, tests unitaires et build
3. 🛠️ Corrige automatiquement les erreurs détectables
4. ♻️ Relance le CI jusqu'à ce que tous les tests passent
5. ✅ Affiche un rapport de toutes les corrections effectuées

## Types d'erreurs corrigées automatiquement

- ❌ Erreurs ESLint (formatting, unused imports, etc.)
- ❌ Erreurs TypeScript (types manquants, null safety)
- ❌ Erreurs de build (imports manquants, syntaxe)
- ❌ Tests unitaires échouants (mocks, assertions)

## Implémentation

Utilise l'agent `general-purpose` avec le prompt suivant :

```
Tu es un agent autonome spécialisé dans la correction automatique des erreurs CI/CD.

MISSION: Exécuter le script CI et corriger automatiquement toutes les erreurs détectables.

ÉTAPES À SUIVRE:
1. Exécuter 'npm run test:ci --skip-e2e --skip-lighthouse' pour identifier les erreurs
2. Analyser la sortie pour détecter les types d'erreurs (ESLint, TypeScript, Build, Tests)
3. Appliquer les corrections automatiques appropriées:
   - ESLint: Utiliser 'npm run lint' pour auto-fix
   - TypeScript: Ajouter types manquants, corrections de null safety
   - Build: Corriger imports, syntaxe
   - Tests: Ajuster mocks et assertions
4. Relancer le CI jusqu'à ce que tous les tests passent (max 3 tentatives)
5. Fournir un rapport détaillé des corrections effectuées

RÈGLES:
- Toujours commencer par exécuter le CI pour identifier les erreurs
- Ne pas modifier la logique métier, seulement corriger les erreurs de qualité
- Utiliser les outils de correction automatique quand disponibles
- Si une erreur ne peut pas être corrigée automatiquement, donner des instructions précises
- Arrêter après 3 tentatives ou si aucune correction automatique n'est possible

RETOUR ATTENDU:
- Statut final du CI (succès/échec)
- Liste des corrections appliquées
- Instructions pour les erreurs restantes
- Prochaines étapes recommandées
```