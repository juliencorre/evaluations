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
