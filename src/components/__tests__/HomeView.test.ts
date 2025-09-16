import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import HomeView from '../../views/HomeView.vue'
import type { CompetencyFramework } from '@/types/evaluation'

// Mock the stores
const mockFramework = ref<CompetencyFramework>({
  id: 'test-framework',
  name: 'Test Framework',
  version: '1.0',
  domains: [
    {
      id: 'domain-1',
      name: 'Test Domain',
      description: 'Test domain',
      fields: []
    }
  ]
})

const mockIsLoading = ref(false)
const mockAllStudents = ref([])

// Mock the store functions
vi.mock('@/stores/studentsStore', () => ({
  useStudentsStore: vi.fn(() => ({
    allStudents: mockAllStudents
  })),
  useCompetencyFrameworkStore: vi.fn(() => ({
    framework: mockFramework,
    isCompetenciesLoading: mockIsLoading
  }))
}))

// Mock the static data
vi.mock('@/data/staticData', () => ({
  SAMPLE_EVALUATION: {
    id: 'test-evaluation',
    name: 'Test Evaluation',
    students: []
  }
}))

describe('HomeView', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFramework.value = {
      id: 'test-framework',
      name: 'Test Framework',
      version: '1.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Test Domain',
          description: 'Test domain',
          fields: []
        }
      ]
    }
    mockIsLoading.value = false
    mockAllStudents.value = []
  })

  it('renders properly', () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          EvaluationTable: {
            template: '<div data-test="evaluation-table">Mocked EvaluationTable</div>'
          }
        }
      }
    })

    const main = wrapper.find('main')
    expect(main.exists()).toBe(true)
    expect(main.attributes('role')).toBe('main')

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.classes()).toContain('visually-hidden')
    expect(h1.text()).toBe("Tableau d'évaluation des compétences")

    // Verify the evaluation table is rendered (since we have domains in our mock)
    const evaluationTable = wrapper.find('[data-test="evaluation-table"]')
    expect(evaluationTable.exists()).toBe(true)
  })

  it('shows loading state when isLoading is true', () => {
    mockIsLoading.value = true

    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          EvaluationTable: {
            template: '<div data-test="evaluation-table">Mocked EvaluationTable</div>'
          }
        }
      }
    })

    const loadingState = wrapper.find('.loading-state')
    expect(loadingState.exists()).toBe(true)
    expect(loadingState.text()).toContain('Chargement des compétences...')
  })

  it('shows empty state when no domains are available', () => {
    mockFramework.value.domains = []
    mockIsLoading.value = false

    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          EvaluationTable: {
            template: '<div data-test="evaluation-table">Mocked EvaluationTable</div>'
          }
        }
      }
    })

    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('Aucune compétence disponible')
  })
})
