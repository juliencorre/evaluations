import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type ThemePreference = 'light' | 'dark'

const STORAGE_KEYS = {
  SHOW_CONSOLE_LOGOS: 'app.settings.showConsoleLogos',
  THEME_PREFERENCE: 'app.settings.themePreference'
} as const

const readStoredBoolean = (key: string): boolean | null => {
  if (typeof window === 'undefined') return null
  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === null) return null
    if (rawValue === 'true' || rawValue === 'false') {
      return rawValue === 'true'
    }
    return JSON.parse(rawValue) === true
  } catch {
    return null
  }
}

const persistBoolean = (key: string, value: boolean) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // no-op
  }
}

const readStoredThemePreference = (key: string): ThemePreference | null => {
  if (typeof window === 'undefined') return null
  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === 'light' || rawValue === 'dark') {
      return rawValue
    }
    return null
  } catch {
    return null
  }
}

const persistThemePreference = (key: string, value: ThemePreference) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // no-op
  }
}

const getSystemThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'light'
  try {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (mediaQuery) {
      return mediaQuery.matches ? 'dark' : 'light'
    }
    return 'light'
  } catch {
    return 'light'
  }
}

const applyThemePreference = (value: ThemePreference) => {
  if (typeof document === 'undefined') return
  const rootElement = document.documentElement
  rootElement.setAttribute('data-theme', value)
  rootElement.style.colorScheme = value
}

export const useSettingsStore = defineStore('settings', () => {
  const showConsoleLogos = ref(false)
  const themePreference = ref<ThemePreference>('light')

  const storedShowConsoleLogos = readStoredBoolean(STORAGE_KEYS.SHOW_CONSOLE_LOGOS)
  if (typeof storedShowConsoleLogos === 'boolean') {
    showConsoleLogos.value = storedShowConsoleLogos
  }

  const storedThemePreference = readStoredThemePreference(STORAGE_KEYS.THEME_PREFERENCE)
  themePreference.value = storedThemePreference ?? getSystemThemePreference()
  applyThemePreference(themePreference.value)

  const isDarkThemeEnabled = computed(() => themePreference.value === 'dark')

  const setShowConsoleLogos = (value: boolean) => {
    showConsoleLogos.value = value
    persistBoolean(STORAGE_KEYS.SHOW_CONSOLE_LOGOS, value)
  }

  const toggleShowConsoleLogos = () => {
    setShowConsoleLogos(!showConsoleLogos.value)
  }

  const setThemePreference = (value: ThemePreference) => {
    themePreference.value = value
    persistThemePreference(STORAGE_KEYS.THEME_PREFERENCE, value)
    applyThemePreference(value)
  }

  const toggleThemePreference = () => {
    setThemePreference(themePreference.value === 'dark' ? 'light' : 'dark')
  }

  return {
    showConsoleLogos,
    themePreference,
    isDarkThemeEnabled,
    setShowConsoleLogos,
    toggleShowConsoleLogos,
    setThemePreference,
    toggleThemePreference
  }
})

// Deprecated: Use useSettingsStore().showConsoleLogos directly
export const getShowConsoleLogosRef = () => {
  const store = useSettingsStore()
  return store.showConsoleLogos
}
