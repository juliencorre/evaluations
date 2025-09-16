import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../../views/HomeView.vue'

describe('HomeView', () => {
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
    expect(h1.text()).toBe('Tableau d\'évaluation des compétences')

    // Verify the evaluation table is rendered
    const evaluationTable = wrapper.find('[data-test="evaluation-table"]')
    expect(evaluationTable.exists()).toBe(true)
  })
})
