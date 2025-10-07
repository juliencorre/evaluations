# Corrections des erreurs MIME type

## Problème identifié

L'application affichait des erreurs dans la console :
```
The script has an unsupported MIME type ('text/html')
```

Ces erreurs surviennent quand le navigateur reçoit du HTML au lieu de JavaScript pour les scripts, généralement dû à :
1. Scripts inline sans type déclaré
2. Problèmes de routing SPA qui renvoient `index.html` pour les assets
3. Configuration serveur incorrecte

## Solutions appliquées

### 1. Correction du script Material Symbols dans index.html

**Avant :**
```html
<script>
  // Load Material Symbols font asynchronously
  ...
</script>
```

**Après :**
```html
<script type="module">
  // Load Material Symbols font asynchronously
  ...
</script>
```

### 2. Configuration Vite pour les en-têtes MIME

Ajout dans `vite.config.ts` :
```typescript
server: {
  port: 5173,
  strictPort: false,
  headers: {
    'Content-Type': 'application/javascript; charset=utf-8'
  },
  hmr: {
    overlay: true
  }
}
```

### 3. Configuration Netlify (_headers)

Création de `public/_headers` pour la production :
```
/assets/js/*
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/assets/css/*
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Content-Type: application/javascript; charset=utf-8

/customServiceWorker.js
  Content-Type: application/javascript; charset=utf-8
  Service-Worker-Allowed: /
```

### 4. Configuration SPA Routing (_redirects)

Création de `public/_redirects` pour éviter que les assets reçoivent index.html :
```
# Prevent redirect for assets
/assets/*  200
/*.js  200
/*.css  200
/*.json  200
/customServiceWorker.js  200

# SPA redirect - serve index.html for all other routes
/*    /index.html   200
```

## Vérification

### Build
```bash
npm run build
```
✅ Build réussi sans erreurs

### Développement local
```bash
npm run dev
```
Vérifier dans la console du navigateur qu'il n'y a plus d'erreurs MIME type.

### Production (Netlify)

1. Les fichiers `_headers` et `_redirects` sont automatiquement copiés dans `dist/`
2. Netlify applique les configurations au déploiement
3. Vérifier l'onglet Network du DevTools pour confirmer les MIME types corrects :
   - JS files: `application/javascript`
   - CSS files: `text/css`

## Scripts NPM

```bash
# Build avec les corrections
npm run build

# Preview build local
npm run preview

# Test coverage
npm run test:coverage
```

## Lighthouse & Performance

Après ces corrections, Lighthouse ne devrait plus afficher d'erreurs MIME type dans la section "Errors logged to console".

Les améliorations incluent :
- ✅ Scripts avec MIME types corrects
- ✅ Caching optimisé pour les assets (1 an)
- ✅ Service Worker avec en-têtes appropriés
- ✅ SPA routing sans conflits avec les assets

## Débogage

Si des erreurs MIME persistent :

1. **Vérifier les en-têtes réseau** :
   - F12 → Network → Cliquer sur un fichier JS
   - Vérifier `Content-Type` dans Response Headers

2. **Vérifier le Service Worker** :
   - F12 → Application → Service Workers
   - S'assurer qu'il n'y a pas de SW qui cache d'anciens assets

3. **Hard Refresh** :
   - Ctrl + F5 (Windows)
   - Cmd + Shift + R (Mac)

4. **Clear Site Data** :
   - F12 → Application → Clear storage → Clear site data
