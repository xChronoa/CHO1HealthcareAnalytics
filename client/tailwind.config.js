/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['Roboto', 'sans-serif'],
      'display': ['Poppins'],
      'roboto': ['Roboto', 'sans-serif'], // Replace 'Roboto' with your font name
    },
    extend: {
      colors: {
        'almond': '#F8E9D3',
        'green': '#008000',
      },
    },
  },
  plugins: [
    // Allow scrolling without displaying the scrollbar
    function ({ addUtilities }) {
        const newUtilities = {
            ".no-scrollbar::-webkit-scrollbar": {
                display: "none",
            },
            ".no-scrollbar": {
                "-ms-overflow-style": "none",
                "scrollbar-width": "none",
            },
        };
        addUtilities(newUtilities);
    },
  ],
}