import { useSettingsStore } from '@/stores'

// Lazy initialization to avoid calling store before Pinia is ready
let settingsStore: ReturnType<typeof useSettingsStore> | null = null

const getShowConsoleLogosValue = (): boolean => {
  if (!settingsStore) {
    try {
      settingsStore = useSettingsStore()
    } catch {
      // Fallback if Pinia is not ready yet
      return true
    }
  }
  return settingsStore.showConsoleLogos
}

type ConsoleMethod = 'log' | 'info' | 'debug' | 'warn' | 'error'

type ConsoleMethodMap = Record<ConsoleMethod, (...args: unknown[]) => void>

const originalConsoleMethods: ConsoleMethodMap = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
}

const emojiPattern = /\p{Extended_Pictographic}+\s*/gu

const sanitizeArguments = (args: unknown[]): unknown[] => {
  const showLogos = getShowConsoleLogosValue()

  if (showLogos) {
    return args
  }

  return args.map((arg) => {
    if (typeof arg === 'string') {
      return arg.replace(emojiPattern, '').replace(/^\s+/, '')
    }
    return arg
  })
}

const createConsoleWrapper = (method: ConsoleMethod) => {
  return (...args: unknown[]) => {
    const processedArgs = sanitizeArguments(args)
    originalConsoleMethods[method](...processedArgs)
  }
}

console.log = createConsoleWrapper('log')
console.info = createConsoleWrapper('info')
console.debug = createConsoleWrapper('debug')
console.warn = createConsoleWrapper('warn')
console.error = createConsoleWrapper('error')

