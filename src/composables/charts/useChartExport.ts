import { type Chart } from 'chart.js'

/**
 * Composable pour l'export de graphiques
 */
export function useChartExport() {
  /**
   * Exporte un graphique en tant qu'image PNG
   */
  const exportToPNG = (chart: Chart, filename = 'chart.png') => {
    const url = chart.toBase64Image()
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    link.click()
  }

  /**
   * Exporte un graphique en tant qu'image JPEG
   */
  const exportToJPEG = (chart: Chart, filename = 'chart.jpg', quality = 0.95) => {
    const canvas = chart.canvas
    const url = canvas.toDataURL('image/jpeg', quality)
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    link.click()
  }

  /**
   * Copie un graphique dans le presse-papiers
   */
  const copyToClipboard = async (chart: Chart): Promise<boolean> => {
    try {
      const canvas = chart.canvas
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })

      if (!blob) {
        throw new Error('Failed to create blob from canvas')
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])

      return true
    } catch (error) {
      console.error('Failed to copy chart to clipboard:', error)
      return false
    }
  }

  /**
   * Obtient l'URL base64 d'un graphique
   */
  const getDataURL = (chart: Chart, type: 'png' | 'jpeg' = 'png', quality = 0.95): string => {
    if (type === 'jpeg') {
      return chart.canvas.toDataURL('image/jpeg', quality)
    }
    return chart.toBase64Image()
  }

  /**
   * Imprime un graphique
   */
  const printChart = (chart: Chart, title?: string) => {
    const dataURL = chart.toBase64Image()
    const windowContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'Graphique'}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          ${title ? `<h1>${title}</h1>` : ''}
          <img src="${dataURL}" />
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(windowContent)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    }
  }

  return {
    exportToPNG,
    exportToJPEG,
    copyToClipboard,
    getDataURL,
    printChart
  }
}
