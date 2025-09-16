# /lint-fix

Corrige uniquement les erreurs de linting ESLint détectées dans le projet.

## Usage

```
/lint-fix
```

## Fonctionnement

Cette commande lance un agent qui :

1. 🔍 Exécute `npm run lint` pour détecter les erreurs ESLint
2. 🛠️ Applique les corrections automatiques disponibles
3. 📝 Reporte les erreurs qui nécessitent une intervention manuelle
4. ✅ Confirme que le linting passe après corrections

## Types d'erreurs corrigées

- Formatage du code (indentation, espaces, etc.)
- Imports inutilisés
- Variables non utilisées
- Règles de style automatiquement corrigeables

## Implémentation

Utilise l'agent `general-purpose` avec le prompt :

```
Exécuter 'npm run lint' pour corriger automatiquement toutes les erreurs de linting ESLint détectées.
Reporter les erreurs qui ne peuvent pas être corrigées automatiquement avec des instructions précises.
```