/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── CSS-variable-driven (change design-system.css to update) ──
        'sidebar-border':           'var(--sidebar-border-color)',
        background:                 'var(--color-bg)',
        surface:                    'var(--color-surface)',
        muted:                      'var(--color-muted)',

        primary:                    'var(--color-primary)',
        'primary-dark':             'var(--color-primary-dark)',

        tertiary:                   'var(--color-accent)',
        'tertiary-dim':             'var(--color-accent-dark)',
        accent:                     'var(--color-accent)',
        'accent-dark':              'var(--color-accent-dark)',

        'on-surface':               'var(--color-text)',
        'on-surface-variant':       'var(--color-text-muted)',
        'on-background':            'var(--color-text)',
        'outline-variant':          'var(--color-text-faint)',

        success:                    'var(--color-success)',
        warning:                    'var(--color-warning)',
        error:                      'var(--color-error)',
        danger:                     'var(--color-error)',

        'surface-container-lowest': 'var(--color-container-lowest)',
        'surface-container-low':    'var(--color-container-low)',
        'surface-container':        'var(--color-container)',
        'surface-container-high':   'var(--color-container-high)',
        'surface-container-highest':'var(--color-container-highest)',

        'surface-card':             'var(--color-surface)',
        'text-primary':             'var(--color-text)',
        'text-secondary':           'var(--color-text-muted)',

        // ── M3 system (less likely to change, kept as hex) ──
        'surface-bright':           '#f9f9f9',
        'surface-dim':              '#D6DCE0',
        'surface-tint':             '#727A84',
        'surface-variant':          '#D6DCE0',

        'primary-hover':            '#1E2A3A',
        'primary-dim':              '#162033',
        'primary-light':            'rgba(12,22,41,0.08)',
        'primary-container':        '#D6DCE0',
        'primary-fixed':            '#D6DCE0',
        'primary-fixed-dim':        '#B5C1C8',
        'on-primary':               '#F0F3F3',
        'on-primary-container':     '#727A84',
        'on-primary-fixed':         '#394043',
        'on-primary-fixed-variant': '#727A84',
        'inverse-primary':          '#F0F3F3',

        secondary:                  '#727A84',
        'secondary-dim':            '#5D6670',
        'secondary-container':      '#D6DCE0',
        'secondary-fixed':          '#D6DCE0',
        'secondary-fixed-dim':      '#B5C1C8',
        'on-secondary':             '#F0F3F3',
        'on-secondary-container':   '#727A84',
        'on-secondary-fixed':       '#364145',
        'on-secondary-fixed-variant':'#727A84',

        'tertiary-container':       '#3f9eff',
        'tertiary-fixed':           '#3f9eff',
        'tertiary-fixed-dim':       '#2a91f1',
        'on-tertiary':              '#f8f8ff',
        'on-tertiary-container':    '#001e3b',
        'on-tertiary-fixed':        '#000000',
        'on-tertiary-fixed-variant':'#00284c',
        'accent-light':             'rgba(12,22,41,0.1)',

        'error-dim':                '#4e0309',
        'error-container':          '#fe8983',
        'on-error':                 '#fff7f6',
        'on-error-container':       '#752121',

        outline:                    '#757c7d',
        'inverse-surface':          '#0c0f0f',
        'inverse-on-surface':       '#9c9d9d',
        'text-muted':               'rgba(12,22,41,0.45)',
        border:                     'transparent',
        'border-light':             'transparent',
      },

      fontFamily: {
        sans:     ['var(--font-sans)'],
        heading:  ['var(--font-heading)'],
        headline: ['var(--font-heading)'],
        body:     ['var(--font-sans)'],
        label:    ['var(--font-sans)'],
        mono:     ['var(--font-mono)'],
      },

      borderRadius: {
        DEFAULT: 'var(--radius-default)',
        lg:      'var(--radius-lg)',
        xl:      'var(--radius-xl)',
        '2xl':   'var(--radius-2xl)',
      },

      boxShadow: {
        sm:          'var(--shadow-sm)',
        card:        'var(--shadow-card)',
        'card-hover':'var(--shadow-card-hover)',
        dropdown:    'var(--shadow-dropdown)',
        lg:          'var(--shadow-lg)',
        xl:          'var(--shadow-xl)',
      },

      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0', transform: 'translateY(4px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-6px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
