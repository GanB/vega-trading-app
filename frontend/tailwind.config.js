/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vega: {
          dark: '#00296b',
          primary: '#003566',
          accent: '#fdc500',
          light: '#f7f7ff',
          surface: '#edf2fb',
        },
      },
    },
  },
  plugins: [],
}
