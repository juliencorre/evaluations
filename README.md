# App Name

A minimal yet production-grade Vue 3 Progressive Web Application skeleton with TypeScript support, built with Vite.

## Project Purpose

This repository provides a foundational Vue 3 PWA that is:

- **Installable** as a native-like application
- **Offline-ready** with app-shell caching strategy
- **Production-grade** with quality gates, testing, and CI/CD pipeline
- **Minimal** with only essential features, no UI framework or additional complexity

## Prerequisites

- Node.js >= 18.0.0
- npm (or pnpm/yarn)
- Modern browser with PWA support

## Installation

```bash
# Install dependencies
npm install
```

## Configuration de l'authentification Supabase

1. Créez un fichier `.env.local` à la racine du projet :

   ```bash
   VITE_SUPABASE_URL="https://<votre-projet>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<clef-anonyme>"
   ```

2. Dans le tableau de bord Supabase, activez l'authentification par e-mail et configurez la durée de validité des liens (15 à 60 minutes recommandées).
3. Personnalisez les e-mails d'authentification en important les modèles fournis dans `supabase/templates`. Chaque fichier correspond à un scénario (confirmation, réinitialisation, lien magique) et respecte les bonnes pratiques d'accessibilité.
4. Vérifiez que l'URL de redirection (`Site URL`) pointe vers l'origine de votre application (ex. `https://app.mondomaine.fr`).

> Les sessions sont gérées côté client via Supabase avec persistance sécurisée, rafraîchissement automatique des tokens et flux PKCE.

## Development

```bash
# Run development server (PWA features disabled in dev)
npm run dev

# Run unit tests
npm run test:unit

# Run unit tests once
npm run test:unit:run

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run E2E tests (requires built app)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check

# Run Lighthouse CI checks
npm run lighthouse

# Test entire CI/CD pipeline locally (before commit)
npm run test:ci

# Quick CI test (skip E2E and Lighthouse for faster feedback)
npm run test:ci:fast
```

## PWA Features

- **Web App Manifest** with complete configuration
- **Service Worker** with auto-update strategy (production only)
- **App-shell caching** for offline functionality
- **Installable** on desktop and mobile devices
- **iOS compatibility** with touch icons and web app configuration

## Quality Thresholds

The application enforces these Lighthouse scores:

- PWA: ≥ 90
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

## Project Structure

```
app-name/
├── .github/workflows/   # CI/CD pipeline
├── e2e/                 # End-to-end tests
├── public/              # Static assets and PWA icons
├── src/
│   ├── components/      # Vue components
│   ├── views/          # Route views
│   ├── App.vue         # Root component
│   ├── main.ts         # Application entry
│   ├── registerSW.ts   # Service Worker registration
│   └── style.css       # Global styles
├── vite.config.ts      # Vite configuration
├── vitest.config.ts    # Vitest configuration
├── playwright.config.ts # Playwright configuration
└── lighthouserc.js    # Lighthouse CI configuration
```

## Local CI/CD Testing

Before committing your changes, you can test the entire CI/CD pipeline locally to catch issues early:

### Full Pipeline Test

```bash
npm run test:ci
```

This runs all CI/CD steps in sequence:

1. ✅ Check prerequisites
2. 📦 Install dependencies (`npm ci`)
3. 🔍 Run ESLint
4. 🔷 Run TypeScript type check
5. 🧪 Run unit tests
6. 🏗️ Build production bundle
7. 🎭 Run E2E tests with Playwright
8. 💡 Run Lighthouse CI with quality thresholds

### Quick Test (Development)

```bash
npm run test:ci:fast
```

Skips E2E and Lighthouse tests for faster feedback during development.

### Advanced Options

You can skip specific steps during development:

```bash
# Skip TypeScript type checking (not recommended)
npm run test:ci -- --skip-typecheck

# Skip E2E tests (faster during development)
npm run test:ci -- --skip-e2e

# Skip Lighthouse CI (faster during development)
npm run test:ci -- --skip-lighthouse

# Combine multiple skip options
npm run test:ci -- --skip-e2e --skip-lighthouse
```

### Benefits

- **Early Detection**: Catch CI failures before pushing
- **Save Time**: Avoid failed CI builds on GitHub
- **Confidence**: Know your changes will pass before committing
- **Offline Testing**: Test without internet connection

### Exit Codes

- `0`: All tests passed ✅
- `1`: One or more tests failed ❌

The script provides detailed error messages and a summary report to help you fix issues quickly.

### Optional: Pre-commit Hook

Automatically run CI tests before each commit:

```bash
# Enable pre-commit hook
cp scripts/pre-commit-hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Skip pre-commit hook if needed
git commit --no-verify -m "message"
```

## Troubleshooting

### Service Worker Not Updating

- Service workers are only registered in production builds
- Clear browser cache and reload if updates aren't appearing
- Check DevTools > Application > Service Workers for registration status

### PWA Not Installing

- Ensure HTTPS is used in production (localhost works for testing)
- Check manifest validity in DevTools > Application > Manifest
- Verify all required icons are present and accessible

### Offline Mode Not Working

- Service worker only works in production/preview builds
- First visit must be online to cache resources
- Check DevTools > Application > Cache Storage for cached resources

### Build Failures

- Ensure Node.js version meets requirements (>=18.0.0)
- Delete node_modules and lockfile, then reinstall
- Check TypeScript errors with `npx vue-tsc --noEmit`

## Deployment

The production build in `dist/` contains static assets deployable to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static file server

Ensure your hosting provides:

- HTTPS support (required for PWA)
- Proper MIME types for manifest and service worker files
- Cache headers configuration for optimal performance

## License

MIT
