import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        'button-primary': 'var(--button-primary)',
        'button-hover': 'var(--button-hover)',
        border: 'var(--border)',
        sand: 'var(--sand)',
      },
    },
  },
  plugins: [],
} satisfies Config;
