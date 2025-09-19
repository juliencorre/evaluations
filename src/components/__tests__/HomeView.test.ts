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
const mockCurrentEvaluation = ref({
  id: 'test-evaluation',
  name: 'Test Evaluation',
  description: '',
  classId: 'test-class',
  frameworkId: 'test-framework',
  createdAt: new Date().toISOString()
})

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

// Mock evaluation store
vi.mock('@/stores/evaluationStore', () => ({
  useEvaluationStore: vi.fn(() => ({
    currentEvaluation: mockCurrentEvaluation,
    setCurrentEvaluation: vi.fn(),
    getEvaluationById: vi.fn(() => mockCurrentEvaluation.value),
    loadEvaluations: vi.fn(() => Promise.resolve())
  }))
}))

// Mock router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { id: 'test-evaluation' }
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
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
      props: {
        id: 'test-evaluation'
      },
      global: {
        stubs: {
          EvaluationTable: {
            template: '<div data-test="evaluation-table">Mocked EvaluationTable</div>'
          },
          CenterAppBar: {
            template: '<div data-test="center-app-bar">Mocked AppBar</div>'
          },
          EvaluationMobileView: {
            template: '<div data-test="evaluation-mobile">Mocked Mobile View</div>'
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
      props: {
        id: 'test-evaluation'
      },
      global: {
        stubs: {
          EvaluationTable: {
            template: '<div data-test="evaluation-table">Mocked EvaluationTable</div>'
          },
          CenterAppBar: {
            template: '<div data-test="center-app-bar">Mocked AppBar</div>'
          },
          EvaluationMobileView: {
            template: '<div data-test="evaluation-mobile">Mocked Mobile View</div>'
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
      props: {
        id: 'test-evaluation'
      },
      global: {
        stubs: {
          EvaluationTable: {
            template: '<div data-test="evaluation-table">Mocked EvaluationTable</div>'
          },
          CenterAppBar: {
            template: '<div data-test="center-app-bar">Mocked AppBar</div>'
          },
          EvaluationMobileView: {
            template: '<div data-test="evaluation-mobile">Mocked Mobile View</div>'
          }
        }
      }
    })

    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('Aucune compétence disponible')
  })
})
