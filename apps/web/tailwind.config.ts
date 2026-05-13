import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: '#FF2D2D', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#0A0A0A', foreground: '#FFFFFF' },
        muted: { DEFAULT: '#1a1a1a', foreground: '#888888' },
        accent: { DEFAULT: '#00FF9C', foreground: '#0A0A0A' },
        destructive: { DEFAULT: '#FF2D2D', foreground: '#FFFFFF' },
        'cyber-black': '#0A0A0A',
        'cyber-red': '#FF2D2D',
        'cyber-green': '#00FF9C',
        'cyber-gray': '#1a1a1a',
        'cyber-border': '#2a2a2a',
      },
      boxShadow: {
        'glow-green': '0 0 10px #00FF9C, 0 0 20px rgba(0,255,156,0.3)',
        'glow-red': '0 0 10px #FF2D2D, 0 0 20px rgba(255,45,45,0.3)',
        'glow-green-sm': '0 0 6px rgba(0,255,156,0.6)',
        'glow-red-sm': '0 0 6px rgba(255,45,45,0.6)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px #00FF9C, 0 0 10px rgba(0,255,156,0.3)' },
          '50%': { boxShadow: '0 0 15px #00FF9C, 0 0 30px rgba(0,255,156,0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.375rem' },
    },
  },
  plugins: [],
};

export default config;
