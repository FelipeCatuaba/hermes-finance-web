/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: 'var(--color-canvas)',
          1: 'var(--color-surface-soft)',
          2: 'var(--color-surface-dark)',
          3: 'var(--color-surface-strong)',
          4: 'var(--color-surface-dark-elevated)'
        },
        text: {
          1: 'var(--color-ink)',
          2: 'var(--color-body)',
          3: 'var(--color-muted)'
        },
        blue: {
          300: 'var(--color-primary-soft)',
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary-active)'
        },
        teal: 'var(--color-accent-teal)',
        cyan: 'var(--color-accent-cyan)',
        amber: 'var(--color-accent-amber)',
        rose: 'var(--color-semantic-down)',
        brand: {
          primary: 'var(--color-primary)',
          ink: 'var(--color-ink)',
          canvas: 'var(--color-canvas)',
          dark: 'var(--color-surface-dark)',
          soft: 'var(--color-surface-soft)'
        }
      },
      borderRadius: {
        'brand-pill': 'var(--radius-pill)',
        'brand-xl': 'var(--radius-xl)'
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)'
      }
    }
  },
  plugins: []
};
