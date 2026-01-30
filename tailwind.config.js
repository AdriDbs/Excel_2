/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // BearingPoint Primary Colors
        bearing: {
          // Primary Red - Main brand color
          red: '#FF3D47',
          // Deep Red - For dark backgrounds
          deep: '#330000',
          // Black
          black: '#000000',
          // White
          white: '#FFFFFF',
        },
        // Red scale for various uses
        'bp-red': {
          50: '#FFD6D8',   // R10 - Lightest pink
          100: '#FFBDC0',  // R20
          200: '#FFA3A8',  // R30
          300: '#FF787A',  // R40
          400: '#FF3D47',  // R50 - Primary Bearing Red
          500: '#CC2931',  // R60
          600: '#99171D',  // R70
          700: '#330000',  // R80 - Deep Red
        },
        // Gray/Brown scale (warm grays)
        'bp-gray': {
          50: '#FAF8F7',   // G10 - Lightest
          100: '#E6DEDA',  // G20
          200: '#CCC1BC',  // G30
          300: '#B2A59F',  // G40
          400: '#98847A',  // G50
          500: '#806659',  // G60 - Darkest
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'bp-gradient': 'linear-gradient(135deg, #330000 0%, #99171D 50%, #330000 100%)',
        'bp-gradient-light': 'linear-gradient(135deg, #FF3D47 0%, #CC2931 100%)',
      },
      boxShadow: {
        'bp': '0 4px 14px 0 rgba(255, 61, 71, 0.25)',
        'bp-lg': '0 10px 40px 0 rgba(51, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
