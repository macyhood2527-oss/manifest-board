/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 45px -24px rgba(76, 57, 36, 0.28), 0 12px 22px -18px rgba(122, 93, 58, 0.22)',
        card: '0 30px 50px -28px rgba(72, 49, 28, 0.3), 0 10px 20px -16px rgba(122, 93, 58, 0.18)',
        paper: '0 16px 28px -18px rgba(88, 63, 37, 0.28), 0 6px 14px -10px rgba(135, 103, 68, 0.2)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
}
