import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── AeroDark Intelligence — Stitch Color System ──
        'background':                '#111318',
        'surface':                   '#111318',
        'surface-dim':               '#111318',
        'surface-bright':            '#37393e',
        'surface-container-lowest':  '#0c0e12',
        'surface-container-low':     '#1a1c20',
        'surface-container':         '#1e2024',
        'surface-container-high':    '#282a2e',
        'surface-container-highest': '#333539',
        'surface-variant':           '#333539',
        'surface-tint':              '#00dbe9',
        'on-surface':                '#e2e2e8',
        'on-surface-variant':        '#b9cacb',
        'on-background':             '#e2e2e8',
        'inverse-surface':           '#e2e2e8',
        'inverse-on-surface':        '#2f3035',
        'outline':                   '#849495',
        'outline-variant':           '#3b494b',
        // Primary — Neon Cyan
        'primary':                   '#dbfcff',
        'on-primary':                '#00363a',
        'primary-container':         '#00f0ff',
        'on-primary-container':      '#006970',
        'inverse-primary':           '#006970',
        'primary-fixed':             '#7df4ff',
        'primary-fixed-dim':         '#00dbe9',
        'on-primary-fixed':          '#002022',
        'on-primary-fixed-variant':  '#004f54',
        // Secondary — Cyber Purple
        'secondary':                 '#d1bcff',
        'on-secondary':              '#3c0090',
        'secondary-container':       '#7000ff',
        'on-secondary-container':    '#ddcdff',
        'secondary-fixed':           '#e9ddff',
        'secondary-fixed-dim':       '#d1bcff',
        'on-secondary-fixed':        '#23005b',
        'on-secondary-fixed-variant':'#5700c9',
        // Tertiary — Neon Pink
        'tertiary':                  '#fff3f3',
        'on-tertiary':               '#67001d',
        'tertiary-container':        '#ffcdd0',
        'on-tertiary-container':     '#be003d',
        'tertiary-fixed':            '#ffdadb',
        'tertiary-fixed-dim':        '#ffb2b8',
        'on-tertiary-fixed':         '#40000f',
        'on-tertiary-fixed-variant': '#91002d',
        // Error
        'error':                     '#ffb4ab',
        'on-error':                  '#690005',
        'error-container':           '#93000a',
        'on-error-container':        '#ffdad6',
        // Severity
        'sev-severe':   '#ff4444',
        'sev-high':     '#ff8800',
        'sev-elevated': '#ffcc00',
        'sev-moderate': '#44aaff',
        'sev-low':      '#00dbe9',
      },
      fontFamily: {
        'mono':      ['JetBrains Mono', 'monospace'],
        'sans':      ['Geist', 'system-ui', 'sans-serif'],
        'headline':  ['JetBrains Mono', 'monospace'],
        'label':     ['JetBrains Mono', 'monospace'],
        'data':      ['JetBrains Mono', 'monospace'],
        'body':      ['Geist', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', letterSpacing: '0.02em', fontWeight: '600' }],
        'label-sm':  ['11px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '500' }],
        'data-mono': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'body-md':   ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
      borderRadius: {
        DEFAULT: '0.125rem',   // 2px — technical feel
        sm:      '0.125rem',
        md:      '0.25rem',    // 4px
        lg:      '0.375rem',   // 6px
        xl:      '0.5rem',     // 8px
        '2xl':   '0.75rem',
        full:    '9999px',
      },
      spacing: {
        'unit':          '4px',
        'stack-tight':   '4px',
        'stack-md':      '12px',
        'gutter':        '12px',
        'panel-padding': '16px',
        'margin-edge':   '20px',
      },
      boxShadow: {
        'cyan-sm':  '0 0 8px rgba(0, 240, 255, 0.3)',
        'cyan-md':  '0 0 15px rgba(0, 240, 255, 0.4)',
        'cyan-lg':  '0 0 30px rgba(0, 240, 255, 0.25)',
        'red-sm':   '0 0 8px rgba(255, 68, 68, 0.4)',
        'amber-sm': '0 0 8px rgba(255, 136, 0, 0.4)',
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'hud-in':     'hud-in 0.3s ease-out',
        'scanline':   'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
        'hud-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
