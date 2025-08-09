/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poker-green': '#35654d',
        'poker-felt': '#2d5a3d',
        'card-red': '#dc2626',
        'card-black': '#1f2937',
      }
    },
  },
  plugins: [],
}

