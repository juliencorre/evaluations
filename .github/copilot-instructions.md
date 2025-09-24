# Evaluations Repository

This is a production-grade Vue 3 Progressive Web Application (PWA) with TypeScript, comprehensive testing, and CI/CD pipeline. It includes competency evaluation tools, student management, and analysis features.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Repository Structure

- **Current state**: Full Vue 3 PWA application with TypeScript, Vite build system, comprehensive test suite
- **Dependencies**: Node.js >=18.0.0, npm packages defined in package.json
- **Build system**: Vite with Vue 3, TypeScript, PWA plugin
- **Testing**: Vitest (unit), Playwright (E2E), Lighthouse CI (performance)
- **Linting**: ESLint 9 with flat config, Prettier for formatting

### Project Architecture

```
evaluations/
├── .github/              # GitHub workflows and copilot instructions
├── .claude/              # Claude Code custom commands
├── src/                  # Vue 3 application source
│   ├── components/       # Vue components (common, competencies, students, analysis)
│   ├── views/           # Route views
│   ├── services/        # Business logic and API services
│   └── types/           # TypeScript type definitions
├── e2e/                 # Playwright end-to-end tests
├── public/              # Static assets and PWA icons
├── scripts/             # CI/CD automation scripts
├── docs/                # Architecture Decision Records
└── dist/                # Production build output (generated)
```

### Required Setup

**CRITICAL**: Always run dependency installation first:

```bash
# Required first step - install dependencies (10-15 seconds)
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

**Note**: Use `PUPPETEER_SKIP_DOWNLOAD=true` to avoid network issues with Puppeteer Chrome download in sandboxed environments.

## Development Commands

### Essential Commands (Fast - under 30 seconds)

```bash
# Check repository status (1 second)
git --no-pager status

# Lint and auto-fix code issues (5-10 seconds)
npm run lint

# Format code with Prettier (2-3 seconds)
npm run format

# Run unit tests (1-2 seconds)
npm run test:unit:run

# Type checking only (3-5 seconds) 
npm run type-fix
```

### Build Commands (Medium - 1-2 minutes)

```bash
# Production build (10-15 seconds) - NEVER CANCEL
npm run build

# Preview production build locally (5 seconds startup)
npm run preview
```

### CI/CD Commands (Long - 2-10 minutes)

**CRITICAL**: These commands take significant time. NEVER CANCEL them.

```bash
# Full CI pipeline - NEVER CANCEL (5-10 minutes in sandboxed environments)
npm run test:ci

# Quick CI without E2E/Lighthouse - NEVER CANCEL (2-3 minutes)
npm run test:ci:fast

# E2E tests only - NEVER CANCEL (3-5 minutes, requires built app)
npm run test:e2e

# Lighthouse performance tests - NEVER CANCEL (2-3 minutes)  
npm run lighthouse
```

### Development Server

```bash
# Start development server (3-5 seconds startup)
npm run dev
# Runs on http://localhost:5173/ by default
# PWA features are disabled in development mode
```

## Build System Understanding

### Technologies Used

- **Vue 3** with TypeScript and Composition API
- **Vite** as build tool and development server
- **Vitest** for unit testing 
- **Playwright** for end-to-end testing
- **ESLint 9** with flat config for linting
- **Prettier** for code formatting
- **PWA Plugin** for service worker and manifest generation
- **Supabase** for backend services

### Build Outputs

After `npm run build`:
- `dist/` directory contains production-ready static files
- Service worker and PWA manifest are automatically generated
- Assets are optimized and have cache-busting hashes

## Validation Procedures

### Pre-Development Validation

Always run these commands in sequence before making changes:

```bash
# 1. Verify repository state (1 second)
git --no-pager status

# 2. Install dependencies if needed (10-15 seconds)
PUPPETEER_SKIP_DOWNLOAD=true npm install

# 3. Check current code quality (5-10 seconds)
npm run lint

# 4. Verify unit tests pass (1-2 seconds)
npm run test:unit:run

# 5. Verify build works (10-15 seconds)
npm run build
```

### Post-Development Validation

After making changes, validate with:

```bash
# 1. Check what changed (1 second)
git --no-pager status && git --no-pager diff

# 2. Lint and fix issues (5-10 seconds)
npm run lint

# 3. Run unit tests (1-2 seconds)
npm run test:unit:run

# 4. Build production version (10-15 seconds)
npm run build

