/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // BearingPoint Primary Colors
        bearing: {
          red: {
            DEFAULT: '#FF3D47', // R50 - Bearing Red (Primary)
            50: '#FF3D47',      // R50 - Bearing Red
            60: '#CC2931',      // R60
            70: '#99171D',      // R70
            80: '#330000',      // R80 - Deep Red
            40: '#FF787A',      // R40
            30: '#FFA3A8',      // R30
            20: '#FFBDC0',      // R20
            10: '#FFD6D8',      // R10
          },
          gray: {
            DEFAULT: '#98847A', // G50
            10: '#FAF8F7',      // G10 - Lightest
            20: '#E6DEDA',      // G20
            30: '#CCC1BC',      // G30
            40: '#B2A59F',      // G40
            50: '#98847A',      // G50
            60: '#806659',      // G60 - Darkest
          },
          black: '#000000',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'bearing-gradient': 'linear-gradient(135deg, #330000 0%, #FF3D47 100%)',
        'bearing-gradient-dark': 'linear-gradient(135deg, #1a0000 0%, #330000 50%, #99171D 100%)',
        'bearing-gradient-light': 'linear-gradient(135deg, #FF3D47 0%, #FFA3A8 100%)',
      },
      boxShadow: {
        'bearing': '0 4px 14px 0 rgba(255, 61, 71, 0.39)',
        'bearing-lg': '0 10px 40px 0 rgba(255, 61, 71, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
