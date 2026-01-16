/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif'],
      },
      colors: {
        glass: {
          bg: 'rgba(20, 20, 20, 0.6)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      }
    },
  },
  plugins: [],
}