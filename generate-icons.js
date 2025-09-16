const fs = require('fs')
const { createCanvas } = require('canvas')

function createIcon(size, maskable = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#4A90E2'
  ctx.fillRect(0, 0, size, size)

  // Safe zone for maskable
  const safeZone = maskable ? size * 0.8 : size

  // Draw circle
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, safeZone / 3, 0, Math.PI * 2)
  ctx.fill()

  // Draw letter A
  ctx.fillStyle = '#4A90E2'
  ctx.font = `bold ${Math.floor(safeZone / 3)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('A', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

// Create all icons
fs.writeFileSync('public/pwa-192x192.png', createIcon(192))
fs.writeFileSync('public/pwa-512x512.png', createIcon(512))
fs.writeFileSync('public/pwa-maskable-512x512.png', createIcon(512, true))
fs.writeFileSync('public/apple-touch-icon.png', createIcon(180))

// Create favicon as simple square
const faviconCanvas = createCanvas(16, 16)
const fctx = faviconCanvas.getContext('2d')
fctx.fillStyle = '#4A90E2'
fctx.fillRect(0, 0, 16, 16)
fs.writeFileSync('public/favicon.ico', faviconCanvas.toBuffer('image/png'))

console.log('Icons created successfully')
