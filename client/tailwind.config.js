/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We will add VGLGI/EVE colors here later
        'eve-dark': '#0b0b0b',
        'eve-primary': '#dba511', // Example generic gold
      }
    },
  },
  plugins: [],
}
