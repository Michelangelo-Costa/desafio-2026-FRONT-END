/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D2B5E',
          mid: '#1B4F8A',
          light: '#2563A8',
        },
        teal: {
          DEFAULT: '#00B4A6',
          light: '#4ECDC4',
        },
        siapesq: {
          green: '#8DC63F',
          surface: '#F5F8FF',
          border: '#D6E4F0',
          muted: '#6B7F99',
          dark: '#1A2E4A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(13,43,94,0.08)',
        'card-hover': '0 8px 40px rgba(13,43,94,0.16)',
      },
    },
  },
  plugins: [],
}
