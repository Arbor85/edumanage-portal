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
        accent: {
          DEFAULT: '#FF6B35',
          dark: '#E55A25',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F8FA',
          dark: '#141720',
          page: '#0D0F12',
          // Adaptive: defined as CSS variables, respond to .dark class
          card:     'rgb(var(--color-surface-card)     / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
          input:    'rgb(var(--color-surface-input)    / <alpha-value>)',
        },
        text: {
          primary: '#1A1D23',
          secondary: '#8B92A5',
          inverse: '#FFFFFF',
          muted: '#4A5168',
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
            background: '#252A3A',
            borderRadius: '9999px',
          },
        },
        '.shadow-glow': {
          boxShadow: '0 0 20px rgba(0, 200, 150, 0.15)',
        },
        '.shadow-glow-accent': {
          boxShadow: '0 0 20px rgba(255, 107, 53, 0.2)',
        },
      })
    }),
  ],
} satisfies Config
