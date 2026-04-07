/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── M3 Surface System ──
        background: '#f9f9f9',
        surface: '#f9f9f9',
        'surface-bright': '#f9f9f9',
        'surface-dim': '#d4dbdd',
        'surface-tint': '#586062',
        'surface-variant': '#dde4e5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f4',
        'surface-container': '#ebeeef',
        'surface-container-high': '#e4e9ea',
        'surface-container-highest': '#dde4e5',

        // ── Primary ──
        primary: '#586062',
        'primary-hover': '#475052',
        'primary-dim': '#4c5456',
        'primary-light': 'rgba(88,96,98,0.08)',
        'primary-container': '#dde4e6',
        'primary-fixed': '#dde4e6',
        'primary-fixed-dim': '#cfd6d8',
        'on-primary': '#f2f9fb',
        'on-primary-container': '#4c5355',
        'on-primary-fixed': '#394043',
        'on-primary-fixed-variant': '#565d5f',
        'inverse-primary': '#f1f8fa',

        // ── Secondary ──
        secondary: '#566165',
        'secondary-dim': '#4a5559',
        'secondary-container': '#d9e4e9',
        'secondary-fixed': '#d9e4e9',
        'secondary-fixed-dim': '#cbd6db',
        'on-secondary': '#f0fbff',
        'on-secondary-container': '#495357',
        'on-secondary-fixed': '#364145',
        'on-secondary-fixed-variant': '#525d61',

        // ── Tertiary (Accent) ──
        tertiary: '#0061aa',
        'tertiary-dim': '#005596',
        'tertiary-container': '#3f9eff',
        'tertiary-fixed': '#3f9eff',
        'tertiary-fixed-dim': '#2a91f1',
        'on-tertiary': '#f8f8ff',
        'on-tertiary-container': '#001e3b',
        'on-tertiary-fixed': '#000000',
        'on-tertiary-fixed-variant': '#00284c',
        accent: '#0061aa',
        'accent-light': 'rgba(0,97,170,0.1)',

        // ── Error ──
        error: '#9f403d',
        'error-dim': '#4e0309',
        'error-container': '#fe8983',
        'on-error': '#fff7f6',
        'on-error-container': '#752121',
        danger: '#9f403d',

        // ── Neutral / Text ──
        'on-surface': '#2d3435',
        'on-surface-variant': '#5a6061',
        'on-background': '#2d3435',
        outline: '#757c7d',
        'outline-variant': '#adb3b4',
        'inverse-surface': '#0c0f0f',
        'inverse-on-surface': '#9c9d9d',

        // ── Utility ──
        success: '#22c55e',
        warning: '#f59e0b',

        // ── Simplified aliases (used by components) ──
        'surface-card': '#ffffff',
        'text-primary': '#2d3435',
        'text-secondary': '#5a6061',
        'text-muted': 'rgba(45,52,53,0.45)',
        border: 'transparent',
        'border-light': 'transparent',
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        headline: ['"Manrope"', 'system-ui', 'sans-serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
        label: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '3rem',
      },
      boxShadow: {
        sm: '0 2px 12px rgba(45,52,53,0.04)',
        card: '0 10px 40px rgba(45,52,53,0.06)',
        'card-hover': '0 15px 50px rgba(45,52,53,0.09)',
        dropdown: '0 12px 44px rgba(45,52,53,0.08)',
        lg: '0 10px 40px rgba(45,52,53,0.10)',
        xl: '0 20px 60px rgba(45,52,53,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-6px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
