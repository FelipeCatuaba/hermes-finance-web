/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
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