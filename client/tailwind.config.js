/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#EFF4FF', 100: '#DBE6FF', 200: '#BFD4FF', 300: '#93BCFF', 400: '#5B8CFF', 500: '#2A5CFF', 600: '#1E4AE6', 700: '#193CB8', 800: '#1A3890', 900: '#1A3472' },
        match: { s: '#2A5CFF', a: '#34C759', b: '#FF9500', c: '#8E8E93' }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
