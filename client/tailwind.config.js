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
    function ({ addComponents, theme, e }) {
      addComponents({
        '.empty-before::before': {
          content: '"*"',
          color: '#F8E9D3',
        },
        '.empty-before::before': {
          content: '"*"',
          color: '#F8E9D3',
        },
        '.empty-after::after': {
          content: '"*"',
          color: '#F8E9D3',
        },
        
        // Before
        '.required-label-before::before': {
          content: '"*"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.sm\\:required-label-before::before': {
          content: '"*"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.md\\:required-label-before::before': {
          content: '"*"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.lg\\:required-label-before::before': {
          content: '"*"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.xl\\:required-label-before::before': {
          content: '"*"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.2xl\\:required-label-before::before': {
          content: '"*"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },

        // After
        '.required-label-after::after': {
          content: '" *"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.sm\\:required-label-after::after': {
          content: '" *"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.md\\:required-label-after::after': {
          content: '" *"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.lg\\:required-label-after::after': {
          content: '" *"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.xl\\:required-label-after::after': {
          content: '" *"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
        '.2xl\\:required-label-after::after': {
          content: '" *"',
          color: '#ff0000',
          fontWeight: 'bold',
          marginLeft: '4px',
        },
      });
    },
  ],
}