/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        nprogress: {
          from: {
            transform: 'translateX(-100%)'
          },
          to: {
            transform: 'translateX(100%)'
          }
        },
      },
      animation: {
        nprogress: 'nprogress 1.5s ease-out infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp')
  ],
}