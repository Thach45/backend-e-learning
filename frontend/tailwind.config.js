/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5645d4',
          pressed: '#4534b3',
          deep: '#3a2a99',
        },
        'brand-navy': {
          DEFAULT: '#0a1530',
          deep: '#070f24',
          mid: '#1a2a52',
        },
        'notion-ink': '#1a1a1a',
        'notion-charcoal': '#37352f',
        'notion-slate': '#5d5b54',
        'notion-steel': '#787671',
        tint: {
          peach: '#ffe8d4',
          rose: '#fde0ec',
          mint: '#d9f3e1',
          lavender: '#e6e0f5',
          sky: '#dcecfa',
          yellow: '#fef7d6',
          'yellow-bold': '#f9e79f',
        }
      },
      borderRadius: {
        'notion-md': '8px',
        'notion-lg': '12px',
      },
      fontFamily: {
        sans: ['"Notion Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

