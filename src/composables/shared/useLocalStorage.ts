import { ref, watch, type Ref } from 'vue'

/**
 * Composable pour la persistance dans localStorage avec réactivité
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const storedValue = ref<T>(defaultValue) as Ref<T>

  // Charger la valeur initiale depuis localStorage
  const loadValue = () => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        storedValue.value = JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error)
      storedValue.value = defaultValue
    }
  }

  // Sauvegarder la valeur dans localStorage
  const saveValue = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error saving localStorage key "${key}":`, error)
    }
  }

  // Charger la valeur initiale
  loadValue()

  // Observer les changements et sauvegarder
  watch(storedValue, (newValue) => {
    saveValue(newValue)
  }, { deep: true })

  // Écouter les changements depuis d'autres onglets
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === key && e.newValue !== null) {
      try {
        storedValue.value = JSON.parse(e.newValue)
      } catch (error) {
        console.warn(`Error parsing localStorage change for key "${key}":`, error)
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)

  return storedValue
}

/**
 * Supprime une clé du localStorage
 */
export function removeLocalStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error)
  }
}

/**
 * Efface tout le localStorage
 */
export function clearLocalStorage(): void {
  try {
    window.localStorage.clear()
  } catch (error) {
    console.warn('Error clearing localStorage:', error)
  }
}
