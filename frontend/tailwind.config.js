/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: { DEFAULT: '#00ffff', dark: '#0a0a0f', light: '#1a1a2e', panel: '#12121f' },
      },
    },
  },
  plugins: [],
};
