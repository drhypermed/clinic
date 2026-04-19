import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  // Prevent Tailwind from treating this regex character class as an arbitrary utility.
  blocklist: ['[-:|\u060C]'],
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Droid Arabic Kufi', 'Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
