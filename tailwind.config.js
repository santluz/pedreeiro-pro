/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E67E22',
          dark:    '#C0641A',
          light:   '#FEF3E8',
        },
      },
    },
  },
  plugins: [],
}
