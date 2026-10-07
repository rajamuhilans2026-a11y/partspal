/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#18382b',
        green: '#397b52',
        lime: '#c9ed75',
        paper: '#f6f7f3',
        ink: '#17231e',
        muted: '#78847d',
        line: '#e6e9e3',
        soft: '#f5f7f2',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 3px 16px rgba(26, 45, 34, 0.045)',
      },
    },
  },
  plugins: [],
};
