/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'display': ['Poppins']
    },
    extend: {
      colors: {
        'almond': '#F8E9D3',
        'green': '#008000',
      },
    },
  },
  plugins: [],
}