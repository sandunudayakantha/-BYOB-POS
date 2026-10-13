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
          main: '#10b981',
          hover: '#059669',
          light: '#ecfdf5',
          contrast: '#ffffff',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          900: '#0f172a',
        },
        feedback: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e1e3e5',
          800: '#171923',
          900: '#0f111a',
          950: '#090a0f',
        },
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
