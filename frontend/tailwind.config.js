/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        padel: {
          pink: '#D4649A',
          'pink-light': '#E8A0C0',
          'pink-dark': '#B84D80',
          'pink-bg': '#FDF0F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
