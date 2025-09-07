# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Evaluations - Plateforme d'Évaluation Sécurisée**: A Nuxt 3 application with Supabase authentication, built with TypeScript, Vue 3, and TailwindCSS. The platform emphasizes security, GDPR compliance, and modern UX patterns.

## Essential Commands

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests with Vitest
npm run test:coverage    # Run tests with coverage report (80% threshold required)

# Linting
# Note: No explicit lint command configured. Use TypeScript for type checking via IDE or:
npx nuxt typecheck       # Type check the project
```

## Architecture & Key Patterns

### Authentication Flow
The app uses Supabase for authentication with a custom composable pattern:
- **`composables/useAuth.ts`**: Manages authentication state, provides login/logout/register methods
- **`composables/useSupabase.ts`**: Configures and exports Supabase client
- **`app/plugins/auth.client.ts`**: Initializes auth state on client mount
- **`app/middleware/auth.ts`**: Route protection middleware

### Component Architecture
- **Pages** (`app/pages/`): File-based routing with `.vue` files
- **Components** (`app/components/`): Reusable Vue components using Composition API
- **Layouts** (`app/layouts/`): Application layouts, default includes navigation
- Form validation uses `vee-validate` with Yup schemas for type-safe validation

### Database & Security
- Supabase with Row Level Security (RLS) policies
- Environment variables required: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Database schema includes `profiles` table with GDPR-compliant user data

### Testing Strategy
- Unit tests in `test/` directory using Vitest
- Component testing with `@vue/test-utils`
- Coverage thresholds: 80% for branches, functions, lines, and statements
- Test files should follow `*.test.ts` or `*.spec.ts` naming convention

## Important Implementation Notes

### When Adding New Features:
1. Follow Vue 3 Composition API patterns - use `<script setup>` syntax
2. Place reusable logic in composables (`composables/` directory)
3. Use TypeScript for all new code
4. Implement form validation with vee-validate and Yup schemas
5. Ensure GDPR compliance for any user data handling

### When Working with Authentication:
- Always use the `useAuth()` composable for auth operations
- Protected routes should use the `auth` middleware
- Session management is handled automatically by Supabase

### UI Development:
- Use TailwindCSS utility classes for styling
- Components should use Headless UI for complex interactions
- Icons from @heroicons/vue library
- Follow existing color scheme and design patterns

### Environment Configuration:
- Copy `.env.example` to `.env` and configure Supabase credentials
- Never commit `.env` files
- Use runtime config in `nuxt.config.ts` for environment variables

## Code Style Conventions

- TypeScript with strict type checking
- Vue SFC with `<script setup lang="ts">` syntax
- Async/await over promises
- Composables return reactive refs and methods
- Use `definePageMeta()` for page-specific configuration
- Error handling with try/catch blocks and user feedback