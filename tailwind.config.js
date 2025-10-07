/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Map Material Design color tokens to Tailwind
      colors: {
        // Primary colors
        'md-primary': 'var(--md-sys-color-primary)',
        'md-on-primary': 'var(--md-sys-color-on-primary)',
        'md-primary-container': 'var(--md-sys-color-primary-container)',
        'md-on-primary-container': 'var(--md-sys-color-on-primary-container)',

        // Secondary colors
        'md-secondary': 'var(--md-sys-color-secondary)',
        'md-on-secondary': 'var(--md-sys-color-on-secondary)',
        'md-secondary-container': 'var(--md-sys-color-secondary-container)',
        'md-on-secondary-container': 'var(--md-sys-color-on-secondary-container)',

        // Tertiary colors
        'md-tertiary': 'var(--md-sys-color-tertiary)',
        'md-on-tertiary': 'var(--md-sys-color-on-tertiary)',
        'md-tertiary-container': 'var(--md-sys-color-tertiary-container)',
        'md-on-tertiary-container': 'var(--md-sys-color-on-tertiary-container)',

        // Error colors
        'md-error': 'var(--md-sys-color-error)',
        'md-on-error': 'var(--md-sys-color-on-error)',
        'md-error-container': 'var(--md-sys-color-error-container)',
        'md-on-error-container': 'var(--md-sys-color-on-error-container)',

        // Surface colors
        'md-surface': 'var(--md-sys-color-surface)',
        'md-on-surface': 'var(--md-sys-color-on-surface)',
        'md-surface-variant': 'var(--md-sys-color-surface-variant)',
        'md-on-surface-variant': 'var(--md-sys-color-on-surface-variant)',

        // Background colors
        'md-background': 'var(--md-sys-color-background)',
        'md-on-background': 'var(--md-sys-color-on-background)',

        // Outline colors
        'md-outline': 'var(--md-sys-color-outline)',
        'md-outline-variant': 'var(--md-sys-color-outline-variant)',

        // Surface container colors
        'md-surface-container': 'var(--md-sys-color-surface-container)',
        'md-surface-container-low': 'var(--md-sys-color-surface-container-low)',
        'md-surface-container-high': 'var(--md-sys-color-surface-container-high)',
        'md-surface-container-highest': 'var(--md-sys-color-surface-container-highest)',

        // Inverse colors
        'md-inverse-surface': 'var(--md-sys-color-inverse-surface)',
        'md-inverse-on-surface': 'var(--md-sys-color-inverse-on-surface)',
        'md-inverse-primary': 'var(--md-sys-color-inverse-primary)',

        // Custom utility colors
        'md-success': 'var(--md-sys-color-success)',
        'md-on-success': 'var(--md-sys-color-on-success)',
        'md-success-container': 'var(--md-sys-color-success-container)',
        'md-on-success-container': 'var(--md-sys-color-on-success-container)',

        'md-warning': 'var(--md-sys-color-warning)',
        'md-on-warning': 'var(--md-sys-color-on-warning)',
        'md-warning-container': 'var(--md-sys-color-warning-container)',
        'md-on-warning-container': 'var(--md-sys-color-on-warning-container)',

        'md-info': 'var(--md-sys-color-info)',
        'md-on-info': 'var(--md-sys-color-on-info)',
        'md-info-container': 'var(--md-sys-color-info-container)',
        'md-on-info-container': 'var(--md-sys-color-on-info-container)',
      },

      // Map Material Design spacing tokens to Tailwind
      spacing: {
        'md-0': 'var(--md-sys-spacing-0)',
        'md-1': 'var(--md-sys-spacing-1)',
        'md-2': 'var(--md-sys-spacing-2)',
        'md-3': 'var(--md-sys-spacing-3)',
        'md-4': 'var(--md-sys-spacing-4)',
        'md-5': 'var(--md-sys-spacing-5)',
        'md-6': 'var(--md-sys-spacing-6)',
        'md-7': 'var(--md-sys-spacing-7)',
        'md-8': 'var(--md-sys-spacing-8)',
        'md-10': 'var(--md-sys-spacing-10)',
        'md-12': 'var(--md-sys-spacing-12)',
        'md-16': 'var(--md-sys-spacing-16)',
        'md-20': 'var(--md-sys-spacing-20)',
        'md-24': 'var(--md-sys-spacing-24)',
      },

      // Map Material Design border radius tokens
      borderRadius: {
        'md-none': 'var(--md-sys-shape-corner-none)',
        'md-xs': 'var(--md-sys-shape-corner-extra-small)',
        'md-sm': 'var(--md-sys-shape-corner-small)',
        'md-md': 'var(--md-sys-shape-corner-medium)',
        'md-lg': 'var(--md-sys-shape-corner-large)',
        'md-xl': 'var(--md-sys-shape-corner-extra-large)',
        'md-full': 'var(--md-sys-shape-corner-full)',
        'md-button': 'var(--md-sys-shape-button)',
        'md-card': 'var(--md-sys-shape-card)',
        'md-chip': 'var(--md-sys-shape-chip)',
        'md-dialog': 'var(--md-sys-shape-dialog)',
        'md-input': 'var(--md-sys-shape-input)',
      },

      // Map Material Design elevation/shadow tokens
      boxShadow: {
        'md-0': 'var(--md-sys-elevation-0)',
        'md-1': 'var(--md-sys-elevation-1)',
        'md-2': 'var(--md-sys-elevation-2)',
        'md-3': 'var(--md-sys-elevation-3)',
        'md-4': 'var(--md-sys-elevation-4)',
        'md-5': 'var(--md-sys-elevation-5)',
        'md-card': 'var(--md-sys-elevation-card)',
        'md-card-hover': 'var(--md-sys-elevation-card-hover)',
        'md-button': 'var(--md-sys-elevation-button)',
        'md-button-hover': 'var(--md-sys-elevation-button-hover)',
        'md-dialog': 'var(--md-sys-elevation-dialog)',
        'md-navigation': 'var(--md-sys-elevation-navigation)',
        'md-fab': 'var(--md-sys-elevation-fab)',
        'md-fab-hover': 'var(--md-sys-elevation-fab-hover)',
      },

      // Map Material Design typography tokens
      fontFamily: {
        'md-sans': 'var(--md-sys-typescale-font-family)',
        'md-mono': 'var(--md-sys-typescale-font-family-monospace)',
      },

      fontSize: {
        'md-display-large': ['var(--md-sys-typescale-display-large-font-size)', {
          lineHeight: 'var(--md-sys-typescale-display-large-line-height)',
          letterSpacing: 'var(--md-sys-typescale-display-large-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-display-large-font-weight)',
        }],
        'md-display-medium': ['var(--md-sys-typescale-display-medium-font-size)', {
          lineHeight: 'var(--md-sys-typescale-display-medium-line-height)',
          letterSpacing: 'var(--md-sys-typescale-display-medium-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-display-medium-font-weight)',
        }],
        'md-display-small': ['var(--md-sys-typescale-display-small-font-size)', {
          lineHeight: 'var(--md-sys-typescale-display-small-line-height)',
          letterSpacing: 'var(--md-sys-typescale-display-small-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-display-small-font-weight)',
        }],
        'md-headline-large': ['var(--md-sys-typescale-headline-large-font-size)', {
          lineHeight: 'var(--md-sys-typescale-headline-large-line-height)',
          letterSpacing: 'var(--md-sys-typescale-headline-large-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-headline-large-font-weight)',
        }],
        'md-headline-medium': ['var(--md-sys-typescale-headline-medium-font-size)', {
          lineHeight: 'var(--md-sys-typescale-headline-medium-line-height)',
          letterSpacing: 'var(--md-sys-typescale-headline-medium-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-headline-medium-font-weight)',
        }],
        'md-headline-small': ['var(--md-sys-typescale-headline-small-font-size)', {
          lineHeight: 'var(--md-sys-typescale-headline-small-line-height)',
          letterSpacing: 'var(--md-sys-typescale-headline-small-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-headline-small-font-weight)',
        }],
        'md-title-large': ['var(--md-sys-typescale-title-large-font-size)', {
          lineHeight: 'var(--md-sys-typescale-title-large-line-height)',
          letterSpacing: 'var(--md-sys-typescale-title-large-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-title-large-font-weight)',
        }],
        'md-title-medium': ['var(--md-sys-typescale-title-medium-font-size)', {
          lineHeight: 'var(--md-sys-typescale-title-medium-line-height)',
          letterSpacing: 'var(--md-sys-typescale-title-medium-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-title-medium-font-weight)',
        }],
        'md-title-small': ['var(--md-sys-typescale-title-small-font-size)', {
          lineHeight: 'var(--md-sys-typescale-title-small-line-height)',
          letterSpacing: 'var(--md-sys-typescale-title-small-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-title-small-font-weight)',
        }],
        'md-label-large': ['var(--md-sys-typescale-label-large-font-size)', {
          lineHeight: 'var(--md-sys-typescale-label-large-line-height)',
          letterSpacing: 'var(--md-sys-typescale-label-large-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-label-large-font-weight)',
        }],
        'md-label-medium': ['var(--md-sys-typescale-label-medium-font-size)', {
          lineHeight: 'var(--md-sys-typescale-label-medium-line-height)',
          letterSpacing: 'var(--md-sys-typescale-label-medium-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-label-medium-font-weight)',
        }],
        'md-label-small': ['var(--md-sys-typescale-label-small-font-size)', {
          lineHeight: 'var(--md-sys-typescale-label-small-line-height)',
          letterSpacing: 'var(--md-sys-typescale-label-small-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-label-small-font-weight)',
        }],
        'md-body-large': ['var(--md-sys-typescale-body-large-font-size)', {
          lineHeight: 'var(--md-sys-typescale-body-large-line-height)',
          letterSpacing: 'var(--md-sys-typescale-body-large-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-body-large-font-weight)',
        }],
        'md-body-medium': ['var(--md-sys-typescale-body-medium-font-size)', {
          lineHeight: 'var(--md-sys-typescale-body-medium-line-height)',
          letterSpacing: 'var(--md-sys-typescale-body-medium-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-body-medium-font-weight)',
        }],
        'md-body-small': ['var(--md-sys-typescale-body-small-font-size)', {
          lineHeight: 'var(--md-sys-typescale-body-small-line-height)',
          letterSpacing: 'var(--md-sys-typescale-body-small-letter-spacing)',
          fontWeight: 'var(--md-sys-typescale-body-small-font-weight)',
        }],
      },

      // Max width for containers
      maxWidth: {
        'md-container': 'var(--md-sys-spacing-container-max-width)',
      },

      // Transition durations
      transitionDuration: {
        'md-fast': '100ms',
        'md-medium': '200ms',
        'md-slow': '300ms',
        'md-slower': '500ms',
      },

      // Custom animations
      animation: {
        'md-fade-in': 'fadeIn 200ms ease-in-out',
        'md-slide-in': 'slideIn 300ms ease-out',
        'md-scale-in': 'scaleIn 200ms ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
