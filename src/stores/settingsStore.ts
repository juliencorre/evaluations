import { ref, readonly } from 'vue'

const STORAGE_KEYS = {
  SHOW_CONSOLE_LOGOS: 'app.settings.showConsoleLogos'
} as const

const showConsoleLogos = ref(false)

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

const storedShowConsoleLogos = readStoredBoolean(STORAGE_KEYS.SHOW_CONSOLE_LOGOS)
if (typeof storedShowConsoleLogos === 'boolean') {
  showConsoleLogos.value = storedShowConsoleLogos
}

const setShowConsoleLogos = (value: boolean) => {
  showConsoleLogos.value = value
  persistBoolean(STORAGE_KEYS.SHOW_CONSOLE_LOGOS, value)
}

const toggleShowConsoleLogos = () => {
  setShowConsoleLogos(!showConsoleLogos.value)
}

export const getShowConsoleLogosRef = () => showConsoleLogos

export const useSettingsStore = () => {
  return {
    showConsoleLogos: readonly(showConsoleLogos),
    setShowConsoleLogos,
    toggleShowConsoleLogos
  }
}

