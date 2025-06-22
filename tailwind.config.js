/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // 혹시 public/index.html에서 tailwind를 쓸 경우 아래도 추가
    './public/index.html',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(50px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-50px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      // animation: {
      //   fadeIn: 'fadeIn 0.5s ease',
      //   slideInRight: 'slideInRight 0.4s ease',
      //   slideInLeft: 'slideInLeft 0.4s ease',
      // },
    },
  },
  plugins: [],
}
