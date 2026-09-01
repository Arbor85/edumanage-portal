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
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
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
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        // Tabular numbers for data displays
        '.tabular-nums': {
          'font-variant-numeric': 'tabular-nums',
        },
        // Text balance for headings
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        // Tinted shadow using CSS var
        '.shadow-card': {
          boxShadow: 'var(--shadow-card)',
        },
        '.shadow-raised': {
          boxShadow: 'var(--shadow-raised)',
        },
        '.shadow-float': {
          boxShadow: 'var(--shadow-float)',
        },
        // Green glow
        '.shadow-glow': {
          boxShadow: '0 0 0 1px rgba(0,200,150,0.15), 0 4px 16px rgba(0,200,150,0.15)',
        },
        '.shadow-glow-sm': {
          boxShadow: '0 0 0 1px rgba(0,200,150,0.1), 0 2px 8px rgba(0,200,150,0.12)',
        },
        '.shadow-glow-accent': {
          boxShadow: '0 0 20px rgba(255, 107, 53, 0.2)',
        },
        // Glass effect
        '.glass': {
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px) saturate(1.5)',
          '-webkit-backdrop-filter': 'blur(12px) saturate(1.5)',
        },
        '.glass-dark': {
          background: 'rgba(20,23,32,0.75)',
          backdropFilter: 'blur(12px) saturate(1.4)',
          '-webkit-backdrop-filter': 'blur(12px) saturate(1.4)',
        },
        // Custom scrollbar (moved from CSS so it applies via Tailwind class)
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: '#d1d5db',
            borderRadius: '9999px',
          },
        },
        '.dark .custom-scrollbar': {
          '&::-webkit-scrollbar-thumb': {
            background: '#252A3A',
          },
        },
      })
    }),
  ],
} satisfies Config
