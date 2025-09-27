import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisView from '@/views/AnalysisView.vue'

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

const mockHtml2Canvas = vi.fn(async () => ({
  width: 800,
  height: 600,
  toDataURL: vi.fn(() => 'data:image/png;base64,mock')
}))

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
  })

  afterEach(() => {
    alertSpy.mockRestore()
  })

  it('exporte le graphique individuel en PDF', async () => {
    const chartElement = document.createElement('div')
    chartElement.className = 'chart-container'
    document.body.appendChild(chartElement)

    const wrapper = mount(AnalysisView, {
      global: {
        stubs: {
          CenterAppBar: { template: '<div />' },
          AnalysisTabs: { template: '<div><slot /></div>' },
          DashboardView: { template: '<div />' },
          StudentAnalysisView: { template: '<div />' }
        }
      }
    })

    await wrapper.vm.exportStudentChart()

    expect(mockHtml2Canvas).toHaveBeenCalledWith(chartElement, expect.objectContaining({
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    }))
    expect(mockJsPDF).toHaveBeenCalledTimes(1)
    const instance = mockPdfInstances[0]
    expect(instance.addImage).toHaveBeenCalled()
    expect(instance.save).toHaveBeenCalled()
  })

  it('exporte tous les graphiques élèves en PDF multi-pages', async () => {
    const firstChart = document.createElement('div')
    firstChart.className = 'chart-container'
    const secondChart = document.createElement('div')
    secondChart.className = 'chart-container'
    document.body.append(firstChart, secondChart)

    const wrapper = mount(AnalysisView, {
      global: {
        stubs: {
          CenterAppBar: { template: '<div />' },
          AnalysisTabs: { template: '<div><slot /></div>' },
          DashboardView: { template: '<div />' },
          StudentAnalysisView: { template: '<div />' }
        }
      }
    })

    await wrapper.vm.exportAllStudents()

    expect(mockHtml2Canvas).toHaveBeenCalledTimes(2)
    expect(mockJsPDF).toHaveBeenCalledTimes(1)
    const instance = mockPdfInstances[0]
    expect(instance.addImage).toHaveBeenCalled()
    expect(instance.save).toHaveBeenCalled()
  })
})
