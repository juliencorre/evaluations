# Guide de Validation Pre-Déploiement

## 📋 Vue d'ensemble

Ce projet inclut des outils de validation pre-déploiement qui reproduisent exactement les vérifications du CI/CD GitHub Actions **localement**, avant de commit et push. Cela permet de détecter et corriger les erreurs **avant** qu'elles ne bloquent le pipeline de déploiement.

## 🎯 Pourquoi utiliser ces outils ?

- ✅ **Gagner du temps** : Détecter les erreurs en local plutôt que d'attendre le CI/CD
- ✅ **Éviter les commits cassés** : S'assurer que tout fonctionne avant de push
- ✅ **Feedback immédiat** : Voir les erreurs instantanément avec des corrections suggérées
- ✅ **Mode auto-fix** : Correction automatique des erreurs de linting

## 🚀 Utilisation

### Option 1: Agent Node.js (Recommandé)

L'agent JavaScript offre le plus de fonctionnalités (auto-fix, résumé détaillé, etc.)

```bash
# Validation complète (tous les tests)
node scripts/deploy-validator-agent.js

# Mode rapide (skip E2E et Lighthouse)
node scripts/deploy-validator-agent.js --quick

# Mode auto-fix (corrige automatiquement le linting)
node scripts/deploy-validator-agent.js --fix

# Mode verbose (affiche tous les outputs)
node scripts/deploy-validator-agent.js --verbose

# Combiner les options
node scripts/deploy-validator-agent.js --quick --fix
```

### Option 2: Script Bash (Linux/Mac)

```bash
# Rendre le script exécutable (une seule fois)
chmod +x scripts/pre-deploy-check.sh

# Exécution complète
./scripts/pre-deploy-check.sh

# Skiper E2E et Lighthouse
SKIP_E2E=true SKIP_LIGHTHOUSE=true ./scripts/pre-deploy-check.sh
```

### Option 3: Script PowerShell (Windows)

```powershell
# Exécution complète
.\scripts\pre-deploy-check.ps1

# Skiper E2E et Lighthouse
$env:SKIP_E2E="true"
$env:SKIP_LIGHTHOUSE="true"
.\scripts\pre-deploy-check.ps1
```

## 📊 Vérifications effectuées

Les scripts reproduisent exactement le workflow `.github/workflows/ci.yml`:

1. ✅ **Environnement**
   - Vérification de Node.js version (v20)
   - Vérification du statut git
   - Présence de package.json

2. ✅ **Dépendances**
   - Installation propre avec `npm ci`
   - Vérification de package-lock.json

3. ✅ **Linting**
   - ESLint sur tout le code
   - Auto-fix disponible avec `--fix`

4. ✅ **Tests Unitaires**
   - Vitest sur tous les tests unitaires
   - Doit passer à 100%

5. ✅ **Build de Production**
   - Compilation TypeScript avec `vue-tsc`
   - Build Vite
   - Vérification du dossier `dist/`

6. ⚠️ **Tests E2E** (optionnel)
   - Installation de Playwright
   - Tests end-to-end
   - Peut être skippé en local

7. ⚠️ **Lighthouse CI** (optionnel)
   - Performance audit
   - Peut être skippé en local

## 🔧 Workflow recommandé

### Avant chaque commit

```bash
# 1. Faire vos modifications
code src/...

# 2. Validation rapide (sans E2E/Lighthouse)
node scripts/deploy-validator-agent.js --quick --fix

# 3. Si tout passe, commit
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push
```

### Avant un merge vers main

```bash
# Validation complète avec tous les tests
node scripts/deploy-validator-agent.js
```

### En cas d'erreur

```bash
# 1. Essayer l'auto-fix d'abord
node scripts/deploy-validator-agent.js --fix

# 2. Si des erreurs persistent, les corriger manuellement
# 3. Re-tester
node scripts/deploy-validator-agent.js --quick
```

## 🎨 Interprétation des résultats

