/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'move-image': 'moveImage 3s ease-in-out infinite',
      },
      keyframes: {
        moveImage: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.05) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
