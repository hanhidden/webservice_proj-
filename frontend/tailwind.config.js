/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    theme: {
    extend: {
      colors: {
        navy: {
          800: '#1f2937',
          900: '#111827',
        },
        gold: {
          400: '#ffd700',
          500: '#e6b800',
          600: '#cc9900',
        },
      },
    },
  },
  plugins: [],
}

