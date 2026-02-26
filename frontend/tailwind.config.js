/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        warm: {
          25:  '#fdfbf9',
          50:  '#faf7f4',
          100: '#f5f0ea',
          200: '#ebe3d9',
          300: '#d9cdbf',
          400: '#b8a994',
          500: '#9a8b78',
          600: '#7a6c5c',
          700: '#5c524a',
          800: '#3d3028',
          900: '#1f1810',
        },
        accent: {
          coral:  '#e07a5f',
          amber:  '#e6a54a',
          sage:   '#81b29a',
          blue:   '#5b8fb9',
          plum:   '#8b5cf6',
          rose:   '#e05c8c',
        }
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      }
    }
  },
  plugins: [],
}
