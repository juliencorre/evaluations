/**
 * Rate Limiting Composable
 * Prevents abuse and too many requests from the client side
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

interface RateLimitState {
  attempts: number
  firstAttemptTime: number
  blockedUntil: number
}

export const useRateLimit = (key: string, config: Partial<RateLimitConfig> = {}) => {
  const defaultConfig: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
    ...config
  }
  
  const storageKey = `rate_limit_${key}`
  
  /**
   * Get current rate limit state from localStorage
   */
  const getState = (): RateLimitState => {
    if (!process.client) {
      return { attempts: 0, firstAttemptTime: 0, blockedUntil: 0 }
    }
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error reading rate limit state:', error)
    }
    
    return { attempts: 0, firstAttemptTime: 0, blockedUntil: 0 }
  }
  
  /**
   * Save rate limit state to localStorage
   */
  const setState = (state: RateLimitState) => {
    if (!process.client) return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.error('Error saving rate limit state:', error)
    }
  }
  
  /**
   * Check if the user is currently blocked
   */
  const isBlocked = (): boolean => {
    const state = getState()
    const now = Date.now()
    
    if (state.blockedUntil > now) {
      return true
    }
    
    // Clear block if expired
    if (state.blockedUntil > 0 && state.blockedUntil <= now) {
      setState({ attempts: 0, firstAttemptTime: 0, blockedUntil: 0 })
    }
    
    return false
  }
  
  /**
   * Check if an action can be performed
   */
  const canAttempt = (): boolean => {
    if (isBlocked()) {
      return false
    }
    
    const state = getState()
    const now = Date.now()
    
    // Reset if window has expired
    if (state.firstAttemptTime && (now - state.firstAttemptTime) > defaultConfig.windowMs) {
      setState({ attempts: 0, firstAttemptTime: 0, blockedUntil: 0 })
      return true
    }
    
    return state.attempts < defaultConfig.maxAttempts
  }
  
  /**
   * Record an attempt
   */
  const recordAttempt = () => {
    if (!process.client) return
    
    const state = getState()
    const now = Date.now()
    
    // Initialize or reset if window expired
    if (!state.firstAttemptTime || (now - state.firstAttemptTime) > defaultConfig.windowMs) {
      setState({ attempts: 1, firstAttemptTime: now, blockedUntil: 0 })
      return
    }
    
    // Increment attempts
    const newAttempts = state.attempts + 1
    
    // Block if max attempts reached
    if (newAttempts >= defaultConfig.maxAttempts) {
      setState({
        attempts: newAttempts,
        firstAttemptTime: state.firstAttemptTime,
        blockedUntil: now + defaultConfig.blockDurationMs
      })
    } else {
      setState({
        attempts: newAttempts,
        firstAttemptTime: state.firstAttemptTime,
        blockedUntil: 0
      })
    }
  }
  
  /**
   * Get remaining time until unblocked (in seconds)
   */
  const getRemainingBlockTime = (): number => {
    const state = getState()
    const now = Date.now()
    
    if (state.blockedUntil > now) {
      return Math.ceil((state.blockedUntil - now) / 1000)
    }
    
    return 0
  }
  
  /**
   * Reset rate limit state
   */
  const reset = () => {
    if (!process.client) return
    localStorage.removeItem(storageKey)
  }
  
  return {
    canAttempt,
    recordAttempt,
    isBlocked,
    getRemainingBlockTime,
    reset
  }
}