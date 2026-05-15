import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00C896',
          light: '#E6FAF4',
          dark: '#00A67A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F8FA',
          dark: '#1A1D23',
        },
        text: {
          primary: '#1A1D23',
          secondary: '#6B7280',
          inverse: '#FFFFFF',
        },
        difficulty: {
          beginner: '#00C896',
          intermediate: '#F59E0B',
          advanced: '#EF4444',
        },
        delta: {
          positive: '#00C896',
          negative: '#EF4444',
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: '#D1D5DB',
            borderRadius: '9999px',
          },
        },
      })
    }),
  ],
} satisfies Config
