/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nectr: {
          50: '#FFF9E5',
          100: '#FFE4CC',
          200: '#FFD1B3',
          300: '#FFBE99',
          400: '#FF9966', // Primary brand color
          500: '#FF7733',
          600: '#FF5500',
          700: '#CC4400',
          800: '#993300',
          900: '#662200',
        },
        cyber: {
          black: '#0A0A0F',
          dark: '#13131A',
          card: '#1C1C24',
          border: '#2D2D35',
          accent: '#FF5500',
        },
        glow: {
          primary: '#FF5500',
          secondary: '#FFB899',
        }
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 85, 0, 0.5)',
        'neon-strong': '0 0 30px rgba(255, 85, 0, 0.8)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [],
}