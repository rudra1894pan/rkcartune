/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        asphalt: '#0E0F11',
        panel: '#17181B',
        'panel-hover': '#1F2124',
        line: '#2A2B2F',
        'text-primary': '#F5F5F0',
        'text-muted': '#93949A',
        tuner: {
          orange: '#FF5A1F',
          'orange-dim': '#7A2A0D',
        },
        nitro: {
          lime: '#C9FF3D',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.15em',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px -12px rgba(0,0,0,0.7)',
        glow: '0 0 24px -4px rgba(255, 90, 31, 0.4)',
      },
      backgroundImage: {
        'diagonal-stripes':
          'repeating-linear-gradient(45deg, rgba(255,90,31,0.08) 0, rgba(255,90,31,0.08) 2px, transparent 2px, transparent 12px)',
      },
    },
  },
  plugins: [],
};
