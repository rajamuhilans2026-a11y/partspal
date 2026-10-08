/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#17363a',
        green: '#2f725f',
        lime: '#c9ed75',
        paper: '#f4f6f2',
        ink: '#17282c',
        muted: '#718087',
        line: '#e1e8e5',
        soft: '#f3f7f4',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 28px rgba(24, 48, 42, 0.055)',
      },
    },
  },
  plugins: [],
};
