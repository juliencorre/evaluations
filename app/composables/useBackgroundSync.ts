import { ref, reactive } from 'vue'

export interface SyncQueueItem {
  id: string
  type: 'auth' | 'form' | 'data'
  action: string
  data: any
  timestamp: number
  retries: number
  maxRetries: number
}

export const useBackgroundSync = () => {
  const isSupported = ref(false)
  const isOnline = ref(true)
  const syncQueue = ref<SyncQueueItem[]>([])
  const isSyncing = ref(false)
  const lastSync = ref<Date | null>(null)

  // Check if background sync is supported
  const checkSupport = () => {
    isSupported.value = 
      'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype
  }

  // Initialize online/offline detection
  const initOnlineDetection = () => {
    if (process.client) {
      isOnline.value = navigator.onLine
      
      window.addEventListener('online', () => {
        isOnline.value = true
        console.log('Back online, attempting to sync...')
        syncPendingItems()
      })
      
      window.addEventListener('offline', () => {
        isOnline.value = false
        console.log('Gone offline, queuing sync items...')
      })
    }
  }

  // Load sync queue from localStorage
  const loadSyncQueue = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem('background-sync-queue')
        if (stored) {
          syncQueue.value = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Failed to load sync queue:', error)
      }
    }
  }

  // Save sync queue to localStorage
  const saveSyncQueue = () => {
    if (process.client) {
      try {
        localStorage.setItem('background-sync-queue', JSON.stringify(syncQueue.value))
      } catch (error) {
        console.error('Failed to save sync queue:', error)
      }
    }
  }

  // Add item to sync queue
  const addToSyncQueue = (
    type: SyncQueueItem['type'],
    action: string,
    data: any,
    maxRetries: number = 3
  ): string => {
    const item: SyncQueueItem = {
      id: generateId(),
      type,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries
    }

    syncQueue.value.push(item)
    saveSyncQueue()

    console.log('Added to sync queue:', item)

    // Try to sync immediately if online
    if (isOnline.value) {
      syncPendingItems()
    }

    return item.id
  }

  // Remove item from sync queue
  const removeFromSyncQueue = (id: string) => {
    const index = syncQueue.value.findIndex(item => item.id === id)
    if (index > -1) {
      syncQueue.value.splice(index, 1)
      saveSyncQueue()
      console.log('Removed from sync queue:', id)
    }
  }

  // Sync a single item
  const syncItem = async (item: SyncQueueItem): Promise<boolean> => {
    try {
      console.log('Syncing item:', item)

      let success = false

      switch (item.type) {
        case 'auth':
          success = await syncAuthItem(item)
          break
        case 'form':
          success = await syncFormItem(item)
          break
        case 'data':
          success = await syncDataItem(item)
          break
        default:
          console.warn('Unknown sync item type:', item.type)
          return false
      }

      if (success) {
        removeFromSyncQueue(item.id)
        console.log('Successfully synced item:', item.id)
        return true
      } else {
        throw new Error('Sync operation returned false')
      }

    } catch (error) {
      console.error('Failed to sync item:', item.id, error)
      
      item.retries++
      
      if (item.retries >= item.maxRetries) {
        console.error('Max retries reached for item:', item.id)
        removeFromSyncQueue(item.id)
        
        // Optionally notify user about failed sync
        showSyncFailedNotification(item)
        
        return false
      } else {
        saveSyncQueue()
        return false
      }
    }
  }

  // Sync authentication items
  const syncAuthItem = async (item: SyncQueueItem): Promise<boolean> => {
    const { action, data } = item

    try {
      const { login, register, resetPassword } = useAuth()

      switch (action) {
        case 'login':
          const loginResult = await login(data.email, data.password)
          return !loginResult.error
          
        case 'register':
          const registerResult = await register(data.email, data.password, data.metadata)
          return !registerResult.error
          
        case 'resetPassword':
          const resetResult = await resetPassword(data.email)
          return !resetResult.error
          
        default:
          console.warn('Unknown auth action:', action)
          return false
      }
    } catch (error) {
      console.error('Auth sync failed:', error)
      return false
    }
  }

  // Sync form items
  const syncFormItem = async (item: SyncQueueItem): Promise<boolean> => {
    const { action, data } = item

    try {
      // Here you would implement your form sync logic
      // For example, submitting evaluation forms, user profile updates, etc.
      
      const response = await $fetch(`/api/sync/${action}`, {
        method: 'POST',
        body: data
      })

      return response.success
    } catch (error) {
      console.error('Form sync failed:', error)
      return false
    }
  }

  // Sync data items
  const syncDataItem = async (item: SyncQueueItem): Promise<boolean> => {
    const { action, data } = item

    try {
      // Implement generic data sync
      const response = await $fetch(`/api/data/${action}`, {
        method: 'POST',
        body: data
      })

      return response.success
    } catch (error) {
      console.error('Data sync failed:', error)
      return false
    }
  }

  // Sync all pending items
  const syncPendingItems = async () => {
    if (isSyncing.value || !isOnline.value || syncQueue.value.length === 0) {
      return
    }

    isSyncing.value = true

    try {
      console.log('Starting background sync...', syncQueue.value.length, 'items')

      // Create a copy to avoid modifying array during iteration
      const itemsToSync = [...syncQueue.value]

      for (const item of itemsToSync) {
        await syncItem(item)
        
        // Add small delay between sync operations
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      lastSync.value = new Date()
      console.log('Background sync completed')

    } catch (error) {
      console.error('Background sync failed:', error)
    } finally {
      isSyncing.value = false
    }
  }

  // Register background sync (if supported)
  const registerBackgroundSync = async (tag: string = 'background-sync') => {
    if (!isSupported.value) {
      console.warn('Background sync not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      console.log('Background sync registered:', tag)
    } catch (error) {
      console.error('Background sync registration failed:', error)
    }
  }

  // Show notification for failed sync
  const showSyncFailedNotification = (item: SyncQueueItem) => {
    if (process.client && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Synchronisation échouée', {
        body: `Impossible de synchroniser ${item.type}: ${item.action}`,
        icon: '/pwa-192x192.png',
        tag: 'sync-failed'
      })
    }
  }

  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  // Queue form submission for background sync
  const queueFormSubmission = (formType: string, formData: any) => {
    return addToSyncQueue('form', formType, formData)
  }

  // Queue auth operation for background sync
  const queueAuthOperation = (authType: string, authData: any) => {
    return addToSyncQueue('auth', authType, authData)
  }

  // Initialize
  if (process.client) {
    checkSupport()
    initOnlineDetection()
    loadSyncQueue()
  }

  return {
    // State
    isSupported: readonly(isSupported),
    isOnline: readonly(isOnline),
    syncQueue: readonly(syncQueue),
    isSyncing: readonly(isSyncing),
    lastSync: readonly(lastSync),
    
    // Methods
    addToSyncQueue,
    removeFromSyncQueue,
    syncPendingItems,
    registerBackgroundSync,
    queueFormSubmission,
    queueAuthOperation,
    
    // Utility
    checkSupport,
    loadSyncQueue,
    saveSyncQueue
  }
}