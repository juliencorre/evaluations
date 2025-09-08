import { ref, computed } from 'vue'

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  data?: any
  actions?: NotificationAction[]
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export const usePushNotifications = () => {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const subscription = ref<PushSubscription | null>(null)
  const permission = ref<NotificationPermission>('default')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Check if push notifications are supported
  const checkSupport = () => {
    isSupported.value = 
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    
    if (isSupported.value) {
      permission.value = Notification.permission
    }
  }

  // Request notification permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported.value) {
      throw new Error('Push notifications are not supported')
    }

    if (permission.value === 'granted') {
      return permission.value
    }

    const result = await Notification.requestPermission()
    permission.value = result
    
    return result
  }

  // Subscribe to push notifications
  const subscribe = async (vapidPublicKey?: string): Promise<PushSubscriptionData | null> => {
    if (!isSupported.value) {
      throw new Error('Push notifications are not supported')
    }

    isLoading.value = true
    error.value = null

    try {
      // Request permission first
      const permissionResult = await requestPermission()
      
      if (permissionResult !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready
      
      // Subscribe to push service
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })

      subscription.value = sub
      isSubscribed.value = true

      // Convert to serializable format
      const subscriptionData: PushSubscriptionData = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
          auth: arrayBufferToBase64(sub.getKey('auth'))
        }
      }

      console.log('Push subscription successful:', subscriptionData)
      return subscriptionData

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Subscription failed'
      console.error('Push subscription failed:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const success = await subscription.value.unsubscribe()
      
      if (success) {
        subscription.value = null
        isSubscribed.value = false
        console.log('Push unsubscription successful')
      }
      
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unsubscription failed'
      console.error('Push unsubscription failed:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Show local notification
  const showNotification = async (options: NotificationOptions): Promise<Notification | null> => {
    if (!isSupported.value) {
      throw new Error('Notifications are not supported')
    }

    const permissionResult = await requestPermission()
    
    if (permissionResult !== 'granted') {
      throw new Error('Notification permission denied')
    }

    try {
      // If we have a service worker, use it for better control
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/pwa-192x192.png',
          badge: options.badge || '/pwa-64x64.png',
          image: options.image,
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          silent: options.silent,
          timestamp: options.timestamp,
          data: options.data,
          actions: options.actions
        })
        return null
      } else {
        // Fallback to basic notification
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/pwa-192x192.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          silent: options.silent,
          timestamp: options.timestamp,
          data: options.data
        })
        return notification
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Notification failed'
      console.error('Show notification failed:', err)
      return null
    }
  }

  // Get current subscription
  const getCurrentSubscription = async (): Promise<PushSubscription | null> => {
    if (!isSupported.value) {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      
      subscription.value = sub
      isSubscribed.value = !!sub
      
      return sub
    } catch (err) {
      console.error('Get subscription failed:', err)
      return null
    }
  }

  // Utility function to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return ''
    
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Computed properties
  const canSubscribe = computed(() => 
    isSupported.value && 
    permission.value !== 'denied' && 
    !isSubscribed.value
  )

  const canUnsubscribe = computed(() => 
    isSupported.value && 
    isSubscribed.value
  )

  // Initialize on mount
  if (import.meta.client) {
    checkSupport()
    
    // Check existing subscription
    nextTick(async () => {
      await getCurrentSubscription()
    })
  }

  return {
    // State
    isSupported: readonly(isSupported),
    isSubscribed: readonly(isSubscribed),
    subscription: readonly(subscription),
    permission: readonly(permission),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    canSubscribe: readonly(canSubscribe),
    canUnsubscribe: readonly(canUnsubscribe),
    
    // Methods
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    getCurrentSubscription,
    checkSupport
  }
}