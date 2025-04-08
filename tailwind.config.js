/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      keyframes: {
        dots: {
          '0%, 20%': { opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'dots': 'dots 1.5s infinite',
        'spin': 'spin 1s linear infinite',
      },
      transitionDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}

