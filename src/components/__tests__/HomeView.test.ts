import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../../views/HomeView.vue'

describe('HomeView', () => {
  it('renders properly', () => {
    const wrapper = mount(HomeView)
    const main = wrapper.find('main')

    expect(main.exists()).toBe(true)
    expect(main.attributes('role')).toBe('main')

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.classes()).toContain('visually-hidden')
    expect(h1.text()).toBe('App Name Home Page')
  })
})
