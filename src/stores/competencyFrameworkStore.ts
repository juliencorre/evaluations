import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CompetencyFramework } from '@/types/evaluation'
import { supabaseCompetenciesService } from '@/services/supabaseCompetenciesService'

export const useCompetencyFrameworkStore = defineStore('competencyFramework', () => {
  // State
  const framework = ref<CompetencyFramework | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasFramework = computed(() => framework.value !== null)
  const domains = computed(() => framework.value?.domains || [])

  // Actions
  async function loadFramework(frameworkId: string) {
    isLoading.value = true
    error.value = null

    try {
      const data = await supabaseCompetenciesService.getFramework(frameworkId)
      framework.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load framework'
      console.error('Error loading framework:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function refreshFromSupabase(frameworkId: string) {
    return loadFramework(frameworkId)
  }

  function setFramework(newFramework: CompetencyFramework | null) {
    framework.value = newFramework
  }

  function clearFramework() {
    framework.value = null
    error.value = null
  }

  return {
    // State
    framework,
    isLoading,
    error,

    // Getters
    hasFramework,
    domains,

    // Actions
    loadFramework,
    refreshFromSupabase,
    setFramework,
    clearFramework
  }
})
