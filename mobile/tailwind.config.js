/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#18181b',
        border: '#27272a',
        accent: '#a78bfa',
        'accent-dim': '#7c3aed',
        muted: '#71717a',
        foreground: '#fafafa',
      },
    },
  },
};
