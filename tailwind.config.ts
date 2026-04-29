import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#0f0f15',
        'surface-2': '#15151c',
        border: '#26262e',
        'border-strong': '#383842',
        accent: '#00ff88',
        'accent-dim': '#00cc6a',
        cyan: '#00e0ff',
        text: '#ededed',
        muted: '#9a9aa5',
        subtle: '#6f6f7a',
        warning: '#f5a623',
        error: '#ff5e5e',
        // Role colors
        'role-backend': '#00e0ff',
        'role-frontend': '#f5a623',
        'role-devops': '#ff5e5e',
        'role-sysadmin': '#00ff88',
        'role-security': '#c084fc',
        'role-trending': '#fbbf24',
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Syne"', '"JetBrains Mono"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'scanlines':
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
        'grid-fade':
          'radial-gradient(circle at 50% 0%, rgba(0,255,136,0.08), transparent 60%)',
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
        'blink': 'blink 1.1s steps(1) infinite',
        'ticker': 'ticker 40s linear infinite',
        'glow-line': 'glow-line 4s ease-in-out infinite',
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
        'blink': {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'glow-line': {
          '0%, 100%': { opacity: '0.4', transform: 'translateX(-100%)' },
          '50%': { opacity: '1', transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
