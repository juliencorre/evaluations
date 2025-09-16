module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      url: ['http://localhost:4178/'],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        skipAudits: ['uses-http2'],
        onlyCategories: ['pwa', 'performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: ['--no-sandbox', '--disable-dev-shm-usage'],
        chromePath: require('puppeteer').executablePath()
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
