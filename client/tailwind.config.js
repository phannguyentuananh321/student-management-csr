/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFD700',
          hover: '#E5C100',
          light: '#FFF9D6',
          dark: '#B29500'
        },
        dark: {
          900: '#111215',
          800: '#1C1E22',
          700: '#2A2D34',
          600: '#40444D',
          500: '#686D76'
        },
        surface: {
          50: '#FBFBFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        sharp: '4px 4px 0px 0px rgba(17, 18, 21, 1)',
        'sharp-sm': '2px 2px 0px 0px rgba(17, 18, 21, 1)',
        'sharp-gold': '4px 4px 0px 0px #FFD700',
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}
