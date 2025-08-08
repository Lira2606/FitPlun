import type {Config} from 'tailwindcss';

export default {
  content: [
    './public/index.html',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {},
  plugins: [],
} satisfies Config;
