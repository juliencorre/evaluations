module.exports = {
  ci: {
    collect: {
      startServerCommand: 'VITE_SUPABASE_URL=https://dummy.supabase.co VITE_SUPABASE_ANON_KEY=dummy_key npm run preview -- --port 4173',
      startServerReadyPattern: 'Local:',
      url: ['http://localhost:4173/'],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        skipAudits: ['uses-http2'],
        onlyCategories: ['pwa', 'performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--enable-features=NetworkService,NetworkServiceLogging',
          '--force-device-scale-factor=1',
          '--hide-scrollbars',
          '--mute-audio'
        ],
        chromePath: require('puppeteer').executablePath(),
        maxWaitForFcp: 30 * 1000,
        maxWaitForLoad: 35 * 1000,
        pauseAfterFcpMs: 1000,
        pauseAfterLoadMs: 1000,
        networkQuietThresholdMs: 1000
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
