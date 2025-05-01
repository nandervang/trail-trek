/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        '3xl': '1920px', // Large desktop/TV screens
        '4xl': '2560px', // 4K displays
      },
      fontSize: {
        // Custom large sizes for TV displays
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '4rem' }],
        '7xl': ['4.5rem', { lineHeight: '5rem' }],
        '8xl': ['6rem', { lineHeight: '6.5rem' }],
        '9xl': ['8rem', { lineHeight: '8.5rem' }],
      },
      colors: {
        // Primary colors (forest sage)
        primary: {
          50: '#f6f7f6',
          100: '#e7ebe7',
          200: '#d4dcd4',
          300: '#b5c2b5',
          400: '#95a695',
          500: '#788c78',
          600: '#5f715f',
          700: '#4d5b4d',
          800: '#3f483f',
          900: '#2d332d',
          950: '#1a1d1a',
        },
        // Secondary colors (stone gray)
        secondary: {
          50: '#f9f8f7',
          100: '#f0eee9',
          200: '#e1ded6',
          300: '#cbc5ba',
          400: '#b3aa9b',
          500: '#9c917f',
          600: '#867a68',
          700: '#6b6154',
          800: '#564e44',
          900: '#443e36',
          950: '#2a261f',
        },
        // Accent colors (nordic berry)
        accent: {
          50: '#fcf5f5',
          100: '#f9e5e5',
          200: '#f3d0d0',
          300: '#e9afaf',
          400: '#db8282',
          500: '#c85f5f',
          600: '#b44646',
          700: '#953838',
          800: '#7c3232',
          900: '#672e2e',
          950: '#381616',
        },
        // Success (pine)
        success: {
          50: '#f3f7f3',
          100: '#e4ede4',
          200: '#c8dbc8',
          300: '#9fc19f',
          400: '#73a073',
          500: '#558455',
          600: '#426842',
          700: '#365436',
          800: '#2d442d',
          900: '#253825',
          950: '#121f12',
        },
        // Warning (autumn)
        warning: {
          50: '#fdf8f3',
          100: '#f9ebe0',
          200: '#f2d4bc',
          300: '#e9b68e',
          400: '#e09662',
          500: '#d67941',
          600: '#c45e2b',
          700: '#a34824',
          800: '#833a22',
          900: '#6b311e',
          950: '#391813',
        },
        // Error (lingonberry)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'md': '0 8px 16px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 16px 24px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}