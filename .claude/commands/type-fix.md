# /type-fix

Corrige uniquement les erreurs TypeScript détectées dans le projet.

## Usage

```
/type-fix
```

## Fonctionnement

Cette commande lance un agent qui :

1. 🔍 Exécute `npx vue-tsc --noEmit` pour détecter les erreurs TypeScript
2. 🛠️ Analyse chaque erreur et applique les corrections appropriées
3. 📝 Ajoute les types manquants et corrige les problèmes de null safety
4. ✅ Vérifie que la compilation TypeScript passe après corrections

## Types d'erreurs corrigées

- Types manquants ou incorrects
- Problèmes de null safety (optional chaining, non-null assertions)
- Imports de types manquants
- Interfaces et types union incorrects
- Erreurs de compatibilité de types

## Implémentation

Utilise l'agent `general-purpose` avec le prompt :

```
Exécuter 'npx vue-tsc --noEmit' pour identifier les erreurs TypeScript, puis les corriger en ajoutant les types appropriés et les corrections de null safety.
Utiliser les meilleures pratiques TypeScript pour assurer une sécurité de type maximale.
Reporter toute erreur qui nécessite une révision architecturale ou des changements de logique métier.
```