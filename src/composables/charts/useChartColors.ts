/**
 * Composable pour la gestion des couleurs de graphiques
 * Fournit des palettes de couleurs cohérentes pour tous les graphiques
 */

export interface ChartColorPalette {
  primary: string[]
  secondary: string[]
  success: string[]
  warning: string[]
  error: string[]
  neutral: string[]
}

export function useChartColors() {
  const colorPalettes: ChartColorPalette = {
    primary: [
      'rgba(33, 150, 243, 0.8)',
      'rgba(33, 150, 243, 0.6)',
      'rgba(33, 150, 243, 0.4)',
      'rgba(33, 150, 243, 0.2)'
    ],
    secondary: [
      'rgba(156, 39, 176, 0.8)',
      'rgba(156, 39, 176, 0.6)',
      'rgba(156, 39, 176, 0.4)',
      'rgba(156, 39, 176, 0.2)'
    ],
    success: [
      'rgba(76, 175, 80, 0.8)',
      'rgba(76, 175, 80, 0.6)',
      'rgba(76, 175, 80, 0.4)',
      'rgba(76, 175, 80, 0.2)'
    ],
    warning: [
      'rgba(255, 152, 0, 0.8)',
      'rgba(255, 152, 0, 0.6)',
      'rgba(255, 152, 0, 0.4)',
      'rgba(255, 152, 0, 0.2)'
    ],
    error: [
      'rgba(244, 67, 54, 0.8)',
      'rgba(244, 67, 54, 0.6)',
      'rgba(244, 67, 54, 0.4)',
      'rgba(244, 67, 54, 0.2)'
    ],
    neutral: [
      'rgba(158, 158, 158, 0.8)',
      'rgba(158, 158, 158, 0.6)',
      'rgba(158, 158, 158, 0.4)',
      'rgba(158, 158, 158, 0.2)'
    ]
  }

  /**
   * Génère un tableau de couleurs pour un nombre donné d'éléments
   */
  const generateColors = (count: number, palette: keyof ChartColorPalette = 'primary'): string[] => {
    const colors = colorPalettes[palette]
    const result: string[] = []

    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length])
    }

    return result
  }

  /**
   * Obtient une couleur spécifique d'une palette
   */
  const getColor = (palette: keyof ChartColorPalette, index = 0): string => {
    const colors = colorPalettes[palette]
    return colors[index % colors.length]
  }

  /**
   * Convertit une couleur rgba en format hex
   */
  const rgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    if (!match) return rgba

    const r = parseInt(match[1]).toString(16).padStart(2, '0')
    const g = parseInt(match[2]).toString(16).padStart(2, '0')
    const b = parseInt(match[3]).toString(16).padStart(2, '0')

    return `#${r}${g}${b}`
  }

  /**
   * Ajuste l'opacité d'une couleur rgba
   */
  const adjustOpacity = (color: string, opacity: number): string => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!match) return color

    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`
  }

  return {
    colorPalettes,
    generateColors,
    getColor,
    rgbaToHex,
    adjustOpacity
  }
}
