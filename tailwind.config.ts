import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: '#00D9FF',
        'dark-bg': '#1a1a1a',
        'dark-secondary': '#2a2a2a',
      },
    },
  },
  plugins: [animate],
};
export default config;
