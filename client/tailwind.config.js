/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['Roboto', 'sans-serif'],
      'display': ['Roboto'],
      'roboto': ['Roboto', 'sans-serif'],
    },
    extend: {
      colors: {
        'almond': '#F8E9D3',
        'green': '#008000',
      },
      animation: {
        bounceHigh: 'bounceHigh 1.5s ease-in-out infinite',
        'caret-blink': 'caret-blink 1.2s ease-out infinite',
      },
      keyframes: {
        bounceHigh: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }, // Increased the bounce height
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      }
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