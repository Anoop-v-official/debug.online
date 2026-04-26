import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        'surface-2': '#181818',
        border: '#262626',
        'border-strong': '#383838',
        accent: '#00ff88',
        'accent-dim': '#00cc6a',
        text: '#ededed',
        muted: '#9a9a9a',
        subtle: '#6f6f6f',
        warning: '#f5a623',
        error: '#ff5e5e',
      },
      fontFamily: {
        sans: ['"Geist Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', '1rem'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,255,136,0.25), 0 0 24px -8px rgba(0,255,136,0.45)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px #1f1f1f',
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
