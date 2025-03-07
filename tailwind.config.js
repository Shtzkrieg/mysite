/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/index.css",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#202C39',
          light: '#283845'
        },
        accent: {
          sand: '#B8B08D',
          gold: '#F2D492',
          orange: '#F29559'
        }
      }
    },
  },
  plugins: [],
} 