# /ci-check

Exécute uniquement le script CI sans corrections automatiques pour vérifier le statut.

## Usage

```
/ci-check
```

## Fonctionnement

Cette commande lance un agent qui :

1. 🔍 Exécute `npm run test:ci` complet
2. 📊 Analyse et reporte le statut de toutes les étapes
3. 📝 Détaille les erreurs trouvées sans les corriger
4. 📋 Fournit des recommandations pour les corrections manuelles

## Implémentation

Utilise l'agent `general-purpose` avec le prompt :

```
Exécuter 'npm run test:ci' et reporter le statut complet avec analyse détaillée des erreurs s'il y en a.
Fournir des recommandations spécifiques pour corriger chaque type d'erreur détectée.
```