# 5. For major changes, run full CI (5-10 minutes) - NEVER CANCEL
npm run test:ci:fast
```

### Expected States

- **Clean repository**: `git status` shows "working tree clean"
- **Successful lint**: ESLint may show warnings but no errors (exit code 0)
- **Unit tests**: All tests should pass (exit code 0)
- **Build success**: Produces `dist/` directory with optimized assets
- **E2E tests**: Playwright tests should pass against built app (when running full CI)

## Troubleshooting

### Common Issues

#### Installation Problems

```bash
# If npm install fails with network issues:
PUPPETEER_SKIP_DOWNLOAD=true npm install

# If still failing, clear cache:
npm cache clean --force && PUPPETEER_SKIP_DOWNLOAD=true npm install
```

#### Build Failures

```bash
# Check for TypeScript errors:
npm run type-fix

# Check for lint errors:
npm run lint

# For detailed build logs:
npm run build -- --verbose
```

#### Test Failures

```bash
# Run tests with verbose output:
npm run test:unit -- --reporter=verbose

# For E2E test failures, ensure app is built:
npm run build && npm run test:e2e
```

### Performance Notes

- **Development server**: Hot reload works, PWA features disabled
- **Production build**: Full optimization, service worker generation
- **CI pipeline**: Includes type checking, linting, unit tests, E2E tests, Lighthouse
- **Sandboxed environments**: May be slower due to resource constraints

## CI/CD Automation

### Available Scripts

The repository includes comprehensive automation scripts:

#### CI/CD Pipeline Scripts

```bash
# scripts/test-ci.js - Full CI pipeline
npm run test:ci

# Options available:
npm run test:ci -- --skip-e2e          # Skip E2E tests
npm run test:ci -- --skip-lighthouse   # Skip Lighthouse  
npm run test:ci -- --skip-typecheck    # Skip TypeScript (not recommended)
```

#### Auto-Fix Scripts  

```bash
# scripts/ci-auto-fix.js - Automated error correction
npm run ci-fix

# Individual fix commands:
npm run lint-fix      # ESLint auto-fix
npm run type-fix      # TypeScript type check
```

### Claude Code Integration

The repository includes pre-configured Claude Code commands in `.claude/`:

- `/ci-fix` - Autonomous CI error correction agent
- `/ci-check` - CI status verification only  
- `/lint-fix` - ESLint-only corrections
- `/type-fix` - TypeScript-only corrections

These commands use the Task tool with `general-purpose` subagent for intelligent error correction.

## Quality Standards

### Code Quality Gates

The CI pipeline enforces these standards:

- **ESLint**: Must pass (warnings allowed, errors block CI)
- **TypeScript**: Strict type checking required  
- **Unit Tests**: 100% test suite must pass
- **E2E Tests**: Critical user flows must work
- **Lighthouse Scores**:
  - Performance: ≥85%
  - Accessibility: ≥90%  
  - Best Practices: ≥90%
  - SEO: ≥90%
  - PWA: ≥90%

### Current Code Issues

The codebase currently has TypeScript warnings (49 `@typescript-eslint/no-explicit-any` warnings) but these do not block builds. Focus on not introducing new `any` types when making changes.

## Working with Specific Features

### Competency Management

- Components in `src/components/competencies/`
- Services in `src/services/supabaseCompetenciesService.ts`
- Main view: `src/views/CompetenciesView.vue`

### Student Management  

- Components in `src/components/students/`
- Services in `src/services/studentsService.ts`
- Integration with Supabase for data persistence

### Analysis & Reporting

- Components in `src/components/analysis/`
- PDF generation with jsPDF and html2canvas
- Dashboard views and charts

### PWA Features

- Service worker: `src/sw/customServiceWorker.ts`
- Manifest: Auto-generated by Vite PWA plugin
- Offline caching: App-shell pattern implemented
- Installation prompts: Built into the application

## File Paths Reference

Always use absolute paths from repository root:

```bash
# Repository root
/home/runner/work/evaluations/evaluations/

# Key directories
/home/runner/work/evaluations/evaluations/src/           # Application source
/home/runner/work/evaluations/evaluations/dist/         # Build output  
/home/runner/work/evaluations/evaluations/.github/      # GitHub config
/home/runner/work/evaluations/evaluations/scripts/      # CI/CD scripts
```

Remember: This is a production-grade Vue 3 PWA with comprehensive tooling. Always run the validation procedures before making changes, and use the appropriate timeout values for long-running commands.
