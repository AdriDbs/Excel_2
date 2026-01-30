/**
 * BearingPoint Brand Constants
 * Centralized configuration for all brand-related values
 */

export const BRAND = {
  name: 'BearingPoint',
  tagline: 'Formation Excel Avancé',

  // Logo paths
  logos: {
    full: '/assets/bearingpoint-logo.svg',
    symbol: '/assets/bearingpoint-symbol.svg',
  },

  // Primary Colors (from brand guidelines)
  colors: {
    primary: {
      bearingRed: '#FF3D47',    // R50 - Main brand color
      deepRed: '#330000',       // R80 - Deep red for backgrounds
      black: '#000000',
      white: '#FFFFFF',
    },

    // Red scale (R10-R80)
    red: {
      10: '#FFD6D8',
      20: '#FFBDC0',
      30: '#FFA3A8',
      40: '#FF787A',
      50: '#FF3D47',  // Primary
      60: '#CC2931',
      70: '#99171D',
      80: '#330000',
    },

    // Gray scale (G10-G60) - Warm grays
    gray: {
      10: '#FAF8F7',
      20: '#E6DEDA',
      30: '#CCC1BC',
      40: '#B2A59F',
      50: '#98847A',
      60: '#806659',
    },
  },

  // Gradient definitions
  gradients: {
    primary: 'from-bearing-red-80 to-bearing-red-50',
    dark: 'from-bearing-red-80 via-bearing-red-70 to-bearing-red-80',
    light: 'from-bearing-red-50 to-bearing-red-30',
    card: 'from-bearing-red-60 to-bearing-red-50',
  },
} as const;

// Type for type-safe access to brand colors
export type BrandColor = keyof typeof BRAND.colors.red | keyof typeof BRAND.colors.gray;

// CSS custom properties for use in inline styles
export const brandCssVars = {
  '--bearing-red': BRAND.colors.primary.bearingRed,
  '--bearing-deep-red': BRAND.colors.primary.deepRed,
  '--bearing-black': BRAND.colors.primary.black,
  '--bearing-white': BRAND.colors.primary.white,
} as const;
