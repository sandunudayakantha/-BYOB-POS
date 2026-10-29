/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#f59e0b',
          hover: '#d97706',
          light: '#fef3c7',
          contrast: '#0c0a09',
        },
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          500: '#78716c',
          900: '#1c1917',
        },
        feedback: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        dark: {
          50: '#fafaf9',
          100: '#f5f5f4',
          800: '#1c1917',
          900: '#141210',
          950: '#0c0a09',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-amber': '0 0 25px -5px rgba(245, 158, 11, 0.2)',
        'amber-glow': '0 0 40px -10px rgba(245, 158, 11, 0.35)',
      },
      spacing: {
        'form-field': '1.25rem',
        'form-section': '2rem',
      },
      width: {
        'modal-sm': '24rem',
        'modal-md': '32rem',
        'modal-lg': '48rem',
        'drawer-md': '28rem',
      },
      borderRadius: {
        token: '0.75rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
