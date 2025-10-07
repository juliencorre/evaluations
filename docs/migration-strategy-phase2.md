# Phase 2: Migration Strategy - Stores Refactoring

## Executive Summary

Phase 1 has successfully enriched the repository layer with business logic from Supabase services. Phase 2 focuses on migrating all stores to exclusively use the ServiceContainer pattern, eliminating direct Supabase imports.

## Current State Assessment

### ✅ Completed (Phase 1)
- **SchoolYearRepository**: Enhanced with validation, auto-current logic, and year generation
- **StudentClassRepository**: Complete with enrollment, transfer, and statistics
- **EvaluationResultRepository**: Delegates to service (needs direct implementation)
- All repositories available through `serviceContainer` singleton

### ⚠️ Remaining Work

#### Stores to Migrate
1. **authStore** (src/stores/modules/auth.store.ts)
   - Already refactored but needs ServiceContainer integration for user preferences
   - Auth logic stays as-is (uses Supabase Auth SDK directly)

2. **schoolYearStore** (multiple files)
   - Current: `src/stores/schoolYearStore.ts` + `src/stores/schoolYearFilterStore.ts`
   - Target: Consolidated module using `serviceContainer.schoolYears`

3. **classStore** (src/stores/classStore.ts)
   - Current: Uses `supabaseClassesService` + direct Supabase calls
   - Target: Use `serviceContainer.classes` + `serviceContainer.studentClasses`

4. **evaluationResultsStore** (src/stores/evaluationResultsStore.ts)
   - Current: Uses `supabaseEvaluationResultsService`
   - Target: Use `serviceContainer.evaluationResults`

5. **settingsStore** (src/stores/settingsStore.ts)
   - Current: Direct localStorage + some Supabase calls
   - Target: Maintain localStorage but use repositories for DB operations

## Migration Approach: Incremental & Parallel-Safe

### Strategy: Side-by-Side Transition

Instead of breaking existing stores, we'll create new modules alongside and gradually switch references:

```
src/stores/
├── modules/                    # New modular stores
│   ├── auth.store.ts          # ✅ Done
│   ├── schoolYear.store.ts    # 🔄 To create
│   ├── class.store.ts         # 🔄 To create
│   ├── evaluationResults.store.ts # 🔄 To create
│   └── settings.store.ts      # 🔄 To create
│
├── authStore.ts               # Re-export from modules/
├── schoolYearStore.ts         # Legacy - to deprecate
├── classStore.ts              # Legacy - to deprecate
└── ...
```

### Implementation Pattern

Each new store module follows this structure:

```typescript
// src/stores/modules/schoolYear.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { serviceContainer } from '@/services/ServiceContainer'

export const useSchoolYearStore = defineStore('schoolYear', () => {
  // State
  const years = ref<SchoolYearEntity[]>([])
  const currentYear = ref<SchoolYearEntity | null>(null)
  const isLoading = ref(false)

  // Actions using ServiceContainer
  async function loadYears() {
    isLoading.value = true
    try {
      years.value = await serviceContainer.schoolYears.findAll()
      currentYear.value = await serviceContainer.schoolYears.findCurrent()
    } finally {
      isLoading.value = false
    }
  }

  // Computed
  const currentYearId = computed(() => currentYear.value?.id)

  return {
    years: readonly(years),
    currentYear: readonly(currentYear),
    isLoading: readonly(isLoading),
    currentYearId,
    loadYears
  }
})
```

## Migration Steps (Per Store)

### 1. SchoolYearStore Migration

**Current files:**
- `src/stores/schoolYearStore.ts`
- `src/stores/schoolYearFilterStore.ts`
- `src/stores/modules/schoolYear.store.ts` (partial)

**Migration tasks:**
1. Create `src/stores/modules/schoolYear.store.ts` using `serviceContainer.schoolYears`
2. Merge filter logic from `schoolYearFilterStore.ts`
3. Update `src/stores/index.ts` exports
4. Update all component imports progressively

### 2. ClassStore Migration

**Current files:**
- `src/stores/classStore.ts`
- Uses `supabaseClassesService`

**Migration tasks:**
1. Create `src/stores/modules/class.store.ts`
2. Use `serviceContainer.classes` + `serviceContainer.studentClasses`
3. Preserve teacher management logic
4. Keep enrollment sync through StudentClassRepository

### 3. EvaluationResultsStore Migration

**Current files:**
- `src/stores/evaluationResultsStore.ts`

**Migration tasks:**
1. Create `src/stores/modules/evaluationResults.store.ts`
2. Use `serviceContainer.evaluationResults`
3. Move any RPC logic to repository if needed

### 4. SettingsStore Migration

**Current files:**
- `src/stores/settingsStore.ts`

**Migration tasks:**
1. Create `src/stores/modules/settings.store.ts`
2. Keep localStorage for UI preferences
3. Use repositories for any DB-backed settings

## Success Criteria

- [ ] All stores use `serviceContainer` exclusively
- [ ] No direct `import { supabase }` in store files
- [ ] Legacy store files marked with deprecation warnings
- [ ] All components use new modular stores
- [ ] E2E tests pass for critical flows

## Risks & Mitigation

### Risk 1: Breaking Changes During Migration
**Mitigation:** Side-by-side approach - old stores remain functional

### Risk 2: Missed Supabase Dependencies
**Mitigation:** Grep for `from '@/lib/supabase'` after migration

### Risk 3: Performance Regression
**Mitigation:** Keep reactive patterns, use computed refs, maintain caching

## Next Steps

1. Start with SchoolYearStore (lowest coupling)
2. Validate with components using it
3. Move to ClassStore (medium coupling)
4. Complete with EvaluationResultsStore
5. Final cleanup and deprecation warnings

## Timeline Estimate

- **SchoolYearStore**: 2-3 hours (including testing)
- **ClassStore**: 3-4 hours (more complex logic)
- **EvaluationResultsStore**: 2-3 hours
- **SettingsStore**: 1-2 hours
- **Total**: ~10-15 hours for complete migration

---

**Last Updated:** 2025-10-08
**Status:** Planning Complete - Ready for Phase 2 Execution
