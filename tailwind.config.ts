import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: '#071D16',
          dark: '#0E3529',
          mid: '#4B8A6C',
          cream: '#E7DDC6',
          gold: '#B89B4A',
          'gold-light': '#D4BA6A',
          'cream-dark': '#C9BFA6',
          'green-light': '#6BA88A',
        },
        surface: {
          DEFAULT: '#071D16',
          100: '#0B2A1F',
          200: '#0E3529',
          300: '#153F31',
          400: '#1C4E3D',
          500: '#215F47',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Sora"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-left': 'slideLeft 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right': 'slideRight 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideLeft: {
          from: { opacity: '0', transform: 'translateX(60px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-60px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4', boxShadow: '0 0 20px rgba(184,155,74,0.2)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(184,155,74,0.4)' },
        },
        shimmer: {
          from: { backgroundPosition: '-1000px 0' },
          to: { backgroundPosition: '1000px 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(ellipse at 20% 50%, rgba(75,138,108,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(184,155,74,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(33,95,71,0.2) 0%, transparent 50%)',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.15)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(75,138,108,0.2)',
        'gold': '0 0 20px rgba(184,155,74,0.15), 0 0 60px rgba(184,155,74,0.05)',
        'glow-green': '0 0 40px rgba(75,138,108,0.15)',
        'inner': 'inset 0 1px 0 rgba(231,221,198,0.05)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
