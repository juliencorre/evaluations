import { ref, readonly, computed } from 'vue'

const STORAGE_KEYS = {
  SHOW_CONSOLE_LOGOS: 'app.settings.showConsoleLogos',
  THEME_PREFERENCE: 'app.settings.themePreference'
} as const

const showConsoleLogos = ref(false)
type ThemePreference = 'light' | 'dark'
const themePreference = ref<ThemePreference>('light')

const readStoredBoolean = (key: string): boolean | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === null) {
      return null
    }

    if (rawValue === 'true' || rawValue === 'false') {
      return rawValue === 'true'
    }

    return JSON.parse(rawValue) === true
  } catch (error) {
    console.warn('Impossible de lire le paramètre depuis le stockage local:', error)
    return null
  }
}

const persistBoolean = (key: string, value: boolean) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Impossible d\'enregistrer le paramètre dans le stockage local:', error)
  }
}

const readStoredThemePreference = (key: string): ThemePreference | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === 'light' || rawValue === 'dark') {
      return rawValue
    }

    return null
  } catch (error) {
    console.warn('Impossible de lire la préférence de thème depuis le stockage local:', error)
    return null
  }
}

const persistThemePreference = (key: string, value: ThemePreference) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.warn('Impossible d\'enregistrer la préférence de thème dans le stockage local:', error)
  }
}

const getSystemThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (mediaQuery) {
      return mediaQuery.matches ? 'dark' : 'light'
    }

    return 'light'
  } catch (error) {
    console.warn('Impossible de déterminer la préférence système pour le thème:', error)
    return 'light'
  }
}

const applyThemePreference = (value: ThemePreference) => {
  if (typeof document === 'undefined') {
    return
  }

  const rootElement = document.documentElement
  rootElement.setAttribute('data-theme', value)
  rootElement.style.colorScheme = value
}

const storedShowConsoleLogos = readStoredBoolean(STORAGE_KEYS.SHOW_CONSOLE_LOGOS)
if (typeof storedShowConsoleLogos === 'boolean') {
  showConsoleLogos.value = storedShowConsoleLogos
}

const storedThemePreference = readStoredThemePreference(STORAGE_KEYS.THEME_PREFERENCE)
if (storedThemePreference) {
  themePreference.value = storedThemePreference
} else {
  themePreference.value = getSystemThemePreference()
}

applyThemePreference(themePreference.value)

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

export const getShowConsoleLogosRef = () => showConsoleLogos

const isDarkThemeEnabled = computed(() => themePreference.value === 'dark')

export const useSettingsStore = () => {
  return {
    showConsoleLogos: readonly(showConsoleLogos),
    setShowConsoleLogos,
    toggleShowConsoleLogos,
    themePreference: readonly(themePreference),
    setThemePreference,
    toggleThemePreference,
    isDarkThemeEnabled
  }
}

