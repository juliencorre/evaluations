import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import ClassResultsView from '@/views/ClassResultsView.vue'

// Mock router
const mockRouter = {
  push: vi.fn(),
  currentRoute: { value: { path: '/test' } }
}

interface MockJsPdfInstance {
  internal: {
    pageSize: {
      getWidth: () => number
      getHeight: () => number
    }
  }
  setFontSize: (...args: unknown[]) => void
  text: (...args: unknown[]) => void
  addImage: (...args: unknown[]) => void
  addPage: (...args: unknown[]) => void
  save: (...args: unknown[]) => void
}

const mockPdfInstances: MockJsPdfInstance[] = []

const mockJsPDF = vi.fn(() => {
  const instance = {
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 297),
        getHeight: vi.fn(() => 210)
      }
    },
    setFontSize: vi.fn(),
    text: vi.fn(),
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn()
  }
  mockPdfInstances.push(instance)
  return instance
})

const mockHtml2Canvas = vi.fn(async () => {
  const mockCanvas = {
    width: 800,
    height: 600,
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    getContext: vi.fn(() => ({
      drawImage: vi.fn()
    }))
  }
  return mockCanvas
})

vi.mock('jspdf', () => ({ jsPDF: mockJsPDF }))
vi.mock('html2canvas', () => ({ default: mockHtml2Canvas }))

vi.mock('@/services/supabaseStudentsService', () => ({
  supabaseStudentsService: {
    getAllStudents: vi.fn(async () => []),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn()
  }
}))

vi.mock('@/services/supabaseCompetenciesService', () => ({
  supabaseCompetenciesService: {
    getOrCreateDefaultFramework: vi.fn(async () => ({ id: 'framework-1', name: 'Mock', version: '1.0' })),
    getAllDomains: vi.fn(async () => []),
    updateSpecificCompetency: vi.fn()
  }
}))

describe('Fonctions d\'export PDF', () => {
  let alertSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockJsPDF.mockClear()
    mockHtml2Canvas.mockClear()
    mockPdfInstances.length = 0
    document.body.innerHTML = ''
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            drawImage: vi.fn()
          }))
          // eslint-disable-next-line no-undef
        } as unknown as HTMLCanvasElement
      }
      return originalCreateElement(tagName)
    })
  })

  afterEach(() => {
    alertSpy.mockRestore()
  })

  it('exporte le graphique individuel en PDF', async () => {
    const wrapper = mount(ClassResultsView, {
      props: {
        id: 'test-class-id'
      },
      global: {
        plugins: [createPinia()],
        mocks: {
          $router: mockRouter,
          $route: mockRouter.currentRoute.value
        },
        stubs: {
          CenterAppBar: { template: '<div />' },
          AnalysisTabs: { template: '<div><slot /></div>' },
          DashboardView: { template: '<div />' },
          StudentAnalysisView: { template: '<div />' }
        }
      }
    })

    await nextTick()

    // Manually create the DOM element that the export function looks for
    const chartElement = document.createElement('div')
    chartElement.className = 'competencies-card'
    chartElement.style.width = '800px'
    chartElement.style.height = '600px'
    Object.defineProperty(chartElement, 'scrollWidth', { value: 800, writable: false })
    Object.defineProperty(chartElement, 'scrollHeight', { value: 600, writable: false })
    document.body.appendChild(chartElement)

    await wrapper.vm.exportStudentChart()

    // Vérifier qu'aucune alerte n'a été déclenchée (élément trouvé)
    expect(alertSpy).not.toHaveBeenCalled()

    expect(mockHtml2Canvas).toHaveBeenCalled()
    expect(mockJsPDF).toHaveBeenCalledTimes(1)

    // Vérifier que le PDF a été créé et les méthodes appelées
    if (mockPdfInstances.length > 0) {
      const instance = mockPdfInstances[0]
      expect(instance.addImage).toHaveBeenCalled()
      expect(instance.save).toHaveBeenCalled()
    }
  })

  it('exporte tous les graphiques élèves en PDF multi-pages', async () => {
    const wrapper = mount(ClassResultsView, {
      props: {
        id: 'test-class-id'
      },
      global: {
        plugins: [createPinia()],
        mocks: {
          $router: mockRouter,
          $route: mockRouter.currentRoute.value
        },
        stubs: {
          CenterAppBar: { template: '<div />' },
          AnalysisTabs: { template: '<div><slot /></div>' },
          DashboardView: { template: '<div />' },
          StudentAnalysisView: { template: '<div />' }
        }
      }
    })

    await nextTick()

    // Manually create the DOM elements that the export function looks for
    const firstChart = document.createElement('div')
    firstChart.className = 'chart-container'
    firstChart.style.width = '800px'
    firstChart.style.height = '600px'
    Object.defineProperty(firstChart, 'scrollWidth', { value: 800, writable: false })
    Object.defineProperty(firstChart, 'scrollHeight', { value: 600, writable: false })
    const secondChart = document.createElement('div')
    secondChart.className = 'chart-container'
    secondChart.style.width = '800px'
    secondChart.style.height = '600px'
    Object.defineProperty(secondChart, 'scrollWidth', { value: 800, writable: false })
    Object.defineProperty(secondChart, 'scrollHeight', { value: 600, writable: false })
    document.body.appendChild(firstChart)
    document.body.appendChild(secondChart)

    await wrapper.vm.exportAllStudents()

    // Vérifier qu'aucune alerte n'a été déclenchée (éléments trouvés)
    expect(alertSpy).not.toHaveBeenCalled()

    expect(mockHtml2Canvas).toHaveBeenCalledTimes(2)
    expect(mockJsPDF).toHaveBeenCalledTimes(1)

    if (mockPdfInstances.length > 0) {
      const instance = mockPdfInstances[0]
      expect(instance.addImage).toHaveBeenCalled()
      expect(instance.save).toHaveBeenCalled()
    }
  })
})
