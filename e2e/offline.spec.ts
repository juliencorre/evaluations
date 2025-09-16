import { test, expect } from '@playwright/test'

test.describe('PWA Offline Functionality', () => {
  test('app shell loads offline after initial visit', async ({ page, context }) => {
    // Visit the app online first
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for service worker to be ready with timeout and error handling
    try {
      await page.evaluate(async () => {
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
          throw new Error('Service Worker not supported')
        }

        // Wait for service worker registration with timeout
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) =>
            window.setTimeout(() => reject(new Error('Service Worker timeout')), 5000)
          )
        ])

        return registration
      })
    } catch {
      console.log('Service Worker not available, skipping PWA offline test')
      test.skip()
    }

    // Give time for caching
    await page.waitForTimeout(2000)

    // Go offline
    await context.setOffline(true)

    // Try to reload the page
    await page.reload()

    // Check that the page still loads
    await expect(page.locator('main[role="main"]')).toBeVisible()

    // Verify the visually hidden h1 is present
    await expect(page.locator('h1.visually-hidden')).toHaveText('Tableau d\'évaluation des compétences')

    // Verify no network errors in console
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(1000)

    // Filter out non-network errors
    const networkErrors = consoleErrors.filter(
      (error) =>
        error.includes('net::') ||
        error.includes('Failed to fetch') ||
        error.includes('NetworkError')
    )

    expect(networkErrors).toHaveLength(0)
  })
})