### ✅ Succès
```
╔════════════════════════════════════════════════════════════╗
║   ✓ TOUTES LES VÉRIFICATIONS SONT PASSÉES !              ║
║   Vous pouvez commit et push en toute sécurité           ║
╚════════════════════════════════════════════════════════════╝
```
➡️ **Vous pouvez commit et push sans risque**

### ⚠️ Avertissements
```
⚠ Node.js version: v18.0.0 (GitHub Actions utilise v20)
⚠ Échec des tests E2E (optionnel)
```
➡️ **Vous pouvez commit mais surveillez le CI/CD**

### ❌ Erreurs
```
✗ Échec du linting - Corrigez les erreurs avant de commit
✗ Échec du build de production - Corrigez les erreurs TypeScript
```
➡️ **NE PAS commit - Corrigez d'abord les erreurs**

## 🛠️ Résolution de problèmes

### Erreur: "npm ci échoue"
```bash
# Solution: Supprimer node_modules et package-lock
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Linting échoue"
```bash
# Solution: Auto-fix
npm run lint -- --fix
# ou
node scripts/deploy-validator-agent.js --fix
```

### Erreur: "Tests unitaires échouent"
```bash
# Voir les détails
npm run test:unit:run

# Exécuter un test spécifique
npm run test:unit -- tests/unit/monFichier.spec.ts
```

### Erreur: "Build TypeScript échoue"
```bash
# Voir les erreurs TypeScript
npm run build

# Vérifier le type checking seulement
npx vue-tsc --noEmit
```

## 🤖 Intégration avec Git Hooks

Pour automatiser complètement, ajoutez un pre-push hook:

```bash
# Créer .git/hooks/pre-push
#!/bin/bash
node scripts/deploy-validator-agent.js --quick --fix
```

Ou utilisez `husky`:

```bash
# Installation
npm install --save-dev husky

# Configuration
npx husky install
npx husky add .husky/pre-push "node scripts/deploy-validator-agent.js --quick"
```

## 📝 Scripts npm disponibles

Ajoutez ces raccourcis à votre `package.json`:

```json
{
  "scripts": {
    "predeploy": "node scripts/deploy-validator-agent.js",
    "predeploy:quick": "node scripts/deploy-validator-agent.js --quick",
    "predeploy:fix": "node scripts/deploy-validator-agent.js --fix",
    "validate": "node scripts/deploy-validator-agent.js --quick --fix"
  }
}
```

Utilisation:
```bash
npm run predeploy        # Validation complète
npm run predeploy:quick  # Validation rapide
npm run predeploy:fix    # Validation avec auto-fix
npm run validate         # Validation rapide + auto-fix
```

## 🔍 Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `SKIP_E2E` | Skip tests E2E | `false` |
| `SKIP_LIGHTHOUSE` | Skip Lighthouse CI | `false` |
| `NODE_ENV` | Environnement Node | `development` |

Exemple:
```bash
SKIP_E2E=true SKIP_LIGHTHOUSE=true node scripts/deploy-validator-agent.js
```

## 📚 Ressources additionnelles

- [Workflow CI/CD](.github/workflows/ci.yml)
- [Guide de contribution](CONTRIBUTING.md)
- [Standards de code](docs/coding-standards.md)

## 💡 Conseils Pro

1. **Toujours utiliser `--quick` en développement** pour des validations rapides
2. **Utiliser `--fix` pour corriger automatiquement** les erreurs de linting
3. **Faire une validation complète avant un PR** vers main
4. **Ajouter un pre-push hook** pour automatiser complètement
5. **En cas d'échec du CI/CD**, reproduire localement avec le script complet

## 🎓 Apprentissage

Ce système vous aide à:
- Comprendre ce que vérifie le CI/CD
- Apprendre à débugger les erreurs de build
- Maintenir un code de qualité
- Gagner du temps en développement

---

**Astuce finale**: Créez un alias dans votre shell:
```bash
# Dans ~/.bashrc ou ~/.zshrc
alias validate="node scripts/deploy-validator-agent.js --quick --fix"
```

Puis simplement:
```bash
validate
```
