# Correction du problème d'affichage HTML brut

## Problème

La page d'accueil affichait du code HTML brut au lieu de rendre l'application Vue, avec le message d'erreur :
```
The script has an unsupported MIME type ('text/html')
```

## Cause Racine

La configuration Vite forçait **tous les fichiers** (HTML, JS, CSS) à utiliser le header `Content-Type: application/javascript`.

Cela causait :
- Le navigateur interprétait `index.html` comme du JavaScript → affichage du code brut
- Les scripts ne s'exécutaient pas correctement
- L'application Vue ne se montait jamais

## Solution

**Suppression des headers globaux** dans `vite.config.ts` :

### ❌ Configuration problématique (AVANT)
```typescript
export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'  // ❌ Force tous les fichiers en JS
    },
    hmr: {
      overlay: true
    }
  },
  // ...
})
```

### ✅ Configuration corrigée (APRÈS)
```typescript
export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true
    }
  },
  // ...
})
```

## Résultat

Vite gère maintenant automatiquement les MIME types corrects :
- **HTML** : `text/html` ✅
- **JavaScript** : `application/javascript; charset=utf-8` ✅
- **CSS** : `text/css; charset=utf-8` ✅

## Vérification

```bash
# 1. Démarrer le serveur dev
npm run dev

# 2. Vérifier dans le navigateur (http://localhost:5173)
# Ouvrir DevTools (F12) → Network tab
# Vérifier les headers de index.html :
# Content-Type: text/html ✅

# 3. Build de production
npm run build  # ✅ Réussi en 6.21s
```

## Configuration Production (Netlify)

Les fichiers suivants garantissent les MIME types corrects en production :

### `public/_headers`
```
/assets/js/*
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/assets/css/*
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
```

### `public/_redirects`
```
# Prevent redirect for assets
/assets/*  200
/*.js  200
/*.css  200

# SPA redirect
/*    /index.html   200
```

## Leçon Apprise

⚠️ **Ne JAMAIS forcer un Content-Type global** dans la configuration du serveur Vite. Cela écrase les types MIME automatiques et casse l'application.

Les headers personnalisés doivent être **spécifiques aux fichiers** qui en ont besoin, pas globaux.